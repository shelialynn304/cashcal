(function () {
  const BET_TYPES = {
    straight: { label: 'Straight (1 number)', covered: 1, payout: 35 },
    split: { label: 'Split (2 numbers)', covered: 2, payout: 17 },
    street: { label: 'Street (3 numbers)', covered: 3, payout: 11 },
    corner: { label: 'Corner (4 numbers)', covered: 4, payout: 8 },
    sixline: { label: 'Six line (6 numbers)', covered: 6, payout: 5 },
    redblack: { label: 'Red / Black', covered: 18, payout: 1 },
    oddeven: { label: 'Odd / Even', covered: 18, payout: 1 },
    highlow: { label: 'High / Low', covered: 18, payout: 1 },
    dozens: { label: 'Dozens', covered: 12, payout: 2 },
    columns: { label: 'Columns', covered: 12, payout: 2 }
  };

  const STRATEGIES = ['flat', 'martingale', 'fibonacci', 'dalembert'];

  function getEl(id) {
    return document.getElementById(id);
  }

  function money(v) {
    return `$${v.toFixed(2)}`;
  }

  function clampInt(value, fallback, min) {
    return Math.max(min, Number(value) || fallback);
  }

  function wheelMeta(type) {
    if (type === 'american') {
      return { pockets: 38, edge: 5.26, labels: ['0', '00'] };
    }
    return { pockets: 37, edge: 2.7, labels: ['0'] };
  }

  function spinNumber(wheelType) {
    const { pockets } = wheelMeta(wheelType);
    const n = Math.floor(Math.random() * pockets);
    if (wheelType === 'american' && n === 37) return '00';
    return String(n);
  }

  function getWinProb(wheelType, betTypeKey) {
    const bet = BET_TYPES[betTypeKey];
    const { pockets } = wheelMeta(wheelType);
    return bet.covered / pockets;
  }

  function buildBetTypes() {
    const select = getEl('betType');
    if (!select) return;
    select.innerHTML = Object.entries(BET_TYPES)
      .map(([key, val]) => `<option value="${key}">${val.label} (${val.payout}:1)</option>`)
      .join('');
    select.value = 'redblack';
  }

  function nextBet(strategy, baseBet, state, wonLastRound) {
    if (strategy === 'flat') {
      state.unit = 1;
      return baseBet;
    }

    if (strategy === 'martingale') {
      state.unit = wonLastRound ? 1 : state.unit * 2;
      return baseBet * state.unit;
    }

    if (strategy === 'dalembert') {
      if (wonLastRound) {
        state.unit = Math.max(1, state.unit - 1);
      } else {
        state.unit += 1;
      }
      return baseBet * state.unit;
    }

    if (strategy === 'fibonacci') {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      if (wonLastRound) {
        state.index = Math.max(0, state.index - 2);
      } else {
        state.index = Math.min(fib.length - 1, state.index + 1);
      }
      return baseBet * fib[state.index];
    }

    return baseBet;
  }

  function runSession(config) {
    const {
      bankroll,
      baseBet,
      spins,
      wheelType,
      betType,
      strategy,
      maxBetMultiplier = 60
    } = config;

    let roll = bankroll;
    const winProb = getWinProb(wheelType, betType);
    const payout = BET_TYPES[betType].payout;
    const state = { unit: 1, index: 0 };
    let currentBet = baseBet;
    let wonLastRound = true;
    let played = 0;

    for (let i = 0; i < spins; i += 1) {
      currentBet = Math.min(nextBet(strategy, baseBet, state, wonLastRound), baseBet * maxBetMultiplier);
      if (roll < currentBet) break;

      const won = Math.random() < winProb;
      if (won) {
        roll += currentBet * payout;
      } else {
        roll -= currentBet;
      }
      wonLastRound = won;
      played += 1;
    }

    return {
      ending: roll,
      profit: roll > bankroll,
      bust: roll < baseBet,
      played
    };
  }

  function monteCarlo(config, sessions) {
    let profitCount = 0;
    let bustCount = 0;
    let endingTotal = 0;
    let playedTotal = 0;

    for (let i = 0; i < sessions; i += 1) {
      const result = runSession(config);
      endingTotal += result.ending;
      playedTotal += result.played;
      if (result.profit) profitCount += 1;
      if (result.bust) bustCount += 1;
    }

    return {
      profitPct: (profitCount / sessions) * 100,
      bustPct: (bustCount / sessions) * 100,
      avgEnd: endingTotal / sessions,
      avgSpins: playedTotal / sessions
    };
  }

  function collectInputs() {
    const wheel = getEl('wheelType');
    const betType = getEl('betType');
    const bankroll = getEl('bankroll');
    const betSize = getEl('betSize');
    const spins = getEl('spins');
    const sessions = getEl('sessions');

    if (!wheel || !betType || !bankroll || !betSize || !spins || !sessions) return null;

    return {
      wheelType: wheel.value,
      betType: betType.value,
      bankroll: clampInt(bankroll.value, 300, 10),
      baseBet: clampInt(betSize.value, 10, 1),
      spins: clampInt(spins.value, 120, 1),
      sessions: clampInt(sessions.value, 1500, 200)
    };
  }

  function renderCalculator() {
    const inputs = collectInputs();
    if (!inputs) return;

    const winProb = getWinProb(inputs.wheelType, inputs.betType);
    const payout = BET_TYPES[inputs.betType].payout;
    const { edge } = wheelMeta(inputs.wheelType);
    const lossRate = edge / 100;
    const expectedLoss = inputs.baseBet * inputs.spins * lossRate;
    const expectedEnd = Math.max(0, inputs.bankroll - expectedLoss);

    const sim = monteCarlo(
      {
        bankroll: inputs.bankroll,
        baseBet: inputs.baseBet,
        spins: inputs.spins,
        wheelType: inputs.wheelType,
        betType: inputs.betType,
        strategy: 'flat'
      },
      inputs.sessions
    );

    const map = {
      payoutStat: `${payout}:1`,
      winChance: `${(winProb * 100).toFixed(2)}%`,
      houseEdge: `${edge.toFixed(2)}%`,
      expectedLoss: money(expectedLoss),
      endBankroll: money(expectedEnd),
      bustRisk: `${sim.bustPct.toFixed(1)}%`
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = getEl(id);
      if (el) el.textContent = value;
    });

    const summary = getEl('summary');
    if (summary) {
      summary.textContent = `On ${inputs.wheelType} roulette with ${BET_TYPES[inputs.betType].label.toLowerCase()}, average loss pressure is about ${money(expectedLoss)} over ${inputs.spins} spins. Strategy can change swings, but not the long-term house edge.`;
    }
  }

  function renderSpinLog() {
    const inputs = collectInputs();
    const log = getEl('spinLog');
    if (!inputs || !log) return;

    let roll = inputs.bankroll;
    const winProb = getWinProb(inputs.wheelType, inputs.betType);
    const payout = BET_TYPES[inputs.betType].payout;
    const maxSpins = Math.min(30, inputs.spins);
    const rows = [];

    for (let i = 1; i <= maxSpins; i += 1) {
      if (roll < inputs.baseBet) {
        rows.push(`<div class="result-item"><span>Spin ${i}</span><strong>Stopped: bankroll below next bet.</strong></div>`);
        break;
      }
      const won = Math.random() < winProb;
      roll += won ? inputs.baseBet * payout : -inputs.baseBet;
      rows.push(`<div class="result-item"><span>Spin ${i}</span><strong>${won ? `Win +${money(inputs.baseBet * payout)}` : `Loss -${money(inputs.baseBet)}`} | Bankroll ${money(roll)}</strong></div>`);
    }

    log.innerHTML = rows.join('');
  }

  function renderSingleSpin() {
    const inputs = collectInputs();
    const box = getEl('singleSpinResult');
    if (!inputs || !box) return;

    const num = spinNumber(inputs.wheelType);
    let color = 'Green';
    if (num !== '0' && num !== '00') {
      const n = Number(num);
      color = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n) ? 'Red' : 'Black';
    }
    box.innerHTML = `<span>Latest spin</span><strong>${num} (${color})</strong>`;
  }

  function renderStrategyComparison() {
    const inputs = collectInputs();
    const wrap = getEl('strategyCards');
    if (!inputs || !wrap) return;

    const cards = STRATEGIES.map((strategy) => {
      const result = monteCarlo(
        {
          bankroll: inputs.bankroll,
          baseBet: inputs.baseBet,
          spins: inputs.spins,
          wheelType: inputs.wheelType,
          betType: inputs.betType,
          strategy
        },
        Math.max(300, Math.floor(inputs.sessions / 2))
      );

      const title = strategy === 'dalembert' ? 'D’Alembert' : strategy.charAt(0).toUpperCase() + strategy.slice(1);
      return `<article class="result-item"><span>${title}</span><strong>Profit ${result.profitPct.toFixed(1)}%</strong><span>Bust ${result.bustPct.toFixed(1)}% · Avg end ${money(result.avgEnd)}</span></article>`;
    });

    wrap.innerHTML = cards.join('');
  }

  function renderRiskEstimator() {
    const inputs = collectInputs();
    const riskStrategy = getEl('riskStrategy');
    const riskSessions = getEl('riskSessions');
    const wrap = getEl('riskCards');
    if (!inputs || !riskStrategy || !riskSessions || !wrap) return;

    const sessions = clampInt(riskSessions.value, 2000, 200);
    const result = monteCarlo(
      {
        bankroll: inputs.bankroll,
        baseBet: inputs.baseBet,
        spins: inputs.spins,
        wheelType: inputs.wheelType,
        betType: inputs.betType,
        strategy: riskStrategy.value
      },
      sessions
    );

    wrap.innerHTML = [
      `<div class="result-item"><span>Strategy</span><strong>${riskStrategy.options[riskStrategy.selectedIndex].text}</strong></div>`,
      `<div class="result-item"><span>Chance of any profit</span><strong>${result.profitPct.toFixed(1)}%</strong></div>`,
      `<div class="result-item"><span>Estimated bust risk</span><strong>${result.bustPct.toFixed(1)}%</strong></div>`,
      `<div class="result-item"><span>Average spins survived</span><strong>${result.avgSpins.toFixed(0)} / ${inputs.spins}</strong></div>`,
      `<div class="result-item"><span>Average ending bankroll</span><strong>${money(result.avgEnd)}</strong></div>`
    ].join('');
  }

  function init() {
    buildBetTypes();
    renderCalculator();
    renderSpinLog();
    renderStrategyComparison();
    renderRiskEstimator();

    const bind = (id, fn) => {
      const el = getEl(id);
      if (el) el.addEventListener('click', fn);
    };

    bind('calcBtn', renderCalculator);
    bind('spinDemoBtn', renderSpinLog);
    bind('singleSpinBtn', renderSingleSpin);
    bind('strategyCompareBtn', renderStrategyComparison);
    bind('riskBtn', renderRiskEstimator);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
