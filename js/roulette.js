(function () {
  const BANKROLL_REJECT_MESSAGE = 'Bankroll says no. Math remains undefeated.';
  const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const EUROPEAN_SEQUENCE = ['0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36', '11', '30', '8', '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9', '22', '18', '29', '7', '28', '12', '35', '3', '26'];
  const AMERICAN_SEQUENCE = ['0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34', '15', '3', '24', '36', '13', '1', '00', '27', '10', '25', '29', '12', '8', '19', '31', '18', '6', '21', '33', '16', '4', '23', '35', '14', '2'];
  const ALLOWED_SOUND_SOURCES = {
    spin: 'assets/sounds/games/roulette_spin.wav',
    chip: 'assets/sounds/chips/chip-click.mp3',
    chips: 'assets/sounds/chips/placing-poker-chips.mp3',
    win: 'assets/sounds/ui/subtle-win.mp3',
    fail: 'assets/sounds/ui/subtle-fail.mp3',
    lose: 'assets/sounds/ui/lose.mp3'
  };

  const state = {
    bankroll: 200,
    startingBankroll: 200,
    activeBets: [],
    lastBets: [],
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
    wheelNumbers: $('rouletteWheelNumbers'),
    wheelResult: $('rouletteWheelResult'),
    spinButton: $('rouletteSpinButton'),
    resetButton: $('rouletteResetButton'),
    repeatBetButton: $('rouletteRepeatBetButton'),
    clearBetsButton: $('rouletteClearBetsButton'),
    soundToggle: $('rouletteSoundToggle'),
    status: $('rouletteStatus'),
    startingBankroll: $('rouletteStartingBankroll'),
    betAmount: $('rouletteBetAmount'),
    chipButtons: Array.from(document.querySelectorAll('[data-chip]')),
    wheelType: $('rouletteWheelType'),
    betType: $('rouletteBetType'),
    singleNumber: $('rouletteSingleNumber'),
    bankrollDisplay: $('rouletteBankrollDisplay'),
    selectedBetDisplay: $('rouletteSelectedBetDisplay'),
    activeBetTotal: $('rouletteActiveBetTotal'),
    activeBetList: $('rouletteActiveBetList'),
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
    return type === 'american' ? AMERICAN_SEQUENCE : EUROPEAN_SEQUENCE;
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

  function activeBetTotal() {
    return state.activeBets.reduce(function (total, bet) {
      return total + bet.betAmount;
    }, 0);
  }

  function availableBankroll() {
    return Math.max(0, state.bankroll - activeBetTotal());
  }

  function cloneBet(bet) {
    return {
      wheelType: bet.wheelType,
      betType: bet.betType,
      singleNumber: bet.singleNumber,
      betAmount: bet.betAmount
    };
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

  function rejectOverBankroll() {
    setStatus(BANKROLL_REJECT_MESSAGE);
    playSound('fail');
  }

  function updateControls() {
    const singleSelected = els.betType.value === 'single';
    const disableBetControls = state.spinning;
    const remaining = availableBankroll();
    const selectedBetTooLarge = getBetAmount() > remaining;

    [els.startingBankroll, els.betAmount, els.wheelType, els.betType].forEach(function (control) {
      control.disabled = disableBetControls;
      control.setAttribute('aria-disabled', String(disableBetControls));
    });
    els.singleNumber.disabled = disableBetControls || !singleSelected;
    els.singleNumber.setAttribute('aria-disabled', String(disableBetControls || !singleSelected));

    els.table.querySelectorAll('button').forEach(function (button) {
      button.disabled = disableBetControls;
      button.setAttribute('aria-disabled', String(disableBetControls || selectedBetTooLarge));
      button.classList.toggle('is-dimmed', selectedBetTooLarge && !disableBetControls);
    });

    els.chipButtons.forEach(function (button) {
      const chipAmount = Number(button.dataset.chip) || 0;
      button.disabled = disableBetControls;
      button.setAttribute('aria-disabled', String(disableBetControls || chipAmount > remaining));
      button.classList.toggle('is-dimmed', chipAmount > remaining && !disableBetControls);
      button.classList.toggle('is-selected', chipAmount === getBetAmount());
    });

    if (els.repeatBetButton) {
      const lastBetTotal = state.lastBets.reduce(function (total, bet) { return total + bet.betAmount; }, 0);
      const repeatDisabled = disableBetControls || !state.lastBets.length;
      els.repeatBetButton.disabled = repeatDisabled;
      els.repeatBetButton.setAttribute('aria-disabled', String(repeatDisabled || lastBetTotal > remaining));
      els.repeatBetButton.classList.toggle('is-dimmed', Boolean(state.lastBets.length) && lastBetTotal > remaining && !disableBetControls);
    }

    if (els.clearBetsButton) {
      const clearDisabled = disableBetControls || !state.activeBets.length;
      els.clearBetsButton.disabled = clearDisabled;
      els.clearBetsButton.setAttribute('aria-disabled', String(clearDisabled));
    }

    if (els.wheelType.value === 'european' && getSingleNumber() === '00') {
      els.singleNumber.value = '0';
    }
  }

  function updateDisplays() {
    els.bankrollDisplay.textContent = toMoney(state.bankroll);
    els.updatedBankroll.textContent = toMoney(state.bankroll);
    els.selectedBetDisplay.textContent = `${betLabel()} / ${toMoney(getBetAmount())}`;
    if (els.activeBetTotal) els.activeBetTotal.textContent = toMoney(activeBetTotal());
    if (els.activeBetList) {
      els.activeBetList.textContent = state.activeBets.length
        ? state.activeBets.map(function (bet) { return `${betLabel(bet)} ${toMoney(bet.betAmount)}`; }).join(' • ')
        : 'No active bets yet. Click the felt to place chips.';
    }
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

  function wedgePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    const start = (startAngle - 90) * Math.PI / 180;
    const end = (endAngle - 90) * Math.PI / 180;
    const outerStartX = cx + outerRadius * Math.cos(start);
    const outerStartY = cy + outerRadius * Math.sin(start);
    const outerEndX = cx + outerRadius * Math.cos(end);
    const outerEndY = cy + outerRadius * Math.sin(end);
    const innerEndX = cx + innerRadius * Math.cos(end);
    const innerEndY = cy + innerRadius * Math.sin(end);
    const innerStartX = cx + innerRadius * Math.cos(start);
    const innerStartY = cy + innerRadius * Math.sin(start);

    return `M ${outerStartX} ${outerStartY} A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY} Z`;
  }

  function buildWheelNumbers() {
    if (!els.wheelNumbers) return;
    const numbers = wheelNumbers(els.wheelType.value);
    const step = 360 / numbers.length;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'roulette-wheel-svg');
    svg.setAttribute('focusable', 'false');

    numbers.forEach(function (label, index) {
      const startAngle = index * step - (step / 2);
      const endAngle = startAngle + step;
      const middleAngle = index * step;
      const middleRadians = (middleAngle - 90) * Math.PI / 180;
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', wedgePath(100, 100, 58, 96, startAngle, endAngle));
      path.setAttribute('class', `roulette-wheel-pocket roulette-wheel-pocket-${numberColor(label)}`);
      svg.appendChild(path);

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(100 + 78 * Math.cos(middleRadians)));
      text.setAttribute('y', String(100 + 78 * Math.sin(middleRadians)));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'roulette-wheel-pocket-number');
      text.textContent = label;
      svg.appendChild(text);
    });

    els.wheelNumbers.textContent = '';
    els.wheelNumbers.appendChild(svg);
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
    updateControls();
  }

  function highlightSelection(winningValue, betDetails) {
    const details = betDetails || currentBetDetails();
    els.table.querySelectorAll('button').forEach(function (button) {
      button.classList.remove('is-selected', 'is-winning', 'has-active-bet');
      if (button.dataset.bet === details.betType && details.betType !== 'single') {
        button.classList.add('is-selected');
      }
      if (details.betType === 'single' && button.dataset.number === details.singleNumber) {
        button.classList.add('is-selected');
      }
      if (state.activeBets.some(function (bet) {
        return (button.dataset.bet && button.dataset.bet === bet.betType) ||
          (bet.betType === 'single' && button.dataset.number === bet.singleNumber);
      })) {
        button.classList.add('has-active-bet');
      }
      if (winningValue && button.dataset.number === winningValue) {
        button.classList.add('is-winning');
      }
    });
  }

  function validateBet(betDetails) {
    const details = betDetails || currentBetDetails();
    if (state.spinning) return { ok: false, message: 'Wait for the current spin to finish.' };
    if (state.bankroll <= 0) return { ok: false, message: 'Your bankroll is empty. Reset the simulator to keep testing.' };
    if (details.betAmount > availableBankroll()) return { ok: false, message: BANKROLL_REJECT_MESSAGE };
    if (details.betType === 'single' && !isValidSingleNumber(details.singleNumber || getSingleNumber(), details.wheelType)) {
      return { ok: false, message: details.wheelType === 'american' ? 'Enter 0, 00, or 1–36 for American roulette.' : 'Enter a number from 0–36 for European roulette.' };
    }
    return { ok: true };
  }

  function addActiveBet(betDetails) {
    const validation = validateBet(betDetails);
    if (!validation.ok) {
      setStatus(validation.message);
      playSound('fail');
      return false;
    }

    state.activeBets.push(cloneBet(betDetails));
    setStatus(`${betLabel(betDetails)} bet added for ${toMoney(betDetails.betAmount)}. Active total: ${toMoney(activeBetTotal())}.`);
    playSound('chip');
    highlightSelection();
    updateDisplays();
    updateControls();
    return true;
  }

  function clearBetsForWheelChange() {
    state.activeBets = [];
    state.lastBets = [];
    buildTable();
    buildWheelNumbers();
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

  function resultExplanation(value, resolvedBets, net) {
    if (!resolvedBets.length) return 'Spin once to see how roulette variance treats this bet.';
    const wins = resolvedBets.filter(function (bet) { return bet.won; });
    if (wins.length) {
      return `${wins.length} of ${resolvedBets.length} active bet${resolvedBets.length === 1 ? '' : 's'} hit on ${value}. Net result: ${net >= 0 ? '+' : '-'}${toMoney(Math.abs(net))}.`;
    }
    return `The wheel landed on ${value}. All ${resolvedBets.length} active bet${resolvedBets.length === 1 ? '' : 's'} missed, so the active stake was lost.`;
  }

  function finishSpin(value, spinBets) {
    const color = numberColor(value);
    let net = 0;
    const resolvedBets = spinBets.map(function (bet) {
      const won = didBetWin(value, bet);
      const payout = bet.betType === 'single' ? 35 : 1;
      const result = won ? bet.betAmount * payout : -bet.betAmount;
      net += result;
      return Object.assign({}, bet, { won, result });
    });

    state.bankroll = Math.max(0, state.bankroll + net);
    state.totalSpins += 1;
    if (net > 0) {
      state.biggestWin = Math.max(state.biggestWin, net);
    } else {
      state.biggestLoss = Math.max(state.biggestLoss, Math.abs(net));
    }

    const streakType = net > 0 ? 'Win Streak' : 'Loss Streak';
    state.currentStreakCount = state.currentStreakType === streakType ? state.currentStreakCount + 1 : 1;
    state.currentStreakType = streakType;

    els.winningNumber.textContent = value;
    els.winningColor.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    els.outcome.textContent = net > 0 ? 'Win' : 'Loss';
    els.amountResult.textContent = net >= 0 ? `+${toMoney(net)}` : `-${toMoney(Math.abs(net))}`;
    els.explanation.textContent = resultExplanation(value, resolvedBets, net);
    els.wheelResult.textContent = value;
    els.wheel.setAttribute('aria-label', `Roulette wheel landed on ${value}`);
    els.wheel.classList.toggle('roulette-wheel-win', net > 0);
    els.wheel.classList.toggle('roulette-wheel-loss', net <= 0);

    state.lastBets = spinBets.map(cloneBet);
    state.activeBets = [];
    highlightSelection(value, spinBets[0]);
    updateDisplays();
    setStatus(`${net > 0 ? 'Win' : 'Loss'} on ${value}. Bankroll is now ${toMoney(state.bankroll)}.`);
    playSound(net > 0 ? 'win' : 'lose');

    state.spinning = false;
    els.spinButton.disabled = false;
    updateControls();
  }

  function ensureActiveBetForSpin() {
    if (state.activeBets.length) return true;
    return addActiveBet(currentBetDetails());
  }

  function spin() {
    initAudio();
    if (!ensureActiveBetForSpin()) return;

    const totalStaked = activeBetTotal();
    if (totalStaked > state.bankroll) {
      rejectOverBankroll();
      return;
    }

    const spinBets = state.activeBets.map(cloneBet);
    const value = spinOutcome(els.wheelType.value);
    state.spinning = true;
    els.spinButton.disabled = true;
    updateControls();
    els.wheel.classList.remove('roulette-wheel-win', 'roulette-wheel-loss');
    highlightSelection();
    setStatus('Wheel spinning...');

    stopSound('spin');
    playSound('spin');

    const numbers = wheelNumbers(els.wheelType.value);
    const pocketIndex = numbers.indexOf(value);
    const pocketDegrees = 360 / numbers.length;
    state.rotation += 1080 + (360 - pocketIndex * pocketDegrees) + Math.random() * (pocketDegrees * 0.35);
    els.wheel.style.transform = `rotate(${state.rotation}deg)`;

    if (state.spinTimer) window.clearTimeout(state.spinTimer);
    state.spinTimer = window.setTimeout(function () {
      state.spinTimer = null;
      stopSound('spin');
      finishSpin(value, spinBets);
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
    state.activeBets = [];
    state.lastBets = [];
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
    addActiveBet(currentBetDetails());
  });

  els.chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      initAudio();
      const chipAmount = Number(button.dataset.chip) || 0;
      if (chipAmount > availableBankroll()) {
        rejectOverBankroll();
        updateControls();
        return;
      }
      els.betAmount.value = String(chipAmount);
      setStatus(`Selected ${toMoney(chipAmount)} chip.`);
      playSound('chip');
      updateControls();
      updateDisplays();
    });
  });

  if (els.repeatBetButton) {
    els.repeatBetButton.addEventListener('click', function () {
      initAudio();
      const repeatTotal = state.lastBets.reduce(function (total, bet) { return total + bet.betAmount; }, 0);
      if (!state.lastBets.length) {
        setStatus('No previous bet to repeat yet.');
        return;
      }
      if (repeatTotal > availableBankroll()) {
        rejectOverBankroll();
        updateControls();
        return;
      }
      state.activeBets = state.activeBets.concat(state.lastBets.map(cloneBet));
      setStatus(`Repeated ${state.lastBets.length} bet${state.lastBets.length === 1 ? '' : 's'} for ${toMoney(repeatTotal)}.`);
      playSound('chips');
      highlightSelection();
      updateDisplays();
      updateControls();
    });
  }

  if (els.clearBetsButton) {
    els.clearBetsButton.addEventListener('click', function () {
      initAudio();
      state.activeBets = [];
      setStatus('Active bets cleared. Choose a new spot on the felt.');
      highlightSelection();
      updateDisplays();
      updateControls();
      playSound('chip');
    });
  }

  [els.startingBankroll, els.betAmount, els.wheelType, els.betType, els.singleNumber].forEach(function (control) {
    control.addEventListener('input', function () {
      initAudio();
      if (control === els.startingBankroll && state.totalSpins === 0) {
        state.startingBankroll = getStartingBankroll();
        state.bankroll = state.startingBankroll;
        if (activeBetTotal() > state.bankroll) state.activeBets = [];
      }
      if (control === els.wheelType) {
        clearBetsForWheelChange();
      }
      updateControls();
      highlightSelection();
      updateDisplays();
    });

    control.addEventListener('change', function () {
      initAudio();
      if (control === els.wheelType) {
        clearBetsForWheelChange();
      }
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

  buildWheelNumbers();
  buildTable();
  updateControls();
  updateDisplays();
})();
