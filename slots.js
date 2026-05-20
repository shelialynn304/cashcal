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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function toPercent(decimal, digits = 1) {
    return `${(Number(decimal) * 100).toFixed(digits)}%`;
  }

  function normalRandom() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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

  function getAverageMultipliers(preset) {
    const targets = getRtpTargets(preset);
    const baseAvg = targets.baseExpectedRtp / Math.max(0.0001, preset.hitFrequency);
    const bonusAvg = targets.bonusExpectedRtp / Math.max(0.0001, preset.bonusRate);
    return {
      base: clamp(baseAvg, 0.05, preset.maxWinMulti),
      bonus: clamp(bonusAvg, 0.2, preset.maxWinMulti)
    };
  }

  function sampleGamma(shape) {
    const k = Math.max(0.001, shape);
    if (k < 1) {
      return sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
    }

    const d = k - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x = normalRandom();
      let v = 1 + c * x;
      if (v <= 0) continue;
      v = v * v * v;
      const u = Math.random();
      if (u < 1 - 0.0331 * Math.pow(x, 4)) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }

  function sampleMultiplier(avgTarget, shape, max) {
    const sampled = sampleGamma(shape) / shape;
    return clamp(avgTarget * sampled, 0, max);
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
    const vol = VOL_MULTIPLIER[preset.volatility] || VOL_MULTIPLIER.medium;
    const averages = getAverageMultipliers(preset);
    const didBaseHit = Math.random() < preset.hitFrequency;
    const didBonusHit = Math.random() < preset.bonusRate;

    let payout = 0;
    let baseMultiplier = 0;
    let bonusMultiplier = 0;

    if (didBaseHit) {
      baseMultiplier = sampleMultiplier(averages.base, Math.max(0.6, 6 / (1 + vol.spread * 4)), preset.maxWinMulti);
      payout += betSize * baseMultiplier;
    }

    if (didBonusHit) {
      bonusMultiplier = sampleMultiplier(averages.bonus, Math.max(0.45, 3.5 / (1 + vol.spread * 4.5)), preset.maxWinMulti);
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
    const vol = VOL_MULTIPLIER[preset.volatility] || VOL_MULTIPLIER.medium;
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
    getAverageMultipliers,
    validatePresetRtp({ spinsPerPreset = 100000, betSize = 1 } = {}) {
      const results = {};
      (window.SLOT_PRESETS || []).forEach((preset) => {
        const session = spinSession({
          bankroll: spinsPerPreset * betSize * 10,
          betSize,
          preset,
          spins: spinsPerPreset
        });
        results[preset.id] = {
          target: preset.rtp,
          actual: session.actualRtp,
          wagered: session.wagered,
          returned: session.returned
        };
      });
      console.table(results);
      return results;
    }
  };
})();
