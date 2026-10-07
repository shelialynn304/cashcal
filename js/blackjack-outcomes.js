(function () {
  "use strict";

  // Net result of one blackjack round in base-bet units: 6 decks, dealer stands
  // on soft 17, 3:2 blackjack, double on any two cards, double after split,
  // split up to 4 hands, basic strategy. From a 10,000,000-round simulation
  // (house edge about 0.43%, per-round standard deviation about 1.15 units).
  // A plain win/push/lose model has a standard deviation near 0.96, which
  // understates swings and bust risk.
  const ROUND_OUTCOMES = [
    [-6, 0.000021],
    [-5, 0.000086],
    [-4, 0.000468],
    [-3, 0.002003],
    [-2, 0.041947],
    [-1, 0.434325],
    [0, 0.087747],
    [1, 0.326227],
    [1.5, 0.045270],
    [2, 0.058629],
    [3, 0.002356],
    [4, 0.000737],
    [5, 0.000140],
    [6, 0.000044]
  ];

  // [netUnits, probability] pairs whose average is -houseEdge. Keeps the
  // blackjack shape (naturals, doubles, splits) and moves probability between
  // a one-unit win and a one-unit loss so the mean matches the entered edge.
  function getBlackjackOutcomeTable(houseEdgePercent) {
    const table = ROUND_OUTCOMES.map(([units, probability]) => [units, probability]);
    const tableMean = table.reduce((sum, [units, probability]) => sum + units * probability, 0);
    const shift = (tableMean + houseEdgePercent / 100) / 2;
    table.find(([units]) => units === 1)[1] -= shift;
    table.find(([units]) => units === -1)[1] += shift;
    return table;
  }

  // Walker alias method: exact sampling with one random number and one
  // comparison per hand, so many-outcome tables stay fast.
  function makeOutcomeSampler(table) {
    const n = table.length;
    const total = table.reduce((sum, [, probability]) => sum + probability, 0);
    const scaled = table.map(([, probability]) => (probability * n) / total);
    const keep = new Float64Array(n).fill(1);
    const alias = new Int32Array(n);
    const small = [];
    const large = [];

    scaled.forEach((value, i) => (value < 1 ? small : large).push(i));

    while (small.length && large.length) {
      const s = small.pop();
      const l = large.pop();
      keep[s] = scaled[s];
      alias[s] = l;
      scaled[l] += scaled[s] - 1;
      (scaled[l] < 1 ? small : large).push(l);
    }

    const units = table.map(([value]) => value);

    return function sampleUnits() {
      const x = Math.random() * n;
      const i = x | 0;
      return x - i < keep[i] ? units[i] : units[alias[i]];
    };
  }

  window.EdgeOverLuckBlackjackOutcomes = { ROUND_OUTCOMES, getBlackjackOutcomeTable, makeOutcomeSampler };
})();
