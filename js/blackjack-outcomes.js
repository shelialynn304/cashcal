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
    const win = table.find(([units]) => units === 1);
    const loss = table.find(([units]) => units === -1);
    // Never move more probability than a bucket holds. That only binds at
    // edges far beyond any real blackjack game (above about 65%); callers use
    // this table for edges up to MAX_EDGE_PERCENT.
    const shift = Math.min(Math.max((tableMean + houseEdgePercent / 100) / 2, -loss[1]), win[1]);
    win[1] -= shift;
    loss[1] += shift;
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

  // A player who cannot cover a full double or split doubles or splits for
  // less: the win and the loss both shrink to what the bankroll can stake
  // (maxUnits base bets). A natural only needs the base bet.
  function settleUnits(units, maxUnits) {
    return Math.abs(units) >= 2 && Math.abs(units) > maxUnits ? Math.sign(units) * maxUnits : units;
  }

  // Plays hands from an outcome table against a bankroll. play(maxUnits)
  // returns one hand's net result in base-bet units; meanUnits(maxUnits) is
  // that hand's average result. With maxUnits = balance / bet (at least 1,
  // since a session stops when a bet cannot be covered) the balance never
  // drops below $0, and no loss is forgiven while the matching win is paid.
  function makeHandPlayer(table) {
    const sampleUnits = makeOutcomeSampler(table);
    const total = table.reduce((sum, [, probability]) => sum + probability, 0);
    // Between consecutive double/split sizes the set of capped outcomes is
    // fixed, so the average is uncapped + maxUnits * capped there.
    const sizes = [...new Set(table.map(([units]) => Math.abs(units)).filter((size) => size >= 2))].sort((a, b) => a - b);
    const pieces = [0, ...sizes].map((floor) => {
      let uncapped = 0;
      let capped = 0;
      table.forEach(([units, probability]) => {
        if (Math.abs(units) >= 2 && Math.abs(units) > floor) capped += Math.sign(units) * probability;
        else uncapped += units * probability;
      });
      return { floor, uncapped: uncapped / total, capped: capped / total };
    });
    const largest = sizes.length ? sizes[sizes.length - 1] : 0;
    const fullMean = pieces[pieces.length - 1].uncapped;

    return {
      play: (maxUnits) => (maxUnits >= largest ? sampleUnits() : settleUnits(sampleUnits(), maxUnits)),
      meanUnits: (maxUnits) => {
        if (maxUnits >= largest) return fullMean;
        let i = 0;
        while (i + 1 < pieces.length && maxUnits >= pieces[i + 1].floor) i++;
        return pieces[i].uncapped + maxUnits * pieces[i].capped;
      }
    };
  }

  // Largest house edge the blackjack model is used for; higher entries are
  // not realistic blackjack games.
  const MAX_EDGE_PERCENT = 10;

  window.EdgeOverLuckBlackjackOutcomes = { ROUND_OUTCOMES, MAX_EDGE_PERCENT, getBlackjackOutcomeTable, makeOutcomeSampler, makeHandPlayer };
})();
