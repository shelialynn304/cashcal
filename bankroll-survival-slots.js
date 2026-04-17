(function () {
  const form = document.getElementById("slotSurvivalForm");
  if (!form || !window.SlotsTools) return;

  const bankrollInput = document.getElementById("survivalBankroll");
  const betInput = document.getElementById("survivalBet");
  const spinsInput = document.getElementById("survivalTargetSpins");
  const presetSelect = document.getElementById("survivalPreset");

  const survivalOdds = document.getElementById("survivalOdds");
  const spinRange = document.getElementById("survivalRange");
  const ruinRisk = document.getElementById("survivalRuinRisk");
  const medianEnd = document.getElementById("survivalMedianEnd");
  const detail = document.getElementById("survivalDetail");

  function fillPresetOptions() {
    (window.SLOT_PRESETS || []).forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });

    presetSelect.value = "low-94";
  }

  function updateSurvival() {
    const bankroll = Number(bankrollInput.value);
    const betSize = Number(betInput.value);
    const spins = Number(spinsInput.value);
    const preset = window.SlotsTools.getPresetById(presetSelect.value);

    const report = window.SlotsTools.runMonteCarlo({ bankroll, betSize, preset, spins, trials: 320 });

    const survival = 1 - report.bustChance;
    survivalOdds.textContent = window.SlotsTools.toPercent(survival, 1);
    spinRange.textContent = `${Math.round(spins * 0.65)}-${Math.round(spins * 1.1)} spins`;
    ruinRisk.textContent = window.SlotsTools.toPercent(report.bustChance * (preset.volatility === "high" ? 1.08 : 1), 1);
    medianEnd.textContent = window.SlotsTools.toMoney(report.p50End);

    detail.textContent = `In ${report.trialCount} simulated sessions, bankroll outcomes ranged from ${window.SlotsTools.toMoney(report.worstEnd)} to ${window.SlotsTools.toMoney(report.bestEnd)}. If your target is ${spins} spins, your bet sizing is the strongest lever.`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSurvival();
  });

  fillPresetOptions();
  updateSurvival();
})();
