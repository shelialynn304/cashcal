(function () {
  const dealerIsStrong = (upcard) => upcard === "A" || Number(upcard) >= 7;

  function recommendMove(total, upcard) {
    const dealerStrong = dealerIsStrong(upcard);

    if (total <= 8) {
      return { move: "Hit", mistake: "Standing too early", reason: "Low totals need improvement. Standing gives away equity." };
    }
    if (total === 9 && !dealerStrong) {
      return { move: "Double", mistake: "Missing a value spot", reason: "9 vs weak dealer cards is a strong build hand for doubling." };
    }
    if (total >= 17) {
      return { move: "Stand", mistake: "Over-hitting strong totals", reason: "Hard 17+ already wins often enough. Extra cards add unnecessary bust risk." };
    }
    if (total >= 13 && total <= 16 && !dealerStrong) {
      return { move: "Stand", mistake: "Hitting into dealer weakness", reason: "Against weak upcards, let the dealer bust more often." };
    }
    if (total === 12 && !dealerStrong && Number(upcard) >= 4 && Number(upcard) <= 6) {
      return { move: "Stand", mistake: "Trying to force improvement", reason: "12 vs 4-6 is a classic patience spot." };
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
        result.textContent = "✅ Correct. 16 vs 10 is ugly, but hitting is still the best long-run move.";
      } else {
        result.textContent = "❌ Not this time. Hit is the better long-run decision in this spot.";
      }
    });
  });

  updateDrill();
})();
