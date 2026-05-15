(function () {
  const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const ALLOWED_SOUND_SOURCES = {
    spin: 'sounds/games/roulette-wheel-spin.mp3',
    chip: 'sounds/chips/chip-click.mp3',
    chips: 'sounds/chips/placing-poker-chips.mp3',
    win: 'sounds/ui/subtle-win.mp3',
    fail: 'sounds/ui/subtle-fail.mp3',
    lose: 'sounds/ui/lose.mp3'
  };

  const state = {
    bankroll: 200,
    startingBankroll: 200,
    totalSpins: 0,
    currentStreakType: null,
    currentStreakCount: 0,
    biggestWin: 0,
    biggestLoss: 0,
    rotation: 0,
    spinning: false,
    muted: false,
    audioReady: false,
    audio: {},
    spinTimer: null
  };

  function $(id) {
    return document.getElementById(id);
  }

  const els = {
    table: $('rouletteBettingTable'),
    wheel: $('rouletteWheel'),
    wheelResult: $('rouletteWheelResult'),
    spinButton: $('rouletteSpinButton'),
    resetButton: $('rouletteResetButton'),
    soundToggle: $('rouletteSoundToggle'),
    status: $('rouletteStatus'),
    startingBankroll: $('rouletteStartingBankroll'),
    betAmount: $('rouletteBetAmount'),
    wheelType: $('rouletteWheelType'),
    betType: $('rouletteBetType'),
    singleNumber: $('rouletteSingleNumber'),
    bankrollDisplay: $('rouletteBankrollDisplay'),
    selectedBetDisplay: $('rouletteSelectedBetDisplay'),
    winningNumber: $('rouletteWinningNumber'),
    winningColor: $('rouletteWinningColor'),
    outcome: $('rouletteOutcome'),
    amountResult: $('rouletteAmountResult'),
    updatedBankroll: $('rouletteUpdatedBankroll'),
    currentStreak: $('rouletteCurrentStreak'),
    biggestWin: $('rouletteBiggestWin'),
    biggestLoss: $('rouletteBiggestLoss'),
    totalSpins: $('rouletteTotalSpins'),
    explanation: $('rouletteExplanation')
  };

  if (!els.table || !els.spinButton) return;

  function toMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function numberColor(value) {
    if (value === '0' || value === '00') return 'green';
    return RED_NUMBERS.has(Number(value)) ? 'red' : 'black';
  }

  function wheelNumbers(type) {
    const numbers = Array.from({ length: 36 }, (_, index) => String(index + 1));
    return type === 'american' ? ['0', '00'].concat(numbers) : ['0'].concat(numbers);
  }

  function getBetAmount() {
    return Math.max(1, Number(els.betAmount.value) || 5);
  }

  function getStartingBankroll() {
    return Math.max(1, Number(els.startingBankroll.value) || 200);
  }

  function getSingleNumber() {
    return els.singleNumber.value.trim().toUpperCase();
  }

  function normalizeSingleNumber(value, wheelType) {
    if (wheelType === 'american' && value === '00') return value;
    if (!/^\d+$/.test(value)) return value;
    return String(Number(value));
  }

  function isValidSingleNumber(value, wheelType) {
    if (wheelType === 'american' && value === '00') return true;
    if (!/^\d+$/.test(value)) return false;
    const number = Number(value);
    return number >= 0 && number <= 36;
  }

  function currentBetDetails() {
    const wheelType = els.wheelType.value;
    const betType = els.betType.value;
    const singleNumber = betType === 'single' ? normalizeSingleNumber(getSingleNumber(), wheelType) : '';

    return {
      wheelType,
      betType,
      singleNumber,
      betAmount: getBetAmount()
    };
  }

  function betLabel(betDetails) {
    const details = betDetails || currentBetDetails();
    if (details.betType === 'single') {
      return `Single ${details.singleNumber || '—'}`;
    }
    return details.betType.charAt(0).toUpperCase() + details.betType.slice(1);
  }

  function playSound(name) {
    if (state.muted || !state.audioReady || !state.audio[name]) return;
    const sound = state.audio[name];
    try {
      sound.pause();
      sound.currentTime = 0;
      sound.loop = false;
      const promise = sound.play();
      if (promise && typeof promise.catch === 'function') promise.catch(function () {});
    } catch (error) {
      // Audio is optional; simulator behavior should never depend on sound playback.
    }
  }

  function stopSound(name) {
    const sound = state.audio[name];
    if (!sound) return;
    try {
      sound.pause();
      sound.currentTime = 0;
      sound.loop = false;
    } catch (error) {
      // Ignore optional audio reset failures.
    }
  }

  function initAudio() {
    if (state.audioReady || !('Audio' in window)) return;
    state.audioReady = true;

    Object.entries(ALLOWED_SOUND_SOURCES).forEach(function ([name, src]) {
      fetch(src, { method: 'HEAD' })
        .then(function (response) {
          if (!response.ok) return;
          const audio = new Audio(src);
          audio.preload = 'none';
          audio.loop = false;
          state.audio[name] = audio;
        })
        .catch(function () {});
    });
  }

  function updateControls() {
    const singleSelected = els.betType.value === 'single';
    const disableBetControls = state.spinning;
    [els.startingBankroll, els.betAmount, els.wheelType, els.betType].forEach(function (control) {
      control.disabled = disableBetControls;
      control.setAttribute('aria-disabled', String(disableBetControls));
    });
    els.singleNumber.disabled = disableBetControls || !singleSelected;
    els.singleNumber.setAttribute('aria-disabled', String(disableBetControls || !singleSelected));
    els.table.querySelectorAll('button').forEach(function (button) {
      button.disabled = disableBetControls;
      button.setAttribute('aria-disabled', String(disableBetControls));
    });
    if (els.wheelType.value === 'european' && getSingleNumber() === '00') {
      els.singleNumber.value = '0';
    }
  }

  function updateDisplays() {
    els.bankrollDisplay.textContent = toMoney(state.bankroll);
    els.updatedBankroll.textContent = toMoney(state.bankroll);
    els.selectedBetDisplay.textContent = `${betLabel()} / ${toMoney(getBetAmount())}`;
    els.currentStreak.textContent = state.currentStreakCount ? `${state.currentStreakCount} ${state.currentStreakType}` : '0';
    els.biggestWin.textContent = toMoney(state.biggestWin);
    els.biggestLoss.textContent = toMoney(state.biggestLoss);
    els.totalSpins.textContent = String(state.totalSpins);
    els.soundToggle.textContent = state.muted ? 'Sound Off' : 'Sound On';
    els.soundToggle.setAttribute('aria-pressed', String(state.muted));
  }

  function setStatus(message) {
    els.status.textContent = message;
  }

  function buildTable() {
    els.table.textContent = '';

    const zeroRow = document.createElement('div');
    zeroRow.className = 'roulette-table-zero-row';
    ['0', '00'].forEach(function (label) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'roulette-table-cell roulette-table-cell-green';
      button.dataset.number = label;
      button.textContent = label;
      if (label === '00' && els.wheelType.value !== 'american') button.hidden = true;
      zeroRow.appendChild(button);
    });
    els.table.appendChild(zeroRow);

    const numbers = document.createElement('div');
    numbers.className = 'roulette-table-numbers';
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 12; col += 1) {
        const value = String(col * 3 + (3 - row));
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `roulette-table-cell roulette-table-cell-${numberColor(value)}`;
        button.dataset.number = value;
        button.textContent = value;
        numbers.appendChild(button);
      }
    }
    els.table.appendChild(numbers);

    const outside = document.createElement('div');
    outside.className = 'roulette-table-outside';
    [
      ['red', 'Red'],
      ['black', 'Black'],
      ['odd', 'Odd'],
      ['even', 'Even']
    ].forEach(function ([value, label]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `roulette-outside-bet roulette-outside-${value}`;
      button.dataset.bet = value;
      button.textContent = label;
      outside.appendChild(button);
    });
    els.table.appendChild(outside);

    highlightSelection();
  }

  function highlightSelection(winningValue, betDetails) {
    const details = betDetails || currentBetDetails();
    els.table.querySelectorAll('button').forEach(function (button) {
      button.classList.remove('is-selected', 'is-winning');
      if (button.dataset.bet === details.betType && details.betType !== 'single') {
        button.classList.add('is-selected');
      }
      if (details.betType === 'single' && button.dataset.number === details.singleNumber) {
        button.classList.add('is-selected');
      }
      if (winningValue && button.dataset.number === winningValue) {
        button.classList.add('is-winning');
      }
    });
  }

  function validateBet() {
    const betAmount = getBetAmount();
    if (state.spinning) return { ok: false, message: 'Wait for the current spin to finish.' };
    if (state.bankroll <= 0) return { ok: false, message: 'Your bankroll is empty. Reset the simulator to keep testing.' };
    if (betAmount > state.bankroll) return { ok: false, message: 'Bet blocked: your bet amount is higher than your current bankroll.' };
    if (els.betType.value === 'single' && !isValidSingleNumber(getSingleNumber(), els.wheelType.value)) {
      return { ok: false, message: els.wheelType.value === 'american' ? 'Enter 0, 00, or 1–36 for American roulette.' : 'Enter a number from 0–36 for European roulette.' };
    }
    return { ok: true };
  }

  function spinOutcome(wheelType) {
    const numbers = wheelNumbers(wheelType);
    return numbers[Math.floor(Math.random() * numbers.length)];
  }

  function didBetWin(value, betDetails) {
    const color = numberColor(value);
    const number = Number(value);
    switch (betDetails.betType) {
      case 'red':
        return color === 'red';
      case 'black':
        return color === 'black';
      case 'odd':
        return value !== '0' && value !== '00' && number % 2 === 1;
      case 'even':
        return value !== '0' && value !== '00' && number % 2 === 0;
      case 'single':
        return betDetails.singleNumber === value;
      default:
        return false;
    }
  }

  function resultExplanation(value, won, net, betDetails) {
    const color = numberColor(value);
    const betType = betDetails.betType;
    const gainText = `You gained ${toMoney(net)}.`;

    if (betType === 'single') {
      return won
        ? `Direct hit. Single-number bets are rare, but they pay big. ${gainText}`
        : 'Single-number bets miss often. That’s the tradeoff for the 35:1 payout.';
    }

    if (won) {
      if (betType === 'red' || betType === 'black') {
        return `${color.charAt(0).toUpperCase() + color.slice(1)} hit, so your 1:1 bet won. ${gainText}`;
      }
      return `${Number(value) % 2 === 0 ? 'Even' : 'Odd'} hit, so your 1:1 bet won. ${gainText}`;
    }

    if ((betType === 'red' || betType === 'black') && (color === 'red' || color === 'black')) {
      return `${color.charAt(0).toUpperCase() + color.slice(1)} hit while you bet ${betType}. You lost the bet amount.`;
    }

    return `The wheel landed on ${value}. Your ${betLabel(betDetails).toLowerCase()} bet missed, so you lost the bet amount.`;
  }

  function finishSpin(value, betDetails) {
    const color = numberColor(value);
    const won = didBetWin(value, betDetails);
    const payout = betDetails.betType === 'single' ? 35 : 1;
    const net = won ? betDetails.betAmount * payout : -betDetails.betAmount;

    state.bankroll += net;
    state.totalSpins += 1;
    if (won) {
      state.biggestWin = Math.max(state.biggestWin, net);
    } else {
      state.biggestLoss = Math.max(state.biggestLoss, Math.abs(net));
    }

    const streakType = won ? 'Win Streak' : 'Loss Streak';
    state.currentStreakCount = state.currentStreakType === streakType ? state.currentStreakCount + 1 : 1;
    state.currentStreakType = streakType;

    els.winningNumber.textContent = value;
    els.winningColor.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    els.outcome.textContent = won ? 'Win' : 'Loss';
    els.amountResult.textContent = won ? `+${toMoney(net)}` : `-${toMoney(Math.abs(net))}`;
    els.explanation.textContent = resultExplanation(value, won, net, betDetails);
    els.wheelResult.textContent = value;
    els.wheel.setAttribute('aria-label', `Roulette wheel landed on ${value}`);
    els.wheel.classList.toggle('roulette-wheel-win', won);
    els.wheel.classList.toggle('roulette-wheel-loss', !won);

    highlightSelection(value, betDetails);
    updateDisplays();
    setStatus(`${won ? 'Win' : 'Loss'} on ${value}. Bankroll is now ${toMoney(state.bankroll)}.`);
    playSound(won ? 'win' : 'lose');

    state.spinning = false;
    els.spinButton.disabled = false;
    updateControls();
  }

  function spin() {
    initAudio();
    updateControls();
    const validation = validateBet();
    if (!validation.ok) {
      setStatus(validation.message);
      playSound('fail');
      return;
    }

    const betDetails = currentBetDetails();
    const value = spinOutcome(betDetails.wheelType);
    state.spinning = true;
    els.spinButton.disabled = true;
    updateControls();
    els.wheel.classList.remove('roulette-wheel-win', 'roulette-wheel-loss');
    highlightSelection();
    setStatus('Wheel spinning...');

    stopSound('spin');
    playSound('spin');

    const numbers = wheelNumbers(betDetails.wheelType);
    const pocketIndex = numbers.indexOf(value);
    const pocketDegrees = 360 / numbers.length;
    state.rotation += 1080 + (360 - pocketIndex * pocketDegrees) + Math.random() * pocketDegrees;
    els.wheel.style.transform = `rotate(${state.rotation}deg)`;

    if (state.spinTimer) window.clearTimeout(state.spinTimer);
    state.spinTimer = window.setTimeout(function () {
      state.spinTimer = null;
      stopSound('spin');
      finishSpin(value, betDetails);
    }, 2100);
  }

  function reset() {
    initAudio();
    stopSound('spin');
    if (state.spinTimer) {
      window.clearTimeout(state.spinTimer);
      state.spinTimer = null;
    }
    state.startingBankroll = getStartingBankroll();
    state.bankroll = state.startingBankroll;
    state.totalSpins = 0;
    state.currentStreakType = null;
    state.currentStreakCount = 0;
    state.biggestWin = 0;
    state.biggestLoss = 0;
    state.spinning = false;
    els.spinButton.disabled = false;
    els.wheelResult.textContent = 'Ready';
    els.wheel.classList.remove('roulette-wheel-win', 'roulette-wheel-loss');
    els.wheel.setAttribute('aria-label', 'Roulette wheel ready to spin');
    els.winningNumber.textContent = '—';
    els.winningColor.textContent = '—';
    els.outcome.textContent = '—';
    els.amountResult.textContent = '—';
    els.explanation.textContent = 'Spin once to see how roulette variance treats this bet.';
    setStatus('Simulator reset. Choose a bet, set your stake, then spin.');
    updateControls();
    highlightSelection();
    updateDisplays();
    playSound('chips');
  }

  els.table.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button || state.spinning) return;
    initAudio();
    if (button.dataset.number) {
      els.betType.value = 'single';
      els.singleNumber.value = button.dataset.number;
    }
    if (button.dataset.bet) {
      els.betType.value = button.dataset.bet;
    }
    updateControls();
    highlightSelection();
    updateDisplays();
    playSound('chip');
  });

  [els.startingBankroll, els.betAmount, els.wheelType, els.betType, els.singleNumber].forEach(function (control) {
    control.addEventListener('input', function () {
      initAudio();
      if (control === els.startingBankroll && state.totalSpins === 0) {
        state.startingBankroll = getStartingBankroll();
        state.bankroll = state.startingBankroll;
      }
      if (control === els.wheelType) buildTable();
      updateControls();
      highlightSelection();
      updateDisplays();
    });

    control.addEventListener('change', function () {
      initAudio();
      if (control === els.wheelType) buildTable();
      updateControls();
      highlightSelection();
      updateDisplays();
    });
  });

  els.spinButton.addEventListener('click', spin);
  els.resetButton.addEventListener('click', reset);
  els.soundToggle.addEventListener('click', function () {
    initAudio();
    state.muted = !state.muted;
    if (state.muted) stopSound('spin');
    updateDisplays();
  });

  buildTable();
  updateControls();
  updateDisplays();
})();
