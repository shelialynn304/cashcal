#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SCRIPT_PATH = path.join(__dirname, '..', 'roulette-shared.js');

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertFinite(value, label) {
  assert(Number.isFinite(value), `${label} must be finite, got: ${String(value)}`);
}

function assertApprox(actual, expected, tolerance, label) {
  const delta = Math.abs(actual - expected);
  assert(delta <= tolerance, `${label} expected ${expected}, got ${actual} (Δ=${delta})`);
}

function runCheck(name, fn) {
  process.stdout.write(`- ${name} ... `);
  try {
    fn();
    console.log('PASS');
    return true;
  } catch (error) {
    console.log('FAIL');
    console.error(`  ${error.message}`);
    return false;
  }
}

function requireHelper(obj, name) {
  const value = obj[name];
  assert(typeof value !== 'undefined', `Missing helper: RouletteMath.${name}`);
  return value;
}

const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
const context = {
  window: {},
  console,
  Math,
  Number,
  Object,
  Array,
  String,
  Boolean,
  Date,
  setTimeout,
  clearTimeout
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'roulette-shared.js' });

const rouletteMath = context.window.RouletteMath;
const checks = [];

checks.push(['RouletteMath exists in window-like context', () => {
  assert(rouletteMath && typeof rouletteMath === 'object', 'Missing helper: window.RouletteMath');
}]);

checks.push(['European wheel has 37 pockets', () => {
  const wheel = requireHelper(rouletteMath, 'getWheelType')('european');
  assert(wheel.pockets === 37, `Expected 37, got ${wheel.pockets}`);
}]);

checks.push(['American wheel has 38 pockets', () => {
  const wheel = requireHelper(rouletteMath, 'getWheelType')('american');
  assert(wheel.pockets === 38, `Expected 38, got ${wheel.pockets}`);
}]);

checks.push(['European house edge is about 2.7%', () => {
  const wheel = requireHelper(rouletteMath, 'getWheelType')('european');
  assertApprox(wheel.houseEdge, 2.7, 0.01, 'European house edge');
}]);

checks.push(['American house edge is about 5.26%', () => {
  const wheel = requireHelper(rouletteMath, 'getWheelType')('american');
  assertApprox(wheel.houseEdge, 5.26, 0.01, 'American house edge');
}]);

checks.push(['Straight bet payout is 35', () => {
  const bet = requireHelper(rouletteMath, 'getBetType')('straight');
  assert(bet.payout === 35, `Expected 35, got ${bet.payout}`);
}]);

checks.push(['Even-money bet payout is 1', () => {
  const bet = requireHelper(rouletteMath, 'getBetType')('evenMoney');
  assert(bet.payout === 1, `Expected 1, got ${bet.payout}`);
}]);

checks.push(['Straight bet covers 1 number', () => {
  const bet = requireHelper(rouletteMath, 'getBetType')('straight');
  assert(bet.covered === 1, `Expected 1, got ${bet.covered}`);
}]);

checks.push(['Even-money bet covers 18 numbers', () => {
  const bet = requireHelper(rouletteMath, 'getBetType')('evenMoney');
  assert(bet.covered === 18, `Expected 18, got ${bet.covered}`);
}]);

checks.push(['Red number helper marks 1 and 36 as red', () => {
  const isRedNumber = requireHelper(rouletteMath, 'isRedNumber');
  assert(isRedNumber(1) === true, 'Expected 1 to be red');
  assert(isRedNumber(36) === true, 'Expected 36 to be red');
}]);

checks.push(['Red number helper does not mark 2 as red', () => {
  const isRedNumber = requireHelper(rouletteMath, 'isRedNumber');
  assert(isRedNumber(2) === false, 'Expected 2 to not be red');
}]);

checks.push(["calculateSpinMath('european', 'straight', 10) returns finite values", () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('european', 'straight', 10);
  assertFinite(result.winProb, 'winProb');
  assertFinite(result.lossProb, 'lossProb');
  assertFinite(result.evUnits, 'evUnits');
  assertFinite(result.evDollars, 'evDollars');
}]);

checks.push(["calculateSpinMath('american', 'evenMoney', 10) returns finite values", () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('american', 'evenMoney', 10);
  assertFinite(result.winProb, 'winProb');
  assertFinite(result.lossProb, 'lossProb');
  assertFinite(result.evUnits, 'evUnits');
  assertFinite(result.evDollars, 'evDollars');
}]);

checks.push(['fibonacciStep handles partial legacy state without NaN', () => {
  const fibonacciStep = requireHelper(rouletteMath, 'fibonacciStep');
  const cases = [
    fibonacciStep(10, false, { sequence: [1], index: 0 }),
    fibonacciStep(10, false, { sequence: [1], index: 1 }),
    fibonacciStep(10, false, { sequence: [], index: 0 })
  ];

  for (const [idx, value] of cases.entries()) {
    assert(Array.isArray(value.sequence), `Case ${idx + 1} sequence must be an array`);
    assert(!value.sequence.some((entry) => Number.isNaN(entry)), `Case ${idx + 1} sequence contains NaN`);
    assertFinite(value.stake, `Case ${idx + 1} stake`);
  }
}]);

checks.push(['European straight-up win probability is 1/37', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('european', 'straight', 10);
  assertApprox(result.winProb, 1 / 37, 1e-12, 'European straight winProb');
}]);

checks.push(['American straight-up win probability is 1/38', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('american', 'straight', 10);
  assertApprox(result.winProb, 1 / 38, 1e-12, 'American straight winProb');
}]);

checks.push(['European even-money win probability is 18/37', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('european', 'evenMoney', 10);
  assertApprox(result.winProb, 18 / 37, 1e-12, 'European even-money winProb');
}]);

checks.push(['American even-money win probability is 18/38', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('american', 'evenMoney', 10);
  assertApprox(result.winProb, 18 / 38, 1e-12, 'American even-money winProb');
}]);

checks.push(['European straight-up EV units is approximately -1/37', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('european', 'straight', 10);
  assertApprox(result.evUnits, -1 / 37, 1e-12, 'European straight EV units');
}]);

checks.push(['American straight-up EV units is approximately -2/38', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('american', 'straight', 10);
  assertApprox(result.evUnits, -2 / 38, 1e-12, 'American straight EV units');
}]);

checks.push(['European even-money EV units is approximately -1/37', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('european', 'evenMoney', 10);
  assertApprox(result.evUnits, -1 / 37, 1e-12, 'European even-money EV units');
}]);

checks.push(['American even-money EV units is approximately -2/38', () => {
  const result = requireHelper(rouletteMath, 'calculateSpinMath')('american', 'evenMoney', 10);
  assertApprox(result.evUnits, -2 / 38, 1e-12, 'American even-money EV units');
}]);

// Blackjack bankroll calculator outcome model (blackjack.js)
const bankrollForm = { addEventListener() {}, dispatchEvent() {} };
const bankrollContext = {
  window: {},
  console,
  Math,
  Number,
  Object,
  Array,
  String,
  Boolean,
  Date,
  Float64Array,
  Int32Array,
  Event: class Event {},
  navigator: {},
  alert() {},
  document: {
    getElementById: (id) => (id === 'bankrollForm' ? bankrollForm : null),
    addEventListener() {}
  }
};

vm.createContext(bankrollContext);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'blackjack-outcomes.js'), 'utf8'), bankrollContext, { filename: 'js/blackjack-outcomes.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'blackjack.js'), 'utf8'), bankrollContext, { filename: 'blackjack.js' });

const getOutcomeTable = bankrollContext.window.EdgeOverLuckBlackjackBankroll &&
  bankrollContext.window.EdgeOverLuckBlackjackBankroll.getOutcomeTable;

function tableStats(table) {
  const total = table.reduce((sum, [, p]) => sum + p, 0);
  const mean = table.reduce((sum, [units, p]) => sum + units * p, 0);
  const sd = Math.sqrt(table.reduce((sum, [units, p]) => sum + units * units * p, 0) - mean * mean);
  return { total, mean, sd };
}

checks.push(['Blackjack bankroll outcome table is exposed', () => {
  assert(typeof getOutcomeTable === 'function', 'Missing helper: EdgeOverLuckBlackjackBankroll.getOutcomeTable');
}]);

checks.push(['Blackjack outcomes sum to 1 and match the entered house edge', () => {
  for (const edge of [0, 0.5, 2, 10]) {
    const table = getOutcomeTable(edge, 'blackjack');
    const { total, mean } = tableStats(table);
    assertApprox(total, 1, 1e-9, `Blackjack table total at ${edge}%`);
    assertApprox(mean, -edge / 100, 1e-12, `Blackjack mean at ${edge}%`);
    assert(table.every(([, p]) => p >= 0), `Negative probability at ${edge}% edge`);
  }
}]);

checks.push(['Blackjack per-hand standard deviation is about 1.15 units', () => {
  const { sd } = tableStats(getOutcomeTable(0.5, 'blackjack'));
  assert(sd > 1.12 && sd < 1.18, `Expected about 1.15, got ${sd}`);
}]);

checks.push(['Blackjack outcomes include 3:2 naturals and doubled bets', () => {
  const units = getOutcomeTable(0.5, 'blackjack').map(([value]) => value);
  for (const expected of [1.5, 2, -2]) {
    assert(units.includes(expected), `Missing ${expected}-unit outcome`);
  }
}]);

checks.push(['Roulette preset stays even-money with 18/38 win probability', () => {
  const table = getOutcomeTable(100 * (2 / 38), 'roulette');
  const win = table.find(([units]) => units === 1)[1];
  assertApprox(win, 18 / 38, 1e-12, 'Roulette even-money win probability');
}]);

// Homepage quick bankroll check (script.js) uses the same blackjack outcomes
const homeContext = {
  window: {},
  console,
  Math,
  Number,
  Object,
  Array,
  String,
  Boolean,
  Date,
  Float64Array,
  Int32Array,
  document: {
    getElementById: () => null,
    querySelectorAll: () => []
  }
};

vm.createContext(homeContext);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'blackjack-outcomes.js'), 'utf8'), homeContext, { filename: 'js/blackjack-outcomes.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8'), homeContext, { filename: 'script.js' });

const quickBankroll = homeContext.window.EdgeOverLuckQuickBankroll;

checks.push(['Homepage quick bankroll check is exposed', () => {
  assert(quickBankroll && typeof quickBankroll.runMonteCarlo === 'function', 'Missing helper: EdgeOverLuckQuickBankroll.runMonteCarlo');
}]);

checks.push(['Homepage blackjack preset uses the blackjack outcome table', () => {
  const sample = quickBankroll.makeBetSampler(0.5, 'blackjack');
  const draws = 200000;
  let total = 0;
  let sawNatural = false;
  for (let i = 0; i < draws; i++) {
    const units = sample();
    total += units;
    if (units === 1.5) sawNatural = true;
  }
  assert(sawNatural, 'Expected 1.5-unit blackjack payouts in the homepage blackjack model');
  assertApprox(total / draws, -0.005, 0.015, 'Homepage blackjack mean result per hand');
}]);

checks.push(['Homepage bust risk counts sessions that cannot cover another bet', () => {
  // $10 bankroll with $3 bets can only end at $1 (never $0) when it runs out.
  quickBankroll.setGame(null);
  const result = quickBankroll.runMonteCarlo(10, 3, 0, 1000, 2000);
  assert(result.bustRisk > 50, `Expected most sessions to bust, got ${result.bustRisk}%`);
}]);

let failures = 0;
for (const [name, fn] of checks) {
  if (!runCheck(name, fn)) failures += 1;
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} checks passed.`);
process.exit(0);
