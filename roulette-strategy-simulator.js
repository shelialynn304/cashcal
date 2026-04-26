(function initRouletteStrategySimulator() {
  if (!window.RouletteMath || !document.getElementById('compareBtn')) return;

  const { clampNumber, calculateSpinMath, formatMoney, toPercent, randomSpinWin } = window.RouletteMath;

  const strategyDefs = [
    { key: 'flat', name: 'Flat Betting' },
    { key: 'martingale', name: 'Martingale' },
    { key: 'fibonacci', name: 'Fibonacci' },
    { key: 'dalembert', name: 'D’Alembert' }
  ];

  function nextBetState(strategy, state, won, baseBet) {
    if (strategy === 'flat') return { step: 1, bet: baseBet };

    if (strategy === 'martingale') {
      return won
        ? { step: 1, bet: baseBet }
        : { step: state.step + 1, bet: baseBet * (2 ** state.step) };
    }

    if (strategy === 'fibonacci') {
      const sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      const nextStep = won ? Math.max(1, state.step - 2) : Math.min(sequence.length, state.step + 1);
      return { step: nextStep, bet: baseBet * sequence[nextStep - 1] };
    }

    const nextStep = won ? Math.max(1, state.step - 1) : state.step + 1;
    return { step: nextStep, bet: baseBet * nextStep };
  }

  function simulateSession(options, strategyKey) {
    const evenMoneyMath = calculateSpinMath(options.wheelType, 'evenMoney', options.baseBet);
    const startBankroll = options.bankroll;

    let bankroll = startBankroll;
    let state = { step: 1, bet: options.baseBet };
    let peakBet = options.baseBet;
    let spinsPlayed = 0;

    for (let i = 0; i < options.spins; i += 1) {
      const currentBet = Math.max(options.baseBet, Math.round(state.bet));
      if (bankroll < currentBet) break;

      const won = randomSpinWin(evenMoneyMath.winProb);
      bankroll += won ? currentBet : -currentBet;
      spinsPlayed += 1;

      if (bankroll - startBankroll >= options.targetProfit) break;

      state = nextBetState(strategyKey, state, won, options.baseBet);
      peakBet = Math.max(peakBet, state.bet);
    }

    return {
      endingBankroll: bankroll,
      sessionProfit: bankroll - startBankroll,
      busted: bankroll < options.baseBet,
      spinsPlayed,
      peakBet
    };
  }

  function getSettings() {
    return {
      wheelType: document.getElementById('wheelType').value,
      sessions: clampNumber(document.getElementById('sessions').value, 1200, 100),
      spins: clampNumber(document.getElementById('spins').value, 180, 10),
      bankroll: clampNumber(document.getElementById('bankroll').value, 300, 25),
      baseBet: clampNumber(document.getElementById('baseBet').value, 10, 1),
      targetProfit: clampNumber(document.getElementById('targetProfit').value, 60, 0)
    };
  }

  function compareStrategies() {
    const settings = getSettings();
    const rows = [];

    strategyDefs.forEach((strategy) => {
      let bustCount = 0;
      let profitCount = 0;
      let cumulative = 0;
      let peakExposure = 0;

      for (let s = 0; s < settings.sessions; s += 1) {
        const outcome = simulateSession(settings, strategy.key);
        if (outcome.busted) bustCount += 1;
        if (outcome.sessionProfit > 0) profitCount += 1;
        cumulative += outcome.sessionProfit;
        peakExposure = Math.max(peakExposure, outcome.peakBet);
      }

      const avgProfit = cumulative / settings.sessions;
      rows.push(`<div class="result-item"><span>${strategy.name}</span><strong>Avg Session: ${formatMoney(avgProfit)} | Profit Sessions: ${toPercent(profitCount / settings.sessions, 1)} | Bust Risk: ${toPercent(bustCount / settings.sessions, 1)} | Peak Bet Seen: ${formatMoney(peakExposure)}</strong></div>`);
    });

    document.getElementById('strategyResults').innerHTML = rows.join('');
  }

  function runDrainDemo() {
    const settings = getSettings();
    const rows = [];

    strategyDefs.forEach((strategy) => {
      const outcome = simulateSession(settings, strategy.key);
      rows.push(`<div class="result-item"><span>${strategy.name}</span><strong>Spins: ${outcome.spinsPlayed}/${settings.spins} | End Bankroll: ${formatMoney(outcome.endingBankroll)} | Net: ${formatMoney(outcome.sessionProfit)} | Peak Bet: ${formatMoney(outcome.peakBet)}${outcome.busted ? ' | Bankroll Drained' : ''}</strong></div>`);
    });

    document.getElementById('drainResults').innerHTML = rows.join('');
  }

  document.getElementById('compareBtn').addEventListener('click', compareStrategies);
  document.getElementById('drainBtn').addEventListener('click', runDrainDemo);

  compareStrategies();
}());
