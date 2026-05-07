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

(function initRouletteRiskStyleSelector() {
  const result = document.getElementById('riskStyleResult');
  const buttons = document.querySelectorAll('[data-risk-style]');

  if (!result || buttons.length === 0) return;

  const recommendations = {
    safer: {
      title: 'Even-money bets fit lower volatility.',
      body: 'Red/black, odd/even, and high/low keep payouts small but reduce the length of normal losing streaks compared with inside bets. Use European roulette if available and keep stakes small.'
    },
    balanced: {
      title: 'Dozens or columns fit middle risk.',
      body: 'Dozens and columns pay about 2:1 and cover 12 numbers, so they sit between even-money bets and high-volatility inside bets.'
    },
    longshot: {
      title: 'Straight-up numbers and splits are high-risk entertainment.',
      body: 'Single numbers and splits can pay more, but misses are common. Treat them as entertainment longshots, not as a bankroll-building plan.'
    },
    systems: {
      title: 'Test systems with bankroll math first.',
      body: 'Martingale, Fibonacci, Labouchere, and D’Alembert change bet sizing, not wheel odds. Use the strategy simulator and bankroll calculator before risking money.'
    }
  };

  function renderRecommendation(style) {
    const recommendation = recommendations[style];
    if (!recommendation) return;

    buttons.forEach((button) => {
      const isActive = button.dataset.riskStyle === style;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    result.innerHTML = `<span>Recommendation</span><strong>${recommendation.title}</strong><p class="mb-0">${recommendation.body}</p>`;
  }

  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => renderRecommendation(button.dataset.riskStyle));
  });

  renderRecommendation('safer');
}());
