(function initRouletteStrategySimulator() {
  if (!window.RouletteMath || !document.getElementById('compareBtn')) return;

  const {
    calculateSpinMath,
    formatMoney,
    toPercent,
    randomSpinWin,
    flatStep,
    martingaleStep,
    fibonacciStep,
    dalembertStep
  } = window.RouletteMath;

  const strategyDefs = [
    { key: 'flat', name: 'Flat Betting' },
    { key: 'martingale', name: 'Martingale' },
    { key: 'fibonacci', name: 'Fibonacci' },
    { key: 'dalembert', name: 'D’Alembert' }
  ];

  const MAX_SESSION_SPINS = 5000000;

  function roundCents(value) {
    return Math.round(value * 100) / 100;
  }

  function nextBetState(strategy, state, won, baseBet) {
    if (strategy === 'flat') {
      return { step: 1, bet: flatStep(baseBet) };
    }

    if (strategy === 'martingale') {
      const nextBet = martingaleStep(baseBet, state.bet, won);
      return {
        step: won ? 1 : state.step + 1,
        bet: nextBet
      };
    }

    if (strategy === 'fibonacci') {
      // fibonacciStep extends the 1, 1, 2, 3, 5... sequence as far as the losses go.
      const fibResult = fibonacciStep(baseBet, won, {
        sequence: state.seq || [1, 1],
        index: state.step - 1
      });
      return {
        step: fibResult.index + 1,
        bet: fibResult.stake,
        seq: fibResult.sequence
      };
    }

    const nextBet = dalembertStep(baseBet, state.bet, won);
    const nextStep = won ? Math.max(1, state.step - 1) : state.step + 1;
    return { step: nextStep, bet: nextBet };
  }

  function simulateSession(options, strategyKey) {
    const evenMoneyMath = calculateSpinMath(options.wheelType, 'evenMoney', options.baseBet);
    const startBankroll = options.bankroll;

    let bankroll = startBankroll;
    let state = { step: 1, bet: options.baseBet };
    let peakBet = 0;
    let spinsPlayed = 0;
    let totalWagered = 0;
    let stoppedShort = false;
    let unplacedBet = 0;

    for (let i = 0; i < options.spins; i += 1) {
      const currentBet = roundCents(Math.max(options.baseBet, state.bet));
      if (bankroll < currentBet) {
        // The system needs a bet the bankroll cannot cover: count it as a bust.
        stoppedShort = true;
        unplacedBet = currentBet;
        break;
      }

      const won = randomSpinWin(evenMoneyMath.winProb);
      bankroll = roundCents(bankroll + (won ? currentBet : -currentBet));
      spinsPlayed += 1;
      totalWagered += currentBet;
      peakBet = Math.max(peakBet, currentBet);

      if (options.targetProfit > 0 && bankroll - startBankroll >= options.targetProfit) break;

      state = nextBetState(strategyKey, state, won, options.baseBet);
    }

    return {
      endingBankroll: bankroll,
      sessionProfit: bankroll - startBankroll,
      busted: stoppedShort || bankroll < options.baseBet,
      stoppedShort,
      unplacedBet,
      spinsPlayed,
      totalWagered,
      peakBet
    };
  }

  function readNumber(id) {
    const raw = String(document.getElementById(id).value).trim();
    return raw === '' ? NaN : Number(raw);
  }

  // Returns { settings } or { error }. Nothing is clamped silently.
  function getSettings() {
    const sessions = readNumber('sessions');
    const spins = readNumber('spins');
    const bankroll = readNumber('bankroll');
    const baseBet = readNumber('baseBet');
    const targetRaw = String(document.getElementById('targetProfit').value).trim();
    const targetProfit = targetRaw === '' ? 0 : Number(targetRaw);

    if (!Number.isInteger(sessions) || sessions < 100) return { error: 'Sessions to simulate must be a whole number of at least 100.' };
    if (!Number.isInteger(spins) || spins < 10) return { error: 'Spins per session must be a whole number of at least 10.' };
    if (!Number.isFinite(bankroll) || bankroll < 25) return { error: 'Starting bankroll must be a number of at least $25.' };
    if (!Number.isFinite(baseBet) || baseBet < 1) return { error: 'Base bet must be a number of at least $1.' };
    if (baseBet > bankroll) return { error: 'Base bet cannot be larger than the starting bankroll.' };
    if (!Number.isFinite(targetProfit)) return { error: 'Stop-win target must be a number, or leave it blank for no stop-win.' };
    if (sessions * spins > MAX_SESSION_SPINS) return { error: 'Sessions x spins must be 5,000,000 or fewer. Lower the sessions or the spins per session.' };

    return {
      settings: {
        wheelType: document.getElementById('wheelType').value,
        sessions,
        spins,
        bankroll,
        baseBet,
        targetProfit: targetProfit > 0 ? targetProfit : 0
      }
    };
  }

  function readSettingsOrShowError(outputId) {
    const errorEl = document.getElementById('strategyError');
    const parsed = getSettings();
    if (parsed.error) {
      if (errorEl) errorEl.textContent = parsed.error;
      document.getElementById(outputId).innerHTML = '';
      return null;
    }
    if (errorEl) errorEl.textContent = '';
    return parsed.settings;
  }

  function compareStrategies() {
    const settings = readSettingsOrShowError('strategyResults');
    if (!settings) return;
    const rows = [];
    // House edge per $1 wagered on an even-money bet: 1/37 European, 2/38 American.
    const houseEdge = -calculateSpinMath(settings.wheelType, 'evenMoney', 1).evUnits;

    strategyDefs.forEach((strategy) => {
      let bustCount = 0;
      let profitCount = 0;
      let cumulative = 0;
      let wageredTotal = 0;
      let spinsTotal = 0;
      let peakExposure = 0;
      let largestUnplaced = 0;

      for (let s = 0; s < settings.sessions; s += 1) {
        const outcome = simulateSession(settings, strategy.key);
        if (outcome.busted) bustCount += 1;
        if (outcome.sessionProfit > 0) profitCount += 1;
        cumulative += outcome.sessionProfit;
        wageredTotal += outcome.totalWagered;
        spinsTotal += outcome.spinsPlayed;
        peakExposure = Math.max(peakExposure, outcome.peakBet);
        if (outcome.stoppedShort) largestUnplaced = Math.max(largestUnplaced, outcome.unplacedBet);
      }

      const avgProfit = cumulative / settings.sessions;
      const avgWagered = wageredTotal / settings.sessions;
      const avgSpins = spinsTotal / settings.sessions;
      const edgeLoss = houseEdge * avgWagered;
      const unplacedText = largestUnplaced > peakExposure ? ` | Next bet required but not placed: up to ${formatMoney(largestUnplaced)}` : '';
      rows.push(`<div class="result-item"><span>${strategy.name}</span><strong>Avg Session: ${formatMoney(avgProfit)} | Expected at house edge: ${formatMoney(-edgeLoss)} (${toPercent(houseEdge, 2)} x avg wagered) | Avg wagered: ${formatMoney(avgWagered)} | Avg spins played: ${avgSpins.toFixed(1)} | Profit Sessions: ${toPercent(profitCount / settings.sessions, 1)} | Bust / can't cover next bet: ${toPercent(bustCount / settings.sessions, 1)} | Peak Bet Placed: ${formatMoney(peakExposure)}${unplacedText}</strong></div>`);
    });

    rows.push(`<p class="small-note mb-0">Every system loses about ${toPercent(houseEdge, 2)} of each dollar wagered. Progressions can show a smaller average session loss only because their sessions end sooner with less money wagered, not because they cut the house edge.</p>`);

    document.getElementById('strategyResults').innerHTML = rows.join('');
  }

  function runDrainDemo() {
    const settings = readSettingsOrShowError('drainResults');
    if (!settings) return;
    const rows = [];

    strategyDefs.forEach((strategy) => {
      const outcome = simulateSession(settings, strategy.key);
      let endNote = '';
      if (outcome.stoppedShort && strategy.key !== 'flat') {
        endNote = ` | Progression stopped: next bet ${formatMoney(outcome.unplacedBet)} > bankroll ${formatMoney(outcome.endingBankroll)}`;
      } else if (outcome.busted) {
        endNote = ' | Bankroll Drained';
      }
      rows.push(`<div class="result-item"><span>${strategy.name}</span><strong>Spins: ${outcome.spinsPlayed}/${settings.spins} | End Bankroll: ${formatMoney(outcome.endingBankroll)} | Net: ${formatMoney(outcome.sessionProfit)} | Peak Bet: ${formatMoney(outcome.peakBet)}${endNote}</strong></div>`);
    });

    document.getElementById('drainResults').innerHTML = rows.join('');
  }

  document.getElementById('compareBtn').addEventListener('click', compareStrategies);
  document.getElementById('drainBtn').addEventListener('click', runDrainDemo);

  compareStrategies();
}());
