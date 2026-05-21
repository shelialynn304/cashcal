(function () {
  const form = document.getElementById("slotSurvivalForm");
  if (!form || !window.SlotsTools) return;

  const bankrollInput = document.getElementById("survivalBankroll");
  const betInput = document.getElementById("survivalBet");
  const spinsInput = document.getElementById("survivalTargetSpins");
  const trialPresetSelect = document.getElementById("survivalTrialPreset");
  const trialsInput = document.getElementById("survivalTrialsInput");
  const presetSelect = document.getElementById("survivalPreset");

  const survivalOdds = document.getElementById("survivalOdds");
  const avgRtp = document.getElementById("survivalAvgRtp");
  const spinRange = document.getElementById("survivalRange");
  const ruinRisk = document.getElementById("survivalRuinRisk");
  const medianEnd = document.getElementById("survivalMedianEnd");
  const p10End = document.getElementById("survivalP10End");
  const p90End = document.getElementById("survivalP90End");
  const detail = document.getElementById("survivalDetail");
  const warning = document.getElementById("survivalWarning");
  const trialWarning = document.getElementById("survivalTrialWarning");

  function fillPresetOptions() {
    (window.SLOT_PRESETS || []).forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });

    presetSelect.value = "low-94";
  }

  function syncTrialPreset() {
    const presetValue = trialPresetSelect.value;
    if (presetValue !== "custom") {
      const trialCount = Number(presetValue) || 2000;
      trialsInput.value = trialCount;
    }
  }

  function updateSurvival() {
    const bankroll = Number(bankrollInput.value);
    const betSize = Number(betInput.value);
    const spins = Number(spinsInput.value);
    const trials = Math.max(250, Number(trialsInput.value) || 2000);
    const preset = window.SlotsTools.getPresetById(presetSelect.value);

    if (betSize >= bankroll) {
      warning.textContent = "Bet size must be smaller than bankroll for a meaningful survival estimate. Lower your bet or increase the bankroll.";
      warning.style.display = "block";
      trialWarning.textContent = "";
      trialWarning.style.display = "none";
      survivalOdds.textContent = "-";
      spinRange.textContent = "-";
      document.getElementById('survivalTrials').textContent = "0";
      ruinRisk.textContent = "-";
      medianEnd.textContent = "$0.00";
      detail.textContent = "";
      return;
    }

    warning.textContent = "";
    warning.style.display = "none";
    trialWarning.textContent = "";
    trialWarning.style.display = "none";

    const report = window.SlotsTools.runMonteCarlo({ bankroll, betSize, preset, spins, trials });

    const survival = 1 - report.bustChance;
    survivalOdds.textContent = window.SlotsTools.toPercent(survival, 1);
    avgRtp.textContent = window.SlotsTools.toPercent(report.avgRtp, 2);
    spinRange.textContent = `${report.p10Spins}-${report.p90Spins} spins`;
    ruinRisk.textContent = window.SlotsTools.toPercent(report.bustChance, 1);
    medianEnd.textContent = window.SlotsTools.toMoney(report.p50End);
    p10End.textContent = window.SlotsTools.toMoney(report.p10End);
    p90End.textContent = window.SlotsTools.toMoney(report.p90End);
    document.getElementById('survivalTrials').textContent = report.trialCount.toString();

    if (report.trialCount < 1000) {
      trialWarning.textContent = "Lower trial counts are less stable; results can vary more from run to run.";
      trialWarning.style.display = "block";
    }

    detail.textContent = `In ${report.trialCount} simulated sessions, bust risk was ${window.SlotsTools.toPercent(report.bustChance, 1)}, average RTP was ${window.SlotsTools.toPercent(report.avgRtp, 2)}, and ending bankroll fell between ${window.SlotsTools.toMoney(report.p10End)} and ${window.SlotsTools.toMoney(report.p90End)} for the middle 80% of sessions. If your target is ${spins} spins, your bet sizing is the strongest lever.`;
  }

  trialPresetSelect.addEventListener("change", syncTrialPreset);
  trialsInput.addEventListener("input", () => {
    if (Number(trialsInput.value) !== Number(trialPresetSelect.value)) {
      trialPresetSelect.value = "custom";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSurvival();
  });

  fillPresetOptions();
  syncTrialPreset();
  updateSurvival();
})();
