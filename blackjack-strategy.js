(function () {
  // Hard-total basic strategy: 6 decks, dealer stands on soft 17, matches the trainer.
  const upValue = (upcard) => (upcard === "A" ? 11 : Number(upcard));

  function recommendMove(total, upcard) {
    const up = upValue(upcard);

    if (total <= 8) {
      return { move: "Hit", mistake: "Standing too early", reason: "Low totals need improvement. Standing gives away equity." };
    }
    if (total === 9) {
      return up >= 3 && up <= 6
        ? { move: "Double", mistake: "Missing a value spot", reason: "9 vs 3-6 is a doubling spot: the dealer is weak and one card often makes a strong hand." }
        : { move: "Hit", mistake: "Doubling without enough edge", reason: up === 2 ? "9 vs 2 is close, but hitting beats doubling." : "Against a strong upcard, take a card but don't put more money out." };
    }
    if (total === 10) {
      return up <= 9
        ? { move: "Double", mistake: "Missing a value spot", reason: "10 vs 2-9 is a doubling spot: any ten makes 20." }
        : { move: "Hit", mistake: "Doubling into strength", reason: "Against a 10 or Ace, 10 is not strong enough to double." };
    }
    if (total === 11) {
      return up <= 10
        ? { move: "Double", mistake: "Missing a value spot", reason: "11 vs 2-10 is one of the best doubles in the game." }
        : { move: "Hit", mistake: "Doubling into an Ace", reason: "With 6 decks and dealer standing on soft 17, 11 vs Ace is a hit. (Double it if the dealer hits soft 17.)" };
    }
    if (total >= 17) {
      return { move: "Stand", mistake: "Over-hitting strong totals", reason: "Hard 17+ already wins often enough. Extra cards add unnecessary bust risk." };
    }
    if (total === 12) {
      return up >= 4 && up <= 6
        ? { move: "Stand", mistake: "Trying to force improvement", reason: "12 vs 4-6 is a classic patience spot." }
        : { move: "Hit", mistake: "Standing out of fear", reason: up <= 3 ? "12 vs 2 or 3 is a hit: the dealer busts too rarely to justify standing." : "Dealer strength means you need to improve to compete." };
    }
    if (up <= 6) {
      return { move: "Stand", mistake: "Hitting into dealer weakness", reason: "Against weak upcards, let the dealer bust more often." };
    }

    return { move: "Hit", mistake: "Standing out of fear", reason: "Dealer strength means you usually need to improve to compete." };
  }

  const evaluateBtn = document.getElementById("drillEvaluateBtn");
  const randomBtn = document.getElementById("drillRandomBtn");

  function updateDrill() {
    const total = Number(document.getElementById("drillPlayerTotal")?.value || 16);
    const upcard = document.getElementById("drillDealerUpcard")?.value || "10";
    const result = recommendMove(total, upcard);

    document.getElementById("drillBestMove").textContent = result.move;
    document.getElementById("drillMistake").textContent = result.mistake;
    document.getElementById("drillReason").textContent = `${total} vs ${upcard}: ${result.reason}`;
  }

  if (evaluateBtn) evaluateBtn.addEventListener("click", updateDrill);

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const total = Math.floor(Math.random() * 14) + 8;
      const upcards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
      document.getElementById("drillPlayerTotal").value = total;
      document.getElementById("drillDealerUpcard").value = upcards[Math.floor(Math.random() * upcards.length)];
      updateDrill();
    });
  }

  document.querySelectorAll("[data-quiz-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = document.getElementById("quiz-result");
      if (!result) return;

      if (button.dataset.quizAnswer === "hit") {
        result.textContent = "✅ Correct. 16 vs 10 is uncomfortable, but hitting is still the best long-run move.";
      } else {
        result.textContent = "❌ Not this time. Hit is the better long-run decision in this spot.";
      }
    });
  });

  updateDrill();
})();
