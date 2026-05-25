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
