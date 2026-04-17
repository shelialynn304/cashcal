(function () {
  const form = document.getElementById("slotSimulatorForm");
  if (!form || !window.SlotsTools) return;

  const presetSelect = document.getElementById("slotPreset");
  const bankrollInput = document.getElementById("simBankroll");
  const betInput = document.getElementById("simBetSize");
  const spinsInput = document.getElementById("simSpins");
  const autoplayBtn = document.getElementById("runAutoplay");

  const endBankroll = document.getElementById("simEndBankroll");
  const bustChance = document.getElementById("simBustChance");
  const bestRun = document.getElementById("simBestRun");
  const worstRun = document.getElementById("simWorstRun");
  const actualRtp = document.getElementById("simActualRtp");
  const narrative = document.getElementById("simNarrative");
  const bars = document.getElementById("simBalanceBars");

  function fillPresetOptions() {
    (window.SLOT_PRESETS || []).forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });

    presetSelect.value = "medium-96";
  }

  function updateSimulator() {
    const preset = window.SlotsTools.getPresetById(presetSelect.value);
    const bankroll = Number(bankrollInput.value);
    const betSize = Number(betInput.value);
    const spins = Number(spinsInput.value);

    const scenario = window.SlotsTools.spinSession({ bankroll, betSize, preset, spins });
    const monteCarlo = window.SlotsTools.runMonteCarlo({ bankroll, betSize, preset, spins, trials: 220 });

    endBankroll.textContent = window.SlotsTools.toMoney(monteCarlo.avgEndBankroll);
    bustChance.textContent = window.SlotsTools.toPercent(monteCarlo.bustChance, 1);
    bestRun.textContent = window.SlotsTools.toMoney(scenario.bestRun);
    worstRun.textContent = window.SlotsTools.toMoney(scenario.worstRun);
    actualRtp.textContent = window.SlotsTools.toPercent(monteCarlo.avgRtp, 2);

    window.SlotsTools.drawBalanceBars(bars, scenario.samples);

    const bustMsg = monteCarlo.bustChance > 0.35
      ? "High bankroll failure risk. Lower bet size or spins to reduce ruin odds."
      : "Bankroll survival is stronger, but expected value remains negative over time.";

    narrative.textContent = `${preset.note} ${bustMsg}`;
  }

  autoplayBtn.addEventListener("click", updateSimulator);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSimulator();
  });

  fillPresetOptions();
  updateSimulator();
})();
