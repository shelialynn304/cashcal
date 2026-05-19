(function () {
  const form = document.getElementById("slotSimulatorForm");
  if (!form || !window.SlotsTools) return;

  const presetSelect = document.getElementById("slotPreset");
  const bankrollInput = document.getElementById("simBankroll");
  const betInput = document.getElementById("simBetSize");
  const spinsInput = document.getElementById("simSpins");
  const autoplayBtn = document.getElementById("runAutoplay");
  const singleSpinBtn = document.getElementById("singleSpinBtn");
  const spinWarning = document.getElementById("slotSpinWarning");
  const spinMessage = document.getElementById("slotSpinMessage");
  const slotReelsContainer = document.getElementById("slotReels");
  const reelMode3Btn = document.getElementById("reelMode3");
  const reelMode5Btn = document.getElementById("reelMode5");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const lastSpinBet = document.getElementById("lastSpinBet");
  const lastSpinSymbols = document.getElementById("lastSpinSymbols");
  const lastSpinPayout = document.getElementById("lastSpinPayout");
  const lastSpinChange = document.getElementById("lastSpinChange");

  const endBankroll = document.getElementById("simEndBankroll");
  const bustChance = document.getElementById("simBustChance");
  const bestRun = document.getElementById("simBestRun");
  const worstRun = document.getElementById("simWorstRun");
  const actualRtp = document.getElementById("simActualRtp");
  const narrative = document.getElementById("simNarrative");
  const bars = document.getElementById("simBalanceBars");

  const reelSymbols = ["7", "BAR", "🔔", "🍒", "🍋", "♦", "☠", "♠"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeMissStreak = 0;
  let isSpinning = false;
  let reelCount = 5;
  let soundEnabled = false;
  let spinAudio = null;


  function getRenderedReels() {
    return Array.from(slotReelsContainer.querySelectorAll(".slot-reel"));
  }

  function renderReels() {
    if (!slotReelsContainer) return;

    slotReelsContainer.dataset.reels = String(reelCount);
    slotReelsContainer.innerHTML = "";

    for (let i = 0; i < reelCount; i += 1) {
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      const symbol = document.createElement("span");
      symbol.className = "slot-symbol";
      symbol.textContent = reelSymbols[i % reelSymbols.length];
      reel.appendChild(symbol);
      slotReelsContainer.appendChild(reel);
    }
  }

  function getVisibleSymbols(symbols) {
    return symbols.slice(0, reelCount);
  }

  function initAudio() {
    if (spinAudio) return spinAudio;
    spinAudio = new Audio("assets/sounds/games/roulette_spin.mp3");
    spinAudio.preload = "auto";
    return spinAudio;
  }

  function playSpinAudio() {
    if (!soundEnabled) return;
    const audio = initAudio();
    audio.currentTime = 0;
    audio.loop = false;
    audio.play().catch(() => {});
  }

  function setSoundEnabled(enabled) {
    soundEnabled = Boolean(enabled);
    if (soundToggleBtn) {
      soundToggleBtn.classList.toggle("is-active", soundEnabled);
      soundToggleBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
      soundToggleBtn.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
    }
  }

  function setReelMode(nextReelCount) {
    reelCount = nextReelCount === 3 ? 3 : 5;
    if (reelMode3Btn && reelMode5Btn) {
      const threeActive = reelCount === 3;
      reelMode3Btn.classList.toggle("is-active", threeActive);
      reelMode5Btn.classList.toggle("is-active", !threeActive);
      reelMode3Btn.setAttribute("aria-pressed", threeActive ? "true" : "false");
      reelMode5Btn.setAttribute("aria-pressed", !threeActive ? "true" : "false");
    }
    renderReels();
  }
  function fillPresetOptions() {
    (window.SLOT_PRESETS || []).forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });

    presetSelect.value = "medium-96";
  }

  function getInputs() {
    return {
      preset: window.SlotsTools.getPresetById(presetSelect.value),
      bankroll: Math.max(0, Number(bankrollInput.value) || 0),
      betSize: Math.max(0, Number(betInput.value) || 0),
      spins: Math.max(1, Number(spinsInput.value) || 1)
    };
  }

  function setReelSymbols(symbols) {
    const slotReels = getRenderedReels();
    slotReels.forEach((reel, index) => {
      const symbol = symbols[index] || reelSymbols[index % reelSymbols.length];
      const symbolNode = reel.querySelector(".slot-symbol");
      if (symbolNode) symbolNode.textContent = symbol;
    });
  }

  function updateSpinAvailability() {
    const { bankroll, betSize } = getInputs();
    const blocked = isSpinning || betSize <= 0 || bankroll < betSize;

    if (singleSpinBtn) {
      singleSpinBtn.disabled = blocked;
      singleSpinBtn.textContent = isSpinning ? "Spinning…" : "Spin Once";
    }

    if (!spinWarning) return;

    if (betSize <= 0) {
      spinWarning.textContent = "Enter a bet size above $0 to spin.";
    } else if (bankroll < betSize) {
      spinWarning.textContent = `Bankroll too low: ${window.SlotsTools.toMoney(bankroll)} cannot cover a ${window.SlotsTools.toMoney(betSize)} spin.`;
    } else {
      spinWarning.textContent = "";
    }
  }

  function updateLastSpin({ betSize, symbols, payout, bankrollChange }) {
    lastSpinBet.textContent = window.SlotsTools.toMoney(betSize);
    lastSpinSymbols.textContent = symbols.join(" · ");
    lastSpinPayout.textContent = window.SlotsTools.toMoney(payout);
    lastSpinChange.textContent = `${bankrollChange >= 0 ? "+" : ""}${window.SlotsTools.toMoney(bankrollChange)}`;
    lastSpinChange.classList.toggle("result-small-win", bankrollChange > 0);
    lastSpinChange.classList.toggle("result-loss", bankrollChange < 0);
  }

  function describeSpin(spin, bankrollChange, newBankroll) {
    const changeText = `${bankrollChange >= 0 ? "+" : ""}${window.SlotsTools.toMoney(bankrollChange)}`;

    if (spin.resultType === "bonus") {
      return `Bonus hit. Symbols ${spin.symbols.join(" · ")} paid ${window.SlotsTools.toMoney(spin.payout)} for a ${changeText} bankroll move. New bankroll: ${window.SlotsTools.toMoney(newBankroll)}.`;
    }

    if (spin.payout > 0) {
      return `Line hit. Symbols ${spin.symbols.join(" · ")} paid ${window.SlotsTools.toMoney(spin.payout)} for a ${changeText} bankroll move. New bankroll: ${window.SlotsTools.toMoney(newBankroll)}.`;
    }

    return `No payline. Symbols ${spin.symbols.join(" · ")} returned ${window.SlotsTools.toMoney(0)} for a ${changeText} bankroll move. New bankroll: ${window.SlotsTools.toMoney(newBankroll)}.`;
  }

  function resetReelState() {
    const slotReels = getRenderedReels();
    slotReels.forEach((reel) => {
      reel.classList.remove("reel-spinning", "slot-win", "slot-jackpot");
    });
  }

  function animateReels(finalSymbols, resultType) {
    const slotReels = getRenderedReels();
    resetReelState();

    if (reduceMotion.matches) {
      setReelSymbols(finalSymbols);
      slotReels.forEach((reel) => {
        if (resultType === "bonus") reel.classList.add("slot-jackpot");
        if (resultType === "base") reel.classList.add("slot-win");
      });
      return Promise.resolve();
    }

    const timers = [];
    slotReels.forEach((reel, reelIndex) => {
      reel.classList.add("reel-spinning");
      timers.push(window.setInterval(() => {
        const symbolNode = reel.querySelector(".slot-symbol");
        if (symbolNode) {
          symbolNode.textContent = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
        }
      }, 70 + reelIndex * 8));
    });

    return Promise.all(slotReels.map((reel, reelIndex) => new Promise((resolve) => {
      window.setTimeout(() => {
        window.clearInterval(timers[reelIndex]);
        const symbolNode = reel.querySelector(".slot-symbol");
        if (symbolNode) symbolNode.textContent = finalSymbols[reelIndex];
        reel.classList.remove("reel-spinning");
        if (resultType === "bonus") reel.classList.add("slot-jackpot");
        if (resultType === "base") reel.classList.add("slot-win");
        resolve();
      }, 520 + reelIndex * 180);
    })));
  }

  function updateSimulator() {
    const { preset, bankroll, betSize, spins } = getInputs();

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
    updateSpinAvailability();
  }

  async function handleSingleSpin() {
    const { preset, bankroll, betSize } = getInputs();

    if (isSpinning || betSize <= 0 || bankroll < betSize) {
      updateSpinAvailability();
      return;
    }

    isSpinning = true;
    updateSpinAvailability();

    const spin = window.SlotsTools.spinOnce({ betSize, preset, activeMissStreak });
    playSpinAudio();
    activeMissStreak = spin.nextMissStreak;

    const newBankroll = Math.max(0, Math.round((bankroll - betSize + spin.payout) * 100) / 100);
    const bankrollChange = Math.round((spin.payout - betSize) * 100) / 100;

    const visibleSymbols = getVisibleSymbols(spin.symbols);
    await animateReels(visibleSymbols, spin.resultType);

    bankrollInput.value = newBankroll.toFixed(2);
    updateLastSpin({ betSize, symbols: visibleSymbols, payout: spin.payout, bankrollChange });

    spinMessage.classList.toggle("result-jackpot", spin.resultType === "bonus");
    spinMessage.classList.toggle("result-small-win", spin.payout > betSize && spin.resultType !== "bonus");
    spinMessage.classList.toggle("result-loss", spin.payout < betSize);
    spinMessage.textContent = describeSpin(spin, bankrollChange, newBankroll);

    isSpinning = false;
    updateSimulator();
  }

  autoplayBtn.addEventListener("click", updateSimulator);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSimulator();
  });

  [bankrollInput, betInput, spinsInput, presetSelect].forEach((control) => {
    control.addEventListener("input", updateSpinAvailability);
    control.addEventListener("change", updateSpinAvailability);
  });

  if (singleSpinBtn) {
    singleSpinBtn.addEventListener("click", handleSingleSpin);
  }

  if (reelMode3Btn && reelMode5Btn) {
    reelMode3Btn.addEventListener("click", () => setReelMode(3));
    reelMode5Btn.addEventListener("click", () => setReelMode(5));
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => setSoundEnabled(!soundEnabled));
  }

  fillPresetOptions();
  setReelMode(5);
  setSoundEnabled(false);
  updateSpinAvailability();
  updateSimulator();
})();
