(function () {
  const dealerBustByUpcard = { 2: 0.353, 3: 0.373, 4: 0.402, 5: 0.429, 6: 0.423, 7: 0.262, 8: 0.244, 9: 0.233, 10: 0.212, 11: 0.116 };
  const standWinChanceByTotal = { 4: 0.08, 5: 0.09, 6: 0.10, 7: 0.12, 8: 0.14, 9: 0.18, 10: 0.22, 11: 0.25, 12: 0.29, 13: 0.34, 14: 0.39, 15: 0.43, 16: 0.47, 17: 0.57, 18: 0.68, 19: 0.79, 20: 0.88, 21: 0.92 };
  const cardProbabilities = [{ value: 2, p: 1 / 13 }, { value: 3, p: 1 / 13 }, { value: 4, p: 1 / 13 }, { value: 5, p: 1 / 13 }, { value: 6, p: 1 / 13 }, { value: 7, p: 1 / 13 }, { value: 8, p: 1 / 13 }, { value: 9, p: 1 / 13 }, { value: 10, p: 4 / 13 }, { value: 11, p: 1 / 13 }];

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  const formatEV = (ev) => `${ev > 0 ? "+" : ""}${ev.toFixed(3)}`;
  const formatMoney = (amount) => `$${amount.toFixed(2)}`;

  function valueClass(ev) {
    if (ev > 0.02) return "text-gold";
    if (ev < -0.02) return "text-muted";
    return "";
  }

  function applyCountAdjustment(ev, trueCount, action) {
    const count = Number(trueCount) || 0;
    return ev + (count * (action === "double" ? 0.012 : 0.008));
  }

  function applyRuleAdjustment(ev, decks, blackjackPayout) {
    let adjusted = ev;
    if (Number(decks) <= 2) adjusted += 0.01;
    if (Number(blackjackPayout) === 1.2) adjusted -= 0.015;
    return adjusted;
  }

  function estimateStandEV(total, dealerCard, decks, blackjackPayout, trueCount) {
    if (total > 21) return -1;

    const bustChance = dealerBustByUpcard[dealerCard] || 0.2;
    const baseWinChance = standWinChanceByTotal[total] || 0.1;
    const dealerPressure = dealerCard >= 7 ? -0.06 : 0.03;

    let ev = (baseWinChance + bustChance * 0.55 + dealerPressure) - (1 - (baseWinChance + bustChance * 0.55 + dealerPressure));
    ev = applyRuleAdjustment(clamp(ev, -1, 1), decks, blackjackPayout);
    ev = applyCountAdjustment(ev, trueCount, "stand");
    return clamp(ev, -1, 1);
  }

  function drawCard(total, isSoft, cardValue) {
    let newTotal = total + (cardValue === 11 ? 11 : cardValue);
    let soft = isSoft || cardValue === 11;

    while (newTotal > 21 && soft) {
      newTotal -= 10;
      soft = false;
    }

    return { total: newTotal, isSoft: soft };
  }

  function estimateHitEV(total, isSoft, dealerCard, decks, blackjackPayout, trueCount, depth = 0) {
    if (total > 21) return -1;
    if (depth > 1) return estimateStandEV(total, dealerCard, decks, blackjackPayout, trueCount);

    let ev = 0;
    for (const card of cardProbabilities) {
      const next = drawCard(total, isSoft, card.value);
      let branchEV;

      if (next.total > 21) {
        branchEV = -1;
      } else if (next.total >= 17) {
        branchEV = estimateStandEV(next.total, dealerCard, decks, blackjackPayout, trueCount);
      } else {
        const standEV = estimateStandEV(next.total, dealerCard, decks, blackjackPayout, trueCount);
        const hitAgainEV = estimateHitEV(next.total, next.isSoft, dealerCard, decks, blackjackPayout, trueCount, depth + 1);
        branchEV = Math.max(standEV, hitAgainEV);
      }

      ev += card.p * branchEV;
    }

    ev = applyRuleAdjustment(ev, decks, blackjackPayout);
    ev = applyCountAdjustment(ev, trueCount, "hit");
    return clamp(ev, -1, 1);
  }

  function estimateDoubleEV(total, isSoft, dealerCard, decks, blackjackPayout, trueCount) {
    let ev = 0;

    for (const card of cardProbabilities) {
      const next = drawCard(total, isSoft, card.value);
      ev += card.p * (next.total > 21 ? -1 : estimateStandEV(next.total, dealerCard, decks, blackjackPayout, trueCount));
    }

    ev = applyRuleAdjustment(ev * 2, decks, blackjackPayout);
    ev = applyCountAdjustment(ev, trueCount, "double");
    return clamp(ev, -2, 2);
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

  function calculateEV() {
    const total = clamp(Number(document.getElementById("playerTotal").value) || 16, 4, 21);
    const dealerCard = Number(document.getElementById("dealerCard").value);
    const isSoft = document.getElementById("isSoft").value === "true";
    const decks = Number(document.getElementById("decks").value);
    const blackjackPayout = Number(document.getElementById("blackjackPayout").value);
    const betSize = Math.max(1, Number(document.getElementById("betSize").value) || 25);
    const trueCount = Number(document.getElementById("trueCount").value) || 0;

    const standEV = estimateStandEV(total, dealerCard, decks, blackjackPayout, trueCount);
    const hitEV = estimateHitEV(total, isSoft, dealerCard, decks, blackjackPayout, trueCount);
    const doubleEV = estimateDoubleEV(total, isSoft, dealerCard, decks, blackjackPayout, trueCount);

    const actions = [
      { label: "Stand", ev: standEV, dollars: standEV * betSize },
      { label: "Hit", ev: hitEV, dollars: hitEV * betSize },
      { label: "Double", ev: doubleEV, dollars: doubleEV * betSize }
    ].sort((a, b) => b.ev - a.ev);

    const best = actions[0];
    document.getElementById("bestMove").textContent = best.label;
    document.getElementById("bestMoveDetail").textContent =
      `${buildReason(best.label, total, dealerCard, isSoft)} Estimated return: ${formatEV(best.ev)} units (${formatMoney(best.dollars)} on a ${formatMoney(betSize)} base bet).`;

    document.getElementById("results").innerHTML = actions.map((action) => `
      <div class="result-item">
        <span>${action.label}</span>
        <strong class="${valueClass(action.ev)}">${formatEV(action.ev)} EV</strong>
        <p class="small-note mb-0">Approx return: ${formatMoney(action.dollars)}</p>
      </div>
    `).join("");
  }

  document.getElementById("calcBtn")?.addEventListener("click", calculateEV);
  document.getElementById("demoBtn")?.addEventListener("click", () => {
    document.getElementById("playerTotal").value = 16;
    document.getElementById("dealerCard").value = 10;
    document.getElementById("isSoft").value = "false";
    document.getElementById("decks").value = 6;
    document.getElementById("blackjackPayout").value = 1.5;
    document.getElementById("betSize").value = 25;
    document.getElementById("trueCount").value = 0;
    calculateEV();
  });
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    document.getElementById("playerTotal").value = 16;
    document.getElementById("dealerCard").value = 10;
    document.getElementById("isSoft").value = "false";
    document.getElementById("decks").value = 6;
    document.getElementById("blackjackPayout").value = 1.5;
    document.getElementById("betSize").value = 25;
    document.getElementById("trueCount").value = 0;
    calculateEV();
  });

  calculateEV();
})();
