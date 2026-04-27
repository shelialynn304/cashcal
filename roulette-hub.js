(function initRouletteHub() {
  const wheelSelect = document.getElementById('hubWheel');
  const betSelect = document.getElementById('hubBetType');

  if (!wheelSelect || !betSelect || !window.RouletteMath) return;

  const { ROULETTE_BET_TYPES, calculateSpinMath, formatMoney, toPercent } = window.RouletteMath;

  betSelect.innerHTML = Object.values(ROULETTE_BET_TYPES)
    .map((bet) => `<option value="${bet.key}">${bet.label}</option>`)
    .join('');

  betSelect.value = 'evenMoney';

  function renderCompare() {
    const data = calculateSpinMath(wheelSelect.value, betSelect.value, 10);
    document.getElementById('hubWinProb').textContent = toPercent(data.winProb, 2);
    document.getElementById('hubPayout').textContent = `${data.bet.payout}:1`;
    document.getElementById('hubHouseEdge').textContent = `${data.wheel.houseEdge.toFixed(2)}%`;
    document.getElementById('hubEv').textContent = formatMoney(data.evDollars);
  }

  wheelSelect.addEventListener('change', renderCompare);
  betSelect.addEventListener('change', renderCompare);
  renderCompare();
}());
