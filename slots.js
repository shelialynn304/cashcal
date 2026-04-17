(function () {
  const VOL_MULTIPLIER = {
    low: { missStreak: 0.7, winStreak: 1.25, variance: 0.45, bustLift: 0.8 },
    medium: { missStreak: 1, winStreak: 1, variance: 0.75, bustLift: 1 },
    high: { missStreak: 1.35, winStreak: 0.78, variance: 1.25, bustLift: 1.25 }
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

  function getPayoutMultiplier(preset) {
    const vol = VOL_MULTIPLIER[preset.volatility] || VOL_MULTIPLIER.medium;
    const baseMean = preset.rtp / Math.max(0.01, preset.hitFrequency);
    const randomPart = Math.abs(normalRandom()) * vol.variance;
    return clamp(baseMean * (0.35 + randomPart), 0.15, preset.maxWinMulti);
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

      const missFactor = clamp(1 - (activeMissStreak * 0.01 * vol.missStreak), 0.72, 1.08);
      const didBaseHit = Math.random() < preset.hitFrequency * missFactor;
      const didBonusHit = Math.random() < preset.bonusRate;

      let payout = 0;
      if (didBaseHit) {
        payout += betSize * getPayoutMultiplier(preset);
        activeMissStreak = 0;
      } else {
        activeMissStreak += 1;
        longestMissStreak = Math.max(longestMissStreak, activeMissStreak);
      }

      if (didBonusHit) {
        payout += betSize * clamp((2 + Math.abs(normalRandom()) * 6) * vol.winStreak, 1.5, 35);
      }

      payout = Math.round(payout * 100) / 100;
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
    const avgRtp = outcomes.reduce((sum, o) => sum + o.actualRtp, 0) / outcomes.length;

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
    spinSession,
    runMonteCarlo,
    drawBalanceBars
  };
})();
