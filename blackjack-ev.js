(function () {
  "use strict";

  /* ============================================================
     Blackjack EV Estimator — Edge Over Luck
     ============================================================
     MODEL ASSUMPTIONS (keep page copy in sync with these):

     1. Fixed-composition shoe. Card probabilities are built once
        per calculation from: (decks x 52 cards) minus the dealer
        upcard, shifted by the Hi-Lo true count (see #3). The
        probabilities do NOT update as cards are drawn during the
        hand (an "infinite shoe"-style approximation). This is the
        main reason results are estimates, not exact solver output.

     2. Dealer stands on all 17s (S17). Dealer peeks for blackjack:
        EVs are conditioned on the dealer NOT having a natural,
        which matches how published basic-strategy EV tables are
        stated (with an upcard Ace or Ten, the hole card that would
        complete a blackjack is excluded and the remaining hole-card
        distribution is renormalized).

     3. True count is modeled as a card-density shift, not a flat
        EV bonus. In Hi-Lo, a true count of +t means roughly t extra
        high cards (Ten/Ace) net of low cards (2-6) per remaining
        deck. We scale the high group (20 cards/deck) by
        (20 + t/2)/20 and the low group (20 cards/deck) by
        (20 - t/2)/20; 7-9 are unchanged. This makes count effects
        emerge from the math with the correct sign (e.g. standing
        on stiffs improves as the count rises) instead of being
        painted on afterward.

     4. Blackjack payout (3:2 vs 6:5) does NOT change the EV of
        hitting, standing, or doubling a hand you already hold —
        it only changes what your own naturals pay. It is therefore
        excluded from the decision math and surfaced as an
        informational note instead.

     5. Double = draw exactly one card, then stand, with a doubled
        stake. Splits, surrender, and insurance are not modeled.

     6. EV units: expected profit per 1 unit of base bet.
        Stand/Hit range [-1, +1]; Double range [-2, +2].
     ============================================================ */

  // ---------- Card / composition model ----------

  // Ranks tracked as blackjack values. 10 covers T/J/Q/K (16 per deck).
  const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 11 = Ace
  const CARDS_PER_DECK = { 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 16, 11: 4 };

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  /**
   * Build the fixed card-probability table for this calculation.
   * decks: number of decks; dealerCard: upcard value removed from shoe;
   * trueCount: Hi-Lo true count used as a density shift (see assumption #3).
   * Returns array of { value, p } summing to 1.
   */
  function buildCardProbabilities(decks, dealerCard, trueCount) {
    const deckCount = clamp(Number(decks) || 6, 1, 12);
    const tc = clamp(Number(trueCount) || 0, -10, 10);

    // Hi-Lo density factors. High group (Ten, Ace) = 20 cards/deck,
    // low group (2-6) = 20 cards/deck. Factors floored so extreme
    // counts can't produce a negative or empty group.
    const highFactor = clamp((20 + tc / 2) / 20, 0.05, 1.95);
    const lowFactor = clamp((20 - tc / 2) / 20, 0.05, 1.95);

    const counts = {};
    for (const rank of RANKS) {
      let base = CARDS_PER_DECK[rank] * deckCount;
      if (rank === 10 || rank === 11) base *= highFactor;
      else if (rank >= 2 && rank <= 6) base *= lowFactor;
      counts[rank] = base;
    }

    // Remove the known dealer upcard from the shoe (exact information).
    counts[dealerCard] = Math.max(0.0001, counts[dealerCard] - 1);

    const totalCards = RANKS.reduce((sum, rank) => sum + counts[rank], 0);
    return RANKS.map((rank) => ({ value: rank, p: counts[rank] / totalCards }));
  }

  /** Add one card to a hand total, demoting a soft ace if needed. */
  function drawCard(total, isSoft, cardValue) {
    let newTotal = total + cardValue;
    let soft = isSoft || cardValue === 11;

    while (newTotal > 21 && soft) {
      newTotal -= 10;
      soft = false;
    }

    return { total: newTotal, isSoft: soft };
  }

  // ---------- Dealer model (exact recursion, S17, peek) ----------

  /**
   * Exact dealer final-total distribution for an upcard, given the
   * card probabilities. Returns { 17, 18, 19, 20, 21, bust }.
   * Conditioned on no dealer blackjack: for an Ace up, the hole card
   * cannot be a Ten; for a Ten up, the hole card cannot be an Ace
   * (remaining hole-card probabilities renormalized).
   */
  function computeDealerProbs(upcard, cardProbs) {
    const memo = new Map();

    // Distribution of final totals from a dealer state (S17: stand on all 17+).
    function dealerFrom(total, isSoft) {
      if (total > 21) return { bust: 1 };
      if (total >= 17) return { [total]: 1 };

      const key = total + (isSoft ? "s" : "h");
      if (memo.has(key)) return memo.get(key);

      const dist = { 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, bust: 0 };
      for (const card of cardProbs) {
        const next = drawCard(total, isSoft, card.value);
        const sub = dealerFrom(next.total, next.isSoft);
        for (const outcome in sub) dist[outcome] += card.p * sub[outcome];
      }

      memo.set(key, dist);
      return dist;
    }

    // Hole card, conditioned on no blackjack (peek).
    const blocked = upcard === 11 ? 10 : upcard === 10 ? 11 : null;
    let holeProbs = cardProbs;
    if (blocked !== null) {
      const remaining = cardProbs.filter((card) => card.value !== blocked);
      const remainingTotal = remaining.reduce((sum, card) => sum + card.p, 0);
      holeProbs = remaining.map((card) => ({ value: card.value, p: card.p / remainingTotal }));
    }

    const start = drawCard(upcard === 11 ? 11 : upcard, upcard === 11, 0);
    const result = { 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, bust: 0 };
    for (const hole of holeProbs) {
      const afterHole = drawCard(start.total, start.isSoft, hole.value);
      const sub = dealerFrom(afterHole.total, afterHole.isSoft);
      for (const outcome in sub) result[outcome] += hole.p * sub[outcome];
    }

    return result;
  }

  // ---------- Player EV (exact recursion over the fixed composition) ----------

  /**
   * Per-calculation context: card probabilities, dealer distribution,
   * and memo tables. Rebuilt whenever inputs change, so there is no
   * stale-cache risk across different decks/counts.
   */
  function buildContext(dealerCard, decks, trueCount) {
    const cardProbs = buildCardProbabilities(decks, dealerCard, trueCount);
    const dealerProbs = computeDealerProbs(dealerCard, cardProbs);
    return { cardProbs, dealerProbs, standMemo: new Map(), hitMemo: new Map() };
  }

  /** EV of standing on `total` (units of base bet, [-1, 1]). */
  function standEV(ctx, total) {
    if (total > 21) return -1;

    if (ctx.standMemo.has(total)) return ctx.standMemo.get(total);

    let ev = ctx.dealerProbs.bust; // dealer bust = win
    for (let dealerTotal = 17; dealerTotal <= 21; dealerTotal++) {
      const p = ctx.dealerProbs[dealerTotal] || 0;
      if (dealerTotal < total) ev += p;
      else if (dealerTotal > total) ev -= p;
      // equal totals push: contributes 0
    }

    ctx.standMemo.set(total, ev);
    return ev;
  }

  /**
   * EV of hitting once and then playing on optimally (hit vs stand).
   * Full recursion with memoization — no depth cap. The state space
   * is finite and acyclic (hard totals only increase; soft hands
   * either increase or demote to hard), so this terminates and is
   * exact for the fixed-composition model.
   */
  function hitEV(ctx, total, isSoft) {
    if (total > 21) return -1;

    const key = total + (isSoft ? "s" : "h");
    if (ctx.hitMemo.has(key)) return ctx.hitMemo.get(key);

    let ev = 0;
    for (const card of ctx.cardProbs) {
      const next = drawCard(total, isSoft, card.value);
      let branchEV;

      if (next.total > 21) {
        branchEV = -1;
      } else {
        // After drawing, choose the better of standing or hitting again.
        branchEV = Math.max(standEV(ctx, next.total), hitEV(ctx, next.total, next.isSoft));
      }

      ev += card.p * branchEV;
    }

    ctx.hitMemo.set(key, ev);
    return ev;
  }

  /** EV of doubling: one card, forced stand, doubled stake ([-2, 2]). */
  function doubleEV(ctx, total, isSoft) {
    let ev = 0;
    for (const card of ctx.cardProbs) {
      const next = drawCard(total, isSoft, card.value);
      ev += card.p * (next.total > 21 ? -1 : standEV(ctx, next.total));
    }
    return 2 * ev;
  }

  // ---------- Monte Carlo verification ----------

  function makeSampler(cardProbs) {
    return function sampleCard() {
      const r = Math.random();
      let running = 0;
      for (const card of cardProbs) {
        running += card.p;
        if (r <= running) return card.value;
      }
      return cardProbs[cardProbs.length - 1].value;
    };
  }

  /** Sample one dealer final total (S17, conditioned on no blackjack). */
  function simulateDealerFinalTotal(upcard, cardProbs, sampleCard) {
    const blocked = upcard === 11 ? 10 : upcard === 10 ? 11 : null;

    let hole = sampleCard();
    while (blocked !== null && hole === blocked) hole = sampleCard(); // rejection = renormalization

    let state = drawCard(upcard === 11 ? 11 : upcard, upcard === 11, 0);
    state = drawCard(state.total, state.isSoft, hole);

    while (state.total < 17) {
      state = drawCard(state.total, state.isSoft, sampleCard());
    }
    return state.total > 21 ? "bust" : state.total;
  }

  /**
   * Monte Carlo check of Stand / Hit / Double EVs using the SAME
   * composition and the model's own optimal hit/stand policy, so the
   * simulation verifies the recursion rather than a different game.
   */
  function runMonteCarloEV(ctx, upcard, total, isSoft, trials) {
    const n = clamp(Math.round(Number(trials) || 50000), 1000, 500000);
    const sampleCard = makeSampler(ctx.cardProbs);

    const settle = (playerTotal, stake) => {
      const dealerFinal = simulateDealerFinalTotal(upcard, ctx.cardProbs, sampleCard);
      if (dealerFinal === "bust" || dealerFinal < playerTotal) return stake;
      if (dealerFinal === playerTotal) return 0;
      return -stake;
    };

    let sumStand = 0;
    let sumHit = 0;
    let sumDouble = 0;

    for (let t = 0; t < n; t++) {
      // Stand
      sumStand += settle(total, 1);

      // Double: one card, forced stand, doubled stake
      const dbl = drawCard(total, isSoft, sampleCard());
      sumDouble += dbl.total > 21 ? -2 : settle(dbl.total, 2);

      // Hit: draw once, then follow the model's optimal policy
      let state = drawCard(total, isSoft, sampleCard());
      while (state.total <= 21 && hitEV(ctx, state.total, state.isSoft) > standEV(ctx, state.total)) {
        state = drawCard(state.total, state.isSoft, sampleCard());
      }
      sumHit += state.total > 21 ? -1 : settle(state.total, 1);
    }

    return {
      standEV: sumStand / n,
      hitEV: sumHit / n,
      doubleEV: sumDouble / n
    };
  }

  // ---------- Presentation ----------

  const formatEV = (ev) => `${ev > 0 ? "+" : ""}${ev.toFixed(3)}`;
  const formatMoney = (amount) => `$${amount.toFixed(2)}`;

  function valueClass(ev) {
    if (ev > 0.02) return "text-gold";
    if (ev < -0.02) return "text-muted";
    return "";
  }

  function buildReason(bestAction, total, dealerCard, isSoft) {
    if (bestAction === "Stand") {
      if (total >= 17) return "Strong made total; drawing introduces avoidable bust risk.";
      if (dealerCard >= 4 && dealerCard <= 6) return "Dealer shows weakness, so patience often outperforms aggression.";
      return "Standing comes out best because draw downside outweighs extra upside.";
    }

    if (bestAction === "Hit") {
      if (!isSoft && total <= 11) return "Low hard totals need improvement; standing is too passive.";
      if (dealerCard >= 7) return "Dealer strength forces improvement pressure on your hand.";
      return "Hitting has the strongest average return in this spot.";
    }

    return "Doubling wins here because one-card aggression has the strongest expected return.";
  }

  function buildContextNotes(blackjackPayout, trueCount) {
    const notes = [];

    if (Number(blackjackPayout) === 1.2) {
      notes.push("6:5 blackjack raises the overall house edge by roughly 1.4% versus 3:2, but it does not change the best play for a hand you already hold, so it is not included in these EVs.");
    }

    const tc = clamp(Number(trueCount) || 0, -10, 10);
    if (tc !== 0) {
      notes.push(`True count ${tc > 0 ? "+" : ""}${tc} is modeled as a shift in remaining card density (${tc > 0 ? "more" : "fewer"} tens and aces left), so its effect on each decision comes from the math itself. This is an approximation of Hi-Lo, not an exact deck composition.`);
    }

    return notes;
  }

  // ---------- UI wiring (element IDs unchanged) ----------

  function calculateEV(markResultReady) {
    const total = clamp(Number(document.getElementById("playerTotal").value) || 16, 4, 21);
    const dealerCard = Number(document.getElementById("dealerCard").value);
    const isSoft = document.getElementById("isSoft").value === "true";
    const decks = Number(document.getElementById("decks").value);
    const blackjackPayout = Number(document.getElementById("blackjackPayout").value);
    const betSize = Math.max(1, Number(document.getElementById("betSize").value) || 25);
    const trueCount = Number(document.getElementById("trueCount").value) || 0;

    // Soft totals below 12 are not possible (A + A counts as soft 12).
    const effectiveSoft = isSoft && total >= 12;

    const ctx = buildContext(dealerCard, decks, trueCount);

    const standResult = standEV(ctx, total);
    const hitResult = hitEV(ctx, total, effectiveSoft);
    const doubleResult = doubleEV(ctx, total, effectiveSoft);

    const actions = [
      { label: "Stand", ev: standResult, dollars: standResult * betSize },
      { label: "Hit", ev: hitResult, dollars: hitResult * betSize },
      { label: "Double", ev: doubleResult, dollars: doubleResult * betSize }
    ].sort((a, b) => b.ev - a.ev);

    const best = actions[0];
    document.getElementById("bestMove").textContent = best.label;
    document.getElementById("bestMoveDetail").textContent =
      `${buildReason(best.label, total, dealerCard, effectiveSoft)} Model-estimated return: ${formatEV(best.ev)} units (${formatMoney(best.dollars)} on a ${formatMoney(betSize)} base bet).`;

    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = actions.map((action) => `
      <div class="result-item">
        <span>${action.label}</span>
        <strong class="${valueClass(action.ev)}">Estimated EV (model): ${formatEV(action.ev)} units</strong>
        <p class="small-note mb-0">Estimated average return (per hand at this bet): ${formatMoney(action.dollars)}</p>
      </div>
    `).join("");

    const notes = buildContextNotes(blackjackPayout, trueCount);
    if (notes.length) {
      resultsElement.innerHTML += notes.map((note) => `<p class="small-note">${note}</p>`).join("");
    }

    // Monte Carlo verification (same composition, same policy as the model)
    const mcToggle = document.getElementById("monteCarloToggle");
    if (mcToggle?.checked) {
      const trials = Number(document.getElementById("mcTrials")?.value) || 50000;
      const mc = runMonteCarloEV(ctx, dealerCard, total, effectiveSoft, trials);
      resultsElement.innerHTML += `
        <div class="card top-gap subtle-card card-glass">
          <strong>Monte-Carlo (simulation check, ${clamp(Math.round(trials), 1000, 500000)} trials)</strong>
          <div class="result-item"><span>Stand</span><strong>${formatEV(mc.standEV)} EV</strong><p class="small-note mb-0">Simulated average return per base bet</p></div>
          <div class="result-item"><span>Hit</span><strong>${formatEV(mc.hitEV)} EV</strong><p class="small-note mb-0">Simulated average return per base bet (follows the model's hit/stand policy)</p></div>
          <div class="result-item"><span>Double</span><strong>${formatEV(mc.doubleEV)} EV</strong><p class="small-note mb-0">Simulated average return with doubled stake</p></div>
          <p class="small-note mb-0">Simulation uses the same card composition as the model, so values should agree within normal sampling noise.</p>
        </div>
      `;
    }

    resultsElement.dataset.resultReady = markResultReady ? "true" : "false";
  }

  function resetInputs() {
    document.getElementById("playerTotal").value = 16;
    document.getElementById("dealerCard").value = 10;
    document.getElementById("isSoft").value = "false";
    document.getElementById("decks").value = 6;
    document.getElementById("blackjackPayout").value = 1.5;
    document.getElementById("betSize").value = 25;
    document.getElementById("trueCount").value = 0;
    calculateEV(true);
  }

  document.getElementById("calcBtn")?.addEventListener("click", () => calculateEV(true));
  document.getElementById("demoBtn")?.addEventListener("click", resetInputs);
  document.getElementById("resetBtn")?.addEventListener("click", resetInputs);

  calculateEV(false);
})();
