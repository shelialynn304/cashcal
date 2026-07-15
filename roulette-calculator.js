(function initRouletteCalculator() {
  if (!window.RouletteMath || !document.getElementById('calcBtn')) return;

  const {
    ROULETTE_BET_TYPES,
    clampNumber,
    calculateSpinMath,
    formatMoney,
    toPercent,
    randomSpinWin,
    hasBetType
  } = window.RouletteMath;

  const betTypeSelect = document.getElementById('betType');
  betTypeSelect.innerHTML = Object.values(ROULETTE_BET_TYPES)
    .map((bet) => `<option value="${bet.key}">${bet.label}</option>`)
    .join('');
  betTypeSelect.value = 'evenMoney';

  function validateRouletteCalculatorInputs(input) {
    const wheelTypes = ['european', 'american'];
    const wheelType = String(input.wheelType || '').trim().toLowerCase();
    const betType = String(input.betType || '').trim();
    const bankroll = Number(input.bankroll);
    const betSize = Number(input.betSize);
    const spins = Number.parseInt(input.spins, 10);
    const sessions = Number.parseInt(input.sessions, 10);

    if (wheelTypes.indexOf(wheelType) === -1) return 'Wheel type must be european or american.';
    if (!hasBetType(betType) || !ROULETTE_BET_TYPES[betType]) return 'Choose a supported roulette wager type.';
    if (!Number.isFinite(bankroll) || bankroll < 10) return 'Starting bankroll must be at least $10.';
    if (!Number.isFinite(betSize) || betSize < 1) return 'Bet size must be at least $1.';
    if (betSize > bankroll) return 'Bet size must not exceed bankroll.';
    if (!Number.isFinite(spins) || spins < 1 || spins > 100000) return 'Spins must be between 1 and 100,000.';
    if (!Number.isFinite(sessions) || sessions < 200 || sessions > 50000) return 'Simulation sessions must be between 200 and 50,000.';
    return '';
  }

  function normalizeRouletteCalculatorInputs(input) {
    return {
      wheelType: String(input.wheelType || '').trim().toLowerCase(),
      betType: String(input.betType || '').trim(),
      bankroll: Number(input.bankroll),
      betSize: Number(input.betSize),
      spins: Number.parseInt(input.spins, 10),
      sessions: Number.parseInt(input.sessions, 10)
    };
  }

  function runMonteCarlo(input) {
    let profitSessions = 0;
    let bustSessions = 0;

    for (let s = 0; s < input.sessions; s += 1) {
      let roll = input.bankroll;

      for (let i = 0; i < input.spins; i += 1) {
        if (roll < input.betSize) break;
        const win = randomSpinWin(input.winProb);
        roll += win ? input.betSize * input.payout : -input.betSize;
      }

      if (roll > input.bankroll) profitSessions += 1;
      if (roll < input.betSize) bustSessions += 1;
    }

    return {
      profitChance: profitSessions / input.sessions,
      bustRisk: bustSessions / input.sessions
    };
  }


  function calculateRouletteProbability(input) {
    const normalized = normalizeRouletteCalculatorInputs(input);
    const error = validateRouletteCalculatorInputs(normalized);
    if (error) throw new Error(error);

    const math = calculateSpinMath(normalized.wheelType, normalized.betType, normalized.betSize);
    const expectedLoss = Math.max(0, -(math.evDollars * normalized.spins));
    const expectedEnding = normalized.bankroll - expectedLoss;
    const sim = runMonteCarlo({
      sessions: normalized.sessions,
      spins: normalized.spins,
      bankroll: normalized.bankroll,
      betSize: normalized.betSize,
      winProb: math.winProb,
      payout: math.bet.payout
    });

    return { ...normalized, math, expectedLoss, expectedEnding, sim };
  }

  function formatRouletteProbabilityText(result) {
    return `Educational estimate only: on ${result.math.wheel.label} roulette, a ${formatMoney(result.betSize)} ${result.math.bet.label.toLowerCase()} has ${toPercent(result.math.winProb, 2)} win chance per spin and ${formatMoney(result.math.evDollars)} EV per spin. Over ${result.spins} spins, expected loss is ${formatMoney(result.expectedLoss)}, estimated bust risk is ${toPercent(result.sim.bustRisk, 1)}, and chance of any profit is ${toPercent(result.sim.profitChance, 1)}. These estimates do not guarantee gambling outcomes.`;
  }

  function renderRouletteProbability(result, markResultReady) {
    document.getElementById('winChance').textContent = toPercent(result.math.winProb, 2);
    document.getElementById('payoutRatio').textContent = `${result.math.bet.payout}:1`;
    document.getElementById('houseEdge').textContent = `${result.math.wheel.houseEdge.toFixed(2)}%`;
    document.getElementById('evSpin').textContent = formatMoney(result.math.evDollars);
    document.getElementById('expectedLoss').textContent = formatMoney(result.expectedLoss);
    document.getElementById('endBankroll').textContent = formatMoney(result.expectedEnding);
    document.getElementById('profitChance').textContent = toPercent(result.sim.profitChance, 1);
    document.getElementById('bustRisk').textContent = toPercent(result.sim.bustRisk, 1);

    const summary = document.getElementById('summary');
    summary.textContent = formatRouletteProbabilityText(result);
    summary.dataset.resultReady = markResultReady ? 'true' : 'false';

    const resultExplanation = document.getElementById('roulette-result-explanation');
    if (resultExplanation) {
      const sessionTone = result.spins <= 50 ? 'This is a short session, so winning, weird, or choppy results can absolutely happen.' : 'This is a longer session, so the house edge gets more chances to show up through the noise.';
      resultExplanation.textContent = `Winning sessions can happen, especially over short runs. ${sessionTone} Your ${formatMoney(result.betSize)} bet on ${result.math.wheel.label.toLowerCase()} roulette creates an estimated ${toPercent(result.sim.bustRisk, 1)} bust risk across ${result.sessions} simulated sessions. Educational estimates do not guarantee outcomes.`;
    }
  }

  function calculateOdds(markResultReady) {
    const input = {
      wheelType: document.getElementById('wheelType').value,
      betType: document.getElementById('betType').value,
      bankroll: document.getElementById('bankroll').value,
      betSize: document.getElementById('betSize').value,
      spins: document.getElementById('spins').value,
      sessions: document.getElementById('sessions').value
    };
    const result = calculateRouletteProbability(input);
    renderRouletteProbability(result, markResultReady);
  }

  function runDemoSession() {
    const wheelType = document.getElementById('wheelType').value;
    const betType = document.getElementById('betType').value;
    const bankroll = clampNumber(document.getElementById('bankroll').value, 300, 10);
    const betSize = clampNumber(document.getElementById('betSize').value, 10, 1);
    const spins = Math.min(40, clampNumber(document.getElementById('spins').value, 40, 1));
    const math = calculateSpinMath(wheelType, betType, betSize);

    let roll = bankroll;
    const rows = [];

    for (let i = 1; i <= spins; i += 1) {
      if (roll < betSize) {
        rows.push(`<div class="result-item"><span>Spin ${i}</span><strong>Stop: bankroll below bet size (${formatMoney(roll)}).</strong></div>`);
        break;
      }

      const win = randomSpinWin(math.winProb);
      roll += win ? betSize * math.bet.payout : -betSize;
      rows.push(`<div class="result-item"><span>Spin ${i}</span><strong>${win ? `Win +${formatMoney(betSize * math.bet.payout)}` : `Lose -${formatMoney(betSize)}`} | Bankroll ${formatMoney(roll)}</strong></div>`);
    }

    document.getElementById('spinLog').innerHTML = rows.join('');
  }

  function registerRouletteWebMcp() {
    if (!("modelContext" in navigator) || typeof navigator.modelContext.provideContext !== "function") return;
    if (window.__edgeOverLuckRouletteCalculatorWebMcpRegistered) return;
    window.__edgeOverLuckRouletteCalculatorWebMcpRegistered = true;

    navigator.modelContext.provideContext({
      tools: [{
        name: "calculate-roulette-probability",
        description: "Calculate roulette win probability, payout, expected value, house edge, and bankroll pressure for supported wager categories.",
        inputSchema: {
          type: "object",
          properties: {
            wheelType: { type: "string", enum: ["european", "american"] },
            betType: { type: "string", enum: Object.keys(ROULETTE_BET_TYPES) },
            bankroll: { type: "number", minimum: 10, maximum: 1000000 },
            betSize: { type: "number", minimum: 1, maximum: 1000000 },
            spins: { type: "integer", minimum: 1, maximum: 100000 },
            sessions: { type: "integer", minimum: 200, maximum: 50000 }
          },
          required: ["wheelType", "betType", "bankroll", "betSize", "spins", "sessions"],
          additionalProperties: false
        },
        execute: function (input) {
          const result = calculateRouletteProbability(input || {});
          renderRouletteProbability(result, true);
          return { content: [{ type: "text", text: formatRouletteProbabilityText(result) }] };
        }
      }]
    });
  }

  window.EdgeOverLuckRouletteCalculator = { calculateRouletteProbability, validateRouletteCalculatorInputs, formatRouletteProbabilityText };
  document.addEventListener("DOMContentLoaded", registerRouletteWebMcp);

  document.getElementById('calcBtn').addEventListener('click', function () { calculateOdds(true); });
  document.getElementById('spinDemoBtn').addEventListener('click', runDemoSession);
  calculateOdds(false);
}());


(function initRouletteLearningTools() {
  const rootCheck = document.getElementById('roulette-learn-wheel');
  if (!rootCheck || !window.RouletteMath) return;

  const { formatMoney } = window.RouletteMath;
  const demoBankroll = 200;
  const demoBet = 5;
  const demoSpins = 100;

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setMeter(id, percent) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function updateWheelLesson() {
    const isAmerican = document.getElementById('roulette-learn-wheel').value === '1';
    const edge = isAmerican ? 5.26 : 2.7;
    const projected = demoBankroll - (demoBet * demoSpins * (edge / 100));
    setText('roulette-learn-wheel-bankroll', formatMoney(projected));
    setText('roulette-learn-wheel-edge', `${edge.toFixed(2)}%`);
    setText(
      'roulette-learn-wheel-copy',
      isAmerican
        ? 'American roulette adds the 00, so the same $200 example gives back more expected value to the casino over time.'
        : 'European roulette uses one zero, so the same $200 example keeps more expected bankroll than American roulette.'
    );
  }

  function updateBetSizeLesson() {
    const bet = Number(document.getElementById('roulette-learn-bet-size').value);
    const covered = Math.floor(demoBankroll / bet);
    let risk = 'Low';
    let copy = 'This bankroll can handle many flat bets before a cold streak gets serious.';

    if (bet >= 20) {
      risk = 'Extreme';
      copy = 'A few rough spins can put the whole session under pressure fast.';
    } else if (bet >= 12) {
      risk = 'High';
      copy = 'The bankroll still has room, but losing streaks now bite hard.';
    } else if (bet >= 7) {
      risk = 'Medium';
      copy = 'This is playable, but each bad streak removes a noticeable chunk.';
    }

    setText('roulette-learn-bet-size-label', formatMoney(bet));
    setText('roulette-learn-bet-count', String(covered));
    setText('roulette-learn-bet-risk', risk);
    setText('roulette-learn-bet-copy', copy);
  }

  function updateVolatilityLesson() {
    const level = Number(document.getElementById('roulette-learn-volatility').value);
    const messages = {
      1: 'Low volatility: smaller wins/losses and a calmer bankroll line.',
      2: 'Mild volatility: mostly steady with occasional bumps.',
      3: 'Medium volatility means noticeable swings without extreme spikes.',
      4: 'High volatility: bigger spikes, harder drops, and wider bankroll swings.',
      5: 'Casino chaos: huge excitement when it hits, brutal drops when it misses.'
    };
    setMeter('roulette-learn-volatility-meter', level * 20);
    setText('roulette-learn-volatility-copy', messages[level]);
  }

  function updateSessionLesson() {
    const spins = Number(document.getElementById('roulette-learn-session').value);
    const expectedLoss = demoBet * spins * 0.027;
    const copy = spins <= 60
      ? 'Short-term wins happen constantly because luck can overpower the math for a while.'
      : spins <= 160
        ? 'More spins create more chances for both fun rallies and the built-in edge to appear.'
        : 'Long sessions give the house edge more time to grind through the short-term noise.';

    setText('roulette-learn-session-spins', String(spins));
    setText('roulette-learn-session-loss', formatMoney(expectedLoss));
    setText('roulette-learn-session-copy', copy);
  }

  function updateBetStyleLesson() {
    const inside = document.getElementById('roulette-learn-bet-style').value === '1';
    setText('roulette-learn-style-frequency', inside ? 'Lower' : 'Higher');
    setText('roulette-learn-style-risk', inside ? 'Higher drama' : 'Lower drama');
    setText(
      'roulette-learn-style-copy',
      inside
        ? 'Inside bets hit less often, but the payout is much larger when the number lands.'
        : 'Outside bets hit more often and pay smaller amounts, so the ride often feels smoother.'
    );
  }

  function updateMartingaleLesson() {
    const level = Number(document.getElementById('roulette-learn-martingale').value);
    const bets = [5, 10, 20, 40, 80].slice(0, level + 1);
    const labels = ['Calm', 'Warming up', 'Spicy', 'Danger', 'Table alarm'];
    const copy = level < 2
      ? 'Flat or light progression betting keeps the session easier to understand.'
      : level < 4
        ? 'Bet sizes are growing fast now, which can make a normal losing run costly.'
        : 'This is where the chase gets costly: one losing streak can demand an $80 bet after starting at $5.';

    setMeter('roulette-learn-martingale-meter', (level + 1) * 20);
    setText('roulette-learn-martingale-growth', bets.map((bet) => formatMoney(bet)).join(' → '));
    setText('roulette-learn-martingale-risk', labels[level]);
    setText('roulette-learn-martingale-copy', copy);
  }

  [
    ['roulette-learn-wheel', updateWheelLesson],
    ['roulette-learn-bet-size', updateBetSizeLesson],
    ['roulette-learn-volatility', updateVolatilityLesson],
    ['roulette-learn-session', updateSessionLesson],
    ['roulette-learn-bet-style', updateBetStyleLesson],
    ['roulette-learn-martingale', updateMartingaleLesson]
  ].forEach(([id, handler]) => {
    const control = document.getElementById(id);
    if (control) control.addEventListener('input', handler);
    handler();
  });
}());
