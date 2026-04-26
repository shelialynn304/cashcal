(function initRouletteCalculator() {
  if (!window.RouletteMath || !document.getElementById('calcBtn')) return;

  const {
    ROULETTE_BET_TYPES,
    clampNumber,
    calculateSpinMath,
    formatMoney,
    toPercent,
    randomSpinWin
  } = window.RouletteMath;

  const betTypeSelect = document.getElementById('betType');
  betTypeSelect.innerHTML = Object.values(ROULETTE_BET_TYPES)
    .map((bet) => `<option value="${bet.key}">${bet.label}</option>`)
    .join('');
  betTypeSelect.value = 'evenMoney';

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

  function calculateOdds() {
    const wheelType = document.getElementById('wheelType').value;
    const betType = document.getElementById('betType').value;
    const bankroll = clampNumber(document.getElementById('bankroll').value, 300, 10);
    const betSize = clampNumber(document.getElementById('betSize').value, 10, 1);
    const spins = clampNumber(document.getElementById('spins').value, 100, 1);
    const sessions = clampNumber(document.getElementById('sessions').value, 2000, 200);

    const math = calculateSpinMath(wheelType, betType, betSize);
    const expectedLoss = Math.max(0, -(math.evDollars * spins));
    const expectedEnding = bankroll - expectedLoss;
    const sim = runMonteCarlo({
      sessions,
      spins,
      bankroll,
      betSize,
      winProb: math.winProb,
      payout: math.bet.payout
    });

    document.getElementById('winChance').textContent = toPercent(math.winProb, 2);
    document.getElementById('payoutRatio').textContent = `${math.bet.payout}:1`;
    document.getElementById('houseEdge').textContent = `${math.wheel.houseEdge.toFixed(2)}%`;
    document.getElementById('evSpin').textContent = formatMoney(math.evDollars);
    document.getElementById('expectedLoss').textContent = formatMoney(expectedLoss);
    document.getElementById('endBankroll').textContent = formatMoney(expectedEnding);
    document.getElementById('profitChance').textContent = toPercent(sim.profitChance, 1);
    document.getElementById('bustRisk').textContent = toPercent(sim.bustRisk, 1);

    document.getElementById('summary').textContent = `On ${math.wheel.label} roulette, a ${formatMoney(betSize)} ${math.bet.label.toLowerCase()} has ${toPercent(math.winProb, 2)} win chance per spin and ${formatMoney(math.evDollars)} EV per spin. Over ${spins} spins, expected loss is ${formatMoney(expectedLoss)}.`;
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

  document.getElementById('calcBtn').addEventListener('click', calculateOdds);
  document.getElementById('spinDemoBtn').addEventListener('click', runDemoSession);
  calculateOdds();
}());
