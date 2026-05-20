(function () {
  const VOL_MULTIPLIER = {
    low: { missStreak: 0.7, winStreak: 1.25, variance: 0.45, bustLift: 0.8, spread: 0.22 },
    medium: { missStreak: 1, winStreak: 1, variance: 0.75, bustLift: 1, spread: 0.5 },
    high: { missStreak: 1.35, winStreak: 0.78, variance: 1.25, bustLift: 1.25, spread: 1.1 }
  };

  const BONUS_SHARE_BY_VOLATILITY = {
    low: 0.1,
    medium: 0.18,
    high: 0.3
  };

  const PAYOUT_BUCKETS_BY_VOLATILITY = {
    low: {
      base: [
        { probability: 0.55, multiplier: 0.7 },
        { probability: 0.3, multiplier: 1.1 },
        { probability: 0.12, multiplier: 1.8 },
        { probability: 0.03, multiplier: 2.8 }
      ],
      bonus: [
        { probability: 0.7, multiplier: 2.5 },
        { probability: 0.23, multiplier: 4.5 },
        { probability: 0.07, multiplier: 7.5 }
      ]
    },
    medium: {
      base: [
        { probability: 0.46, multiplier: 0.7 },
        { probability: 0.32, multiplier: 1.5 },
        { probability: 0.16, multiplier: 2.8 },
        { probability: 0.06, multiplier: 5 }
      ],
      bonus: [
        { probability: 0.58, multiplier: 4 },
        { probability: 0.28, multiplier: 8 },
        { probability: 0.11, multiplier: 14 },
        { probability: 0.03, multiplier: 24 }
      ]
    },
    high: {
      base: [
        { probability: 0.4, multiplier: 0.6 },
        { probability: 0.3, multiplier: 1.7 },
        { probability: 0.2, multiplier: 3.8 },
        { probability: 0.08, multiplier: 8 },
        { probability: 0.02, multiplier: 15 }
      ],
      bonus: [
        { probability: 0.5, multiplier: 6 },
        { probability: 0.26, multiplier: 13 },
        { probability: 0.15, multiplier: 22 },
        { probability: 0.07, multiplier: 38 },
        { probability: 0.02, multiplier: 70 }
      ]
    }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function toPercent(decimal, digits = 1) {
    return `${(Number(decimal) * 100).toFixed(digits)}%`;
  }

  function getPresetById(id) {
    const list = window.SLOT_PRESETS || [];
    return list.find((preset) => preset.id === id) || list[0];
  }

  const SLOT_SYMBOLS = ["7", "BAR", "🔔", "🍒", "🍋", "♦", "☠", "♠"];

  function getRtpTargets(preset) {
    const bonusShare = clamp(BONUS_SHARE_BY_VOLATILITY[preset.volatility] ?? 0.18, 0, 0.9);
    const bonusExpectedRtp = preset.rtp * bonusShare;
    const baseExpectedRtp = preset.rtp - bonusExpectedRtp;
    return { baseExpectedRtp, bonusExpectedRtp };
  }

  function getBucketAverage(buckets) {
    return buckets.reduce((sum, bucket) => sum + bucket.probability * bucket.multiplier, 0);
  }

  function scaleBucketsToAverage(rawBuckets, targetAverage, maxMultiplier) {
    const cappedRaw = rawBuckets.map((bucket) => ({
      probability: bucket.probability,
      multiplier: clamp(bucket.multiplier, 0, maxMultiplier)
    }));

    const rawAverage = getBucketAverage(cappedRaw);
    if (rawAverage <= 0 || targetAverage <= 0) {
      return cappedRaw.map((bucket) => ({ ...bucket, multiplier: 0 }));
    }

    const scale = targetAverage / rawAverage;
    const scaled = cappedRaw.map((bucket) => ({
      probability: bucket.probability,
      multiplier: clamp(bucket.multiplier * scale, 0, maxMultiplier)
    }));

    const scaledAverage = getBucketAverage(scaled);
    if (scaledAverage > 0 && Math.abs(scaledAverage - targetAverage) > 0.0001) {
      const correction = targetAverage / scaledAverage;
      return scaled.map((bucket) => ({
        probability: bucket.probability,
        multiplier: clamp(bucket.multiplier * correction, 0, maxMultiplier)
      }));
    }

    return scaled;
  }

  function getCalibratedPayoutModel(preset) {
    const targets = getRtpTargets(preset);
    const baseTargetAverage = targets.baseExpectedRtp / Math.max(0.0001, preset.hitFrequency);
    const bonusTargetAverage = targets.bonusExpectedRtp / Math.max(0.0001, preset.bonusRate);

    const templates = PAYOUT_BUCKETS_BY_VOLATILITY[preset.volatility] || PAYOUT_BUCKETS_BY_VOLATILITY.medium;
    const baseBuckets = scaleBucketsToAverage(templates.base, baseTargetAverage, preset.maxWinMulti);
    const bonusBuckets = scaleBucketsToAverage(templates.bonus, bonusTargetAverage, preset.maxWinMulti);

    return {
      baseBuckets,
      bonusBuckets,
      baseAverage: getBucketAverage(baseBuckets),
      bonusAverage: getBucketAverage(bonusBuckets)
    };
  }

  function sampleFromBuckets(buckets) {
    const roll = Math.random();
    let running = 0;
    for (let i = 0; i < buckets.length; i += 1) {
      running += buckets[i].probability;
      if (roll <= running || i === buckets.length - 1) {
        return buckets[i].multiplier;
      }
    }
    return 0;
  }

  function pickDifferentSymbol(excluded) {
    const choices = SLOT_SYMBOLS.filter((symbol) => !excluded.includes(symbol));
    return choices[Math.floor(Math.random() * choices.length)] || SLOT_SYMBOLS[0];
  }

  function getDisplaySymbols(resultType, payoutMultiplier = 0) {
    if (resultType === "bonus") {
      const anchor = payoutMultiplier >= 20 ? "7" : "♦";
      return [anchor, anchor, anchor, "🔔", anchor];
    }

    if (resultType === "base") {
      const anchor = payoutMultiplier >= 8 ? "7" : payoutMultiplier >= 3 ? "BAR" : "🍒";
      const symbols = [anchor, anchor, anchor, pickDifferentSymbol([anchor]), pickDifferentSymbol([anchor])];
      return symbols.sort(() => Math.random() - 0.5);
    }

    const shuffled = [...SLOT_SYMBOLS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  function spinOnce({ betSize, preset, activeMissStreak = 0 }) {
    const calibrated = getCalibratedPayoutModel(preset);
    const didBaseHit = Math.random() < preset.hitFrequency;
    const didBonusHit = Math.random() < preset.bonusRate;

    let payout = 0;
    let baseMultiplier = 0;
    let bonusMultiplier = 0;

    if (didBaseHit) {
      baseMultiplier = sampleFromBuckets(calibrated.baseBuckets);
      payout += betSize * baseMultiplier;
    }

    if (didBonusHit) {
      bonusMultiplier = sampleFromBuckets(calibrated.bonusBuckets);
      payout += betSize * bonusMultiplier;
    }

    payout = Math.round(payout * 100) / 100;

    const resultType = didBonusHit ? "bonus" : didBaseHit ? "base" : "loss";
    const nextMissStreak = didBaseHit ? 0 : activeMissStreak + 1;

    return {
      payout,
      resultType,
      symbols: getDisplaySymbols(resultType, baseMultiplier + bonusMultiplier),
      didBaseHit,
      didBonusHit,
      baseMultiplier,
      bonusMultiplier,
      nextMissStreak
    };
  }

  function spinSession({ bankroll, betSize, preset, spins }) {
    let balance = bankroll;
    let bestRun = bankroll;
    let worstRun = bankroll;
    let wagered = 0;
    let returned = 0;
    let bustAt = null;
    let peakDrop = 0;
    let longestMissStreak = 0;
    let activeMissStreak = 0;

    const samples = [];

    for (let i = 1; i <= spins; i += 1) {
      if (balance < betSize) {
        bustAt = i - 1;
        break;
      }

      balance -= betSize;
      wagered += betSize;

      const spin = spinOnce({ betSize, preset, activeMissStreak });
      const payout = spin.payout;
      activeMissStreak = spin.nextMissStreak;
      longestMissStreak = Math.max(longestMissStreak, activeMissStreak);
      balance += payout;
      returned += payout;

      bestRun = Math.max(bestRun, balance);
      worstRun = Math.min(worstRun, balance);
      peakDrop = Math.max(peakDrop, bestRun - balance);

      if (i === 1 || i % Math.max(1, Math.floor(spins / 40)) === 0 || i === spins) {
        samples.push({ spin: i, balance });
      }
    }

    const spinsPlayed = bustAt === null ? spins : bustAt;
    const actualRtp = wagered > 0 ? returned / wagered : 0;

    return {
      spinsRequested: spins,
      spinsPlayed,
      endedBankroll: Math.max(0, Math.round(balance * 100) / 100),
      bust: bustAt !== null,
      bustAt,
      wagered,
      returned,
      actualRtp,
      bestRun,
      worstRun,
      peakDrawdown: peakDrop,
      longestMissStreak,
      samples
    };
  }

  function runMonteCarlo({ bankroll, betSize, preset, spins, trials = 250 }) {
    const outcomes = [];

    for (let i = 0; i < trials; i += 1) {
      outcomes.push(spinSession({ bankroll, betSize, preset, spins }));
    }

    const busts = outcomes.filter((o) => o.bust).length;
    const sortedBankroll = outcomes.map((o) => o.endedBankroll).sort((a, b) => a - b);

    const quantile = (p) => sortedBankroll[Math.floor((sortedBankroll.length - 1) * p)] || 0;

    const avgEnd = outcomes.reduce((sum, o) => sum + o.endedBankroll, 0) / outcomes.length;
    const totalReturned = outcomes.reduce((sum, o) => sum + o.returned, 0);
    const totalWagered = outcomes.reduce((sum, o) => sum + o.wagered, 0);
    const avgRtp = totalWagered > 0 ? totalReturned / totalWagered : 0;

    return {
      outcomes,
      trialCount: outcomes.length,
      bustChance: busts / outcomes.length,
      avgEndBankroll: avgEnd,
      avgRtp,
      p10End: quantile(0.1),
      p50End: quantile(0.5),
      p90End: quantile(0.9),
      worstEnd: sortedBankroll[0] || 0,
      bestEnd: sortedBankroll[sortedBankroll.length - 1] || 0
    };
  }

  function drawBalanceBars(container, samples) {
    if (!container) return;
    container.innerHTML = "";
    if (!samples || !samples.length) return;

    const maxBalance = Math.max(...samples.map((s) => s.balance), 1);

    samples.forEach((sample) => {
      const row = document.createElement("div");
      row.className = "slot-bar-row";

      const label = document.createElement("span");
      label.className = "slot-bar-label";
      label.textContent = `Spin ${sample.spin}`;

      const bar = document.createElement("div");
      bar.className = "slot-bar-track";

      const fill = document.createElement("div");
      fill.className = "slot-bar-fill";
      fill.style.width = `${Math.max(2, (sample.balance / maxBalance) * 100)}%`;

      const value = document.createElement("span");
      value.className = "slot-bar-value";
      value.textContent = toMoney(sample.balance);

      bar.appendChild(fill);
      row.appendChild(label);
      row.appendChild(bar);
      row.appendChild(value);
      container.appendChild(row);
    });
  }

  window.SlotsTools = {
    clamp,
    toMoney,
    toPercent,
    getPresetById,
    spinOnce,
    spinSession,
    runMonteCarlo,
    drawBalanceBars,
    getRtpTargets,
    getCalibratedPayoutModel,
    validatePresetRtp({ spinsPerPreset = 100000, betSize = 1 } = {}) {
      const results = {};
      (window.SLOT_PRESETS || []).forEach((preset) => {
        const model = getCalibratedPayoutModel(preset);
        const session = spinSession({
          bankroll: spinsPerPreset * betSize * 10,
          betSize,
          preset,
          spins: spinsPerPreset
        });
        results[preset.id] = {
          target: preset.rtp,
          actual: session.actualRtp,
          diff: session.actualRtp - preset.rtp,
          wagered: session.wagered,
          returned: session.returned,
          maxBaseMultiplier: Math.max(...model.baseBuckets.map((b) => b.multiplier), 0),
          maxBonusMultiplier: Math.max(...model.bonusBuckets.map((b) => b.multiplier), 0)
        };
      });
      console.table(results);
      return results;
    }
  };
})();
