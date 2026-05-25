(function rouletteSharedInit(global) {
  const CANONICAL_RED_NUMBERS = Object.freeze([
    1, 3, 5, 7, 9,
    12, 14, 16, 18,
    19, 21, 23, 25, 27,
    30, 32, 34, 36
  ]);

  // These aliases normalize the bet family/category only.
  // They do not encode the selected side of an even-money bet such as red vs black,
  // odd vs even, or low vs high.
  const ROULETTE_BET_KEY_ALIASES = Object.freeze({
    redblack: 'evenMoney',
    evenmoney: 'evenMoney',
    even_money: 'evenMoney',
    even: 'evenMoney',
    odd: 'evenMoney',
    red: 'evenMoney',
    black: 'evenMoney',
    low: 'evenMoney',
    high: 'evenMoney',
    dozen: 'dozen',
    dozens: 'dozen',
    column: 'column',
    columns: 'column'
  });

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

  const WHEEL_METADATA = Object.freeze({
    european: Object.freeze({
      ...WHEEL_CONFIG.european,
      zeroLabels: Object.freeze(['0'])
    }),
    american: Object.freeze({
      ...WHEEL_CONFIG.american,
      zeroLabels: Object.freeze(['0', '00'])
    })
  });

  function clampNumber(value, fallback, min) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, parsed);
  }

  function toPositiveNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  }

  function formatMoney(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function toPercent(value, digits) {
    return `${(value * 100).toFixed(digits)}%`;
  }

  function normalizeBetKey(key, fallback = 'evenMoney') {
    if (typeof key !== 'string') return fallback;

    const trimmed = key.trim();
    if (ROULETTE_BET_TYPES[trimmed]) return trimmed;

    const lowered = trimmed.toLowerCase();
    const alias = ROULETTE_BET_KEY_ALIASES[lowered];

    return alias || fallback;
  }

  function hasBetType(key) {
    if (typeof key !== 'string') return false;

    const trimmed = key.trim();
    if (ROULETTE_BET_TYPES[trimmed]) return true;

    return Boolean(ROULETTE_BET_KEY_ALIASES[trimmed.toLowerCase()]);
  }

  function getBetType(key) {
    return ROULETTE_BET_TYPES[normalizeBetKey(key)] || ROULETTE_BET_TYPES.evenMoney;
  }

  function getPayoutMetadata(key) {
    const betType = getBetType(key);
    return {
      key: betType.key,
      payout: betType.payout,
      covered: betType.covered,
      category: betType.category,
      label: betType.label
    };
  }

  function getWheelType(key) {
    return WHEEL_CONFIG[key] || WHEEL_CONFIG.european;
  }

  function getWheelMetadata(key) {
    if (typeof key !== 'string') return WHEEL_METADATA.european;
    const normalized = key.trim().toLowerCase();
    return WHEEL_METADATA[normalized] || WHEEL_METADATA.european;
  }

  function isRedNumber(value) {
    const number = Number(value);
    return CANONICAL_RED_NUMBERS.indexOf(number) !== -1;
  }

  function getRedNumbers() {
    return CANONICAL_RED_NUMBERS.slice();
  }

  function flatStep(baseStake) {
    return toPositiveNumber(baseStake, 0);
  }

  function martingaleStep(baseStake, currentStake, wonLastSpin) {
    const base = toPositiveNumber(baseStake, 0);
    const current = toPositiveNumber(currentStake, base);

    if (base <= 0) return 0;
    if (wonLastSpin) return base;

    return current * 2;
  }

  function fibonacciStep(baseStake, wonLastSpin, state) {
    const base = toPositiveNumber(baseStake, 0);
    const sequence = Array.isArray(state && state.sequence) && state.sequence.length
      ? state.sequence.slice()
      : [1, 1];

    let index = Number.isInteger(state && state.index) ? state.index : 0;

    if (base <= 0) {
      return {
        stake: 0,
        sequence,
        index: 0
      };
    }

    if (wonLastSpin) {
      index = Math.max(0, index - 2);
    } else {
      index += 1;
    }

    while (index >= sequence.length) {
      sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
    }

    return {
      stake: base * sequence[index],
      sequence,
      index
    };
  }

  function dalembertStep(baseStake, currentStake, wonLastSpin) {
    const base = toPositiveNumber(baseStake, 0);
    const current = toPositiveNumber(currentStake, base);

    if (base <= 0) return 0;
    if (wonLastSpin) return Math.max(base, current - base);

    return current + base;
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
    WHEEL_METADATA,
    ROULETTE_BET_KEY_ALIASES,
    clampNumber,
    toPositiveNumber,
    formatMoney,
    toPercent,
    normalizeBetKey,
    hasBetType,
    getBetType,
    getPayoutMetadata,
    getWheelType,
    getWheelMetadata,
    isRedNumber,
    getRedNumbers,
    flatStep,
    martingaleStep,
    fibonacciStep,
    dalembertStep,
    calculateSpinMath,
    randomSpinWin
  };
}(window));
