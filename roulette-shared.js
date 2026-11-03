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
    const n = Number(value);
    const fixed = Math.abs(n).toFixed(2);
    return `${n < 0 && fixed !== '0.00' ? '-' : ''}$${fixed}`;
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

  function normalizeFibonacciSequence(sequence) {
    if (!Array.isArray(sequence)) return [1, 1];

    const normalized = sequence
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (normalized.length === 0) return [1, 1];
    if (normalized.length === 1) return [normalized[0], normalized[0]];

    return normalized;
  }

  function fibonacciStep(baseStake, wonLastSpin, state) {
    const base = toPositiveNumber(baseStake, 0);
    const sequence = normalizeFibonacciSequence(state && state.sequence);
    let index = Number.isInteger(state && state.index) ? state.index : 0;
    index = Math.max(0, index);

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

  // Exact flat-bet session model (no Monte Carlo noise).
  // State u = whole bets the bankroll can cover. Each spin moves u -> u + payout
  // with winProb and u -> u - 1 otherwise; u = 0 means the next bet cannot be
  // placed (bust). Mass with u above the spins remaining can never bust, so it is
  // removed and credited with all remaining spins. Sessions longer than maxSpins
  // are modeled for the first maxSpins spins only (exact: false). Tail mass below
  // 1e-280 is dropped to avoid slow subnormal math; the effect is far below
  // display precision.
  const FLAT_BET_DP_MAX_SPINS = 20000;

  function flatBetBustStats(options) {
    const settings = options || {};
    const bankroll = Number(settings.bankroll);
    const betSize = Number(settings.betSize);
    const winProb = Number(settings.winProb);
    const payout = Math.round(Number(settings.payout));
    const spins = Math.floor(Number(settings.spins));
    const maxSpins = Number.isFinite(settings.maxSpins) ? Math.floor(settings.maxSpins) : FLAT_BET_DP_MAX_SPINS;

    if (!(bankroll > 0) || !(betSize > 0) || !(winProb >= 0 && winProb <= 1) || !(payout >= 1) || !(spins >= 0)) {
      return null;
    }

    const n = Math.min(spins, maxSpins);
    const units = Math.floor((bankroll / betSize) + 1e-9);
    const result = { units, spinsModeled: n, exact: n === spins, bustProb: 0, expectedSpins: n };

    if (units < 1) {
      result.bustProb = n > 0 ? 1 : 0;
      result.expectedSpins = 0;
      return result;
    }
    if (units > n) return result;

    const lossProb = 1 - winProb;
    let cur = new Float64Array(n + payout + 2);
    let next = new Float64Array(n + payout + 2);
    let lo = units;
    let hi = units;
    let bust = 0;
    let expectedSpins = 0;
    cur[units] = 1;

    for (let t = 0; t < n; t += 1) {
      const remaining = n - t;
      while (hi > remaining) {
        if (cur[hi] !== 0) {
          expectedSpins += cur[hi] * remaining;
          cur[hi] = 0;
        }
        hi -= 1;
      }
      if (hi < lo) break;

      let alive = 0;
      for (let u = lo; u <= hi; u += 1) {
        const mass = cur[u];
        if (mass === 0) continue;
        cur[u] = 0;
        if (mass < 1e-280) continue;
        alive += mass;
        next[u + payout] += mass * winProb;
        next[u - 1] += mass * lossProb;
      }
      expectedSpins += alive;
      bust += next[0];
      next[0] = 0;

      const swap = cur;
      cur = next;
      next = swap;
      lo = Math.max(1, lo - 1);
      hi += payout;
    }

    result.bustProb = Math.min(1, Math.max(0, bust));
    result.expectedSpins = expectedSpins;
    return result;
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
    randomSpinWin,
    FLAT_BET_DP_MAX_SPINS,
    flatBetBustStats
  };
}(window));
