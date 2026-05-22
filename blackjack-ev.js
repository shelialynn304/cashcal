(function () {
  // Card probabilities (infinite-shoe approximation)
  const cardProbabilities = [
    { value: 2, p: 1 / 13 },
    { value: 3, p: 1 / 13 },
    { value: 4, p: 1 / 13 },
    { value: 5, p: 1 / 13 },
    { value: 6, p: 1 / 13 },
    { value: 7, p: 1 / 13 },
    { value: 8, p: 1 / 13 },
    { value: 9, p: 1 / 13 },
    { value: 10, p: 4 / 13 },
    { value: 11, p: 1 / 13 }
  ];

  // drawCard is used by dealer simulation; move it up so simulator can call it
  function drawCard(total, isSoft, cardValue) {
    let newTotal = total + (cardValue === 11 ? 11 : cardValue);
    let soft = isSoft || cardValue === 11;

    while (newTotal > 21 && soft) {
      newTotal -= 10;
      soft = false;
    }

    return { total: newTotal, isSoft: soft };
  }

  // Monte-Carlo dealer simulator (cached per upcard) — avoids relying on a hardcoded table
  const dealerCache = {};
  function sampleCard() {
    const r = Math.random();
    let s = 0;
    for (const c of cardProbabilities) {
      s += c.p;
      if (r <= s) return c.value;
    }
    return 10;
  }

  function getDealerFinalTotalProbs(upcard, trials = 20000) {
    if (dealerCache[upcard]) return dealerCache[upcard];
    const counts = { 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, bust: 0 };

    for (let t = 0; t < trials; t++) {
      let total = upcard === 11 ? 11 : upcard;
      let soft = upcard === 11;

      // draw hole card
      const hole = sampleCard();
      ({ total, isSoft: soft } = drawCard(total, soft, hole));

      // dealer stands on all 17s (S17 behavior)
      while (true) {
        if (total > 21) {
          counts.bust++;
          break;
        }
        if (total > 17) {
          counts[total]++;
          break;
        }
        if (total === 17) {
          // stand on soft 17 as well
          counts[17]++;
          break;
        }
        const c = sampleCard();
        ({ total, isSoft: soft } = drawCard(total, soft, c));
      }
    }

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
    const probs = {};
    for (const k in counts) probs[k] = counts[k] / totalCount;
    dealerCache[upcard] = probs;
    return probs;
  }

  // Hit EV memoization and depth control
  const MAX_HIT_DEPTH = 6;
  const hitCache = new Map();

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

    // Get dealer outcome probabilities for this upcard (simulated)
    const dealerProbs = getDealerFinalTotalProbs(dealerCard) || { 17: 0.08, 18: 0.08, 19: 0.08, 20: 0.08, 21: 0.08, bust: 0.2 };
    
    // Calculate win, push, and loss probabilities
    let winProb = dealerProbs.bust; // Player wins if dealer busts
    let pushProb = 0;
    let lossProb = 0;

    // Add wins from dealer stiffs that are lower than player total
    for (let dealerTotal = 17; dealerTotal <= 21; dealerTotal++) {
      const prob = dealerProbs[dealerTotal] || 0;
      if (dealerTotal < total) {
        winProb += prob;
      } else if (dealerTotal === total) {
        pushProb += prob;
      } else {
        lossProb += prob;
      }
    }

    // Ensure probabilities sum to ~1
    const totalProb = winProb + pushProb + lossProb;
    if (totalProb > 0) {
      winProb /= totalProb;
      pushProb /= totalProb;
      lossProb /= totalProb;
    }

    // EV = (win prob * 1) + (push prob * 0) + (loss prob * -1) = win prob - loss prob
    let ev = winProb - lossProb;
    
    ev = applyRuleAdjustment(clamp(ev, -1, 1), decks, blackjackPayout);
    ev = applyCountAdjustment(ev, trueCount, "stand");
    return clamp(ev, -1, 1);
  }

  

  function estimateHitEV(total, isSoft, dealerCard, decks, blackjackPayout, trueCount, depth = 0) {
    if (total > 21) return -1;

    const key = `${total}|${isSoft ? 1 : 0}|${dealerCard}|${decks}|${blackjackPayout}|${trueCount}`;
    if (hitCache.has(key)) return hitCache.get(key);

    if (depth > MAX_HIT_DEPTH) {
      const stand = estimateStandEV(total, dealerCard, decks, blackjackPayout, trueCount);
      hitCache.set(key, stand);
      return stand;
    }

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
    ev = clamp(ev, -1, 1);
    hitCache.set(key, ev);
    return ev;
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

  // Monte-Carlo single-trial dealer final total (uses same infinite-shoe sampling)
  function simulateDealerFinalTotal(upcard) {
    let total = upcard === 11 ? 11 : upcard;
    let soft = upcard === 11;
    const hole = sampleCard();
    ({ total, isSoft: soft } = drawCard(total, soft, hole));
    while (true) {
      if (total > 21) return 'bust';
      if (total > 17) return total;
      if (total === 17) return 17;
      const c = sampleCard();
      ({ total, isSoft: soft } = drawCard(total, soft, c));
    }
  }

  // Run Monte-Carlo verification for Stand, Hit, Double (returns EVs in units per base bet)
  function runMonteCarloEV(total, isSoft, dealerCard, trials) {
    trials = Math.max(1000, Number(trials) || 50000);
    let sumStand = 0;
    let sumDouble = 0;
    let sumHit = 0;

    for (let t = 0; t < trials; t++) {
      // Stand outcome
      const dealerFinal = simulateDealerFinalTotal(dealerCard);
      if (dealerFinal === 'bust') sumStand += 1;
      else if (dealerFinal < total) sumStand += 1;
      else if (dealerFinal === total) sumStand += 0;
      else sumStand -= 1;

      // Double: draw one card, then compare (outcome scaled by 2 units)
      const dblNext = drawCard(total, isSoft, sampleCard());
      if (dblNext.total > 21) {
        sumDouble -= 2;
      } else {
        const dealerFinal2 = simulateDealerFinalTotal(dealerCard);
        if (dealerFinal2 === 'bust') sumDouble += 2;
        else if (dealerFinal2 < dblNext.total) sumDouble += 2;
        else if (dealerFinal2 === dblNext.total) sumDouble += 0;
        else sumDouble -= 2;
      }

      // Hit: simulate simple policy — draw until >=17, then stand
      let pTotal = total;
      let pSoft = isSoft;
      const first = drawCard(pTotal, pSoft, sampleCard());
      pTotal = first.total; pSoft = first.isSoft;
      while (pTotal < 17) {
        const c = sampleCard();
        const next = drawCard(pTotal, pSoft, c);
        pTotal = next.total; pSoft = next.isSoft;
      }
      if (pTotal > 21) sumHit -= 1;
      else {
        const dealerFinal3 = simulateDealerFinalTotal(dealerCard);
        if (dealerFinal3 === 'bust') sumHit += 1;
        else if (dealerFinal3 < pTotal) sumHit += 1;
        else if (dealerFinal3 === pTotal) sumHit += 0;
        else sumHit -= 1;
      }
    }

    return {
      standEV: sumStand / trials,
      hitEV: sumHit / trials,
      doubleEV: sumDouble / trials
    };
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
      `${buildReason(best.label, total, dealerCard, isSoft)} Model-estimated return: ${formatEV(best.ev)} units (${formatMoney(best.dollars)} on a ${formatMoney(betSize)} base bet).`;

    document.getElementById("results").innerHTML = actions.map((action) => `
      <div class="result-item">
        <span>${action.label}</span>
        <strong class="${valueClass(action.ev)}">Estimated EV (model): ${formatEV(action.ev)} units</strong>
        <p class="small-note mb-0">Estimated average return (per hand at this bet): ${formatMoney(action.dollars)}</p>
      </div>
    `).join("");

    // Monte-Carlo verification
    const mcToggle = document.getElementById('monteCarloToggle');
    if (mcToggle?.checked) {
      const trials = Number(document.getElementById('mcTrials')?.value) || 50000;
      const mc = runMonteCarloEV(total, isSoft, dealerCard, trials);
      const mcHtml = `
        <div class="card top-gap subtle-card card-glass">
          <strong>Monte‑Carlo (simulation check, ${trials} trials)</strong>
          <div class="result-item"><span>Stand</span><strong>${formatEV(mc.standEV)} EV</strong><p class="small-note mb-0">Simulated average return per base bet (simulation policy)</p></div>
          <div class="result-item"><span>Hit</span><strong>${formatEV(mc.hitEV)} EV</strong><p class="small-note mb-0">Simulated average return per base bet (simulation policy)</p></div>
          <div class="result-item"><span>Double</span><strong>${formatEV(mc.doubleEV)} EV</strong><p class="small-note mb-0">Simulated average return with doubled stake (simulation policy)</p></div>
        </div>
      `;
      document.getElementById('results').innerHTML += mcHtml;
    }
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
