(function rouletteSharedInit(global) {
  const ROULETTE_BET_TYPES = {
    straight: { key: 'straight', label: 'Straight (1 number, pays 35:1)', covered: 1, payout: 35, category: 'Inside' },
    split: { key: 'split', label: 'Split (2 numbers, pays 17:1)', covered: 2, payout: 17, category: 'Inside' },
    street: { key: 'street', label: 'Street (3 numbers, pays 11:1)', covered: 3, payout: 11, category: 'Inside' },
    corner: { key: 'corner', label: 'Corner (4 numbers, pays 8:1)', covered: 4, payout: 8, category: 'Inside' },
    sixline: { key: 'sixline', label: 'Six Line (6 numbers, pays 5:1)', covered: 6, payout: 5, category: 'Inside' },
    dozen: { key: 'dozen', label: 'Dozen (12 numbers, pays 2:1)', covered: 12, payout: 2, category: 'Outside' },
    column: { key: 'column', label: 'Column (12 numbers, pays 2:1)', covered: 12, payout: 2, category: 'Outside' },
    evenMoney: { key: 'evenMoney', label: 'Red/Black, Odd/Even, High/Low (18 numbers, pays 1:1)', covered: 18, payout: 1, category: 'Outside' }
  };

  const WHEEL_CONFIG = {
    european: { key: 'european', label: 'European (single-zero)', pockets: 37, houseEdge: 2.7 },
    american: { key: 'american', label: 'American (double-zero)', pockets: 38, houseEdge: 5.26 }
  };

  function clampNumber(value, fallback, min) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, parsed);
  }

  function formatMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function toPercent(value, digits) {
    return `${(value * 100).toFixed(digits)}%`;
  }

  function getBetType(key) {
    return ROULETTE_BET_TYPES[key] || ROULETTE_BET_TYPES.evenMoney;
  }

  function getWheelType(key) {
    return WHEEL_CONFIG[key] || WHEEL_CONFIG.european;
  }

  function calculateSpinMath(wheelKey, betKey, stake) {
    const wheel = getWheelType(wheelKey);
    const bet = getBetType(betKey);
    const winProb = bet.covered / wheel.pockets;
    const lossProb = 1 - winProb;
    const evUnits = (winProb * bet.payout) - lossProb;
    const evDollars = evUnits * stake;

    return {
      wheel,
      bet,
      winProb,
      lossProb,
      evUnits,
      evDollars
    };
  }

  function randomSpinWin(probability) {
    return Math.random() < probability;
  }

  global.RouletteMath = {
    ROULETTE_BET_TYPES,
    WHEEL_CONFIG,
    clampNumber,
    formatMoney,
    toPercent,
    getBetType,
    getWheelType,
    calculateSpinMath,
    randomSpinWin
  };
}(window));
