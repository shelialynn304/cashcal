document.addEventListener("DOMContentLoaded", () => {
  const symbols = ["7", "★", "🍒", "🔔", "💎"];
  const reel1 = document.getElementById("reel1");
  const reel2 = document.getElementById("reel2");
  const reel3 = document.getElementById("reel3");
  const spinBtn = document.getElementById("spinBtn");
  const slotResult = document.getElementById("slotResult");

  if (!reel1 || !reel2 || !reel3 || !spinBtn || !slotResult) return;

  const reels = [reel1, reel2, reel3];

  function setSymbol(reel, symbol) {
    const symbolEl = reel.querySelector(".slot-symbol");
    symbolEl.textContent = symbol;
  }

  function randomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  function clearReelStates() {
    reels.forEach((reel) => {
      reel.classList.remove("slot-win", "slot-jackpot", "reel-spinning");
    });

    slotResult.classList.remove("result-small-win", "result-jackpot", "result-loss");
  }

  function evaluateResult(results) {
    const [a, b, c] = results;

    if (a === b && b === c) {
      reels.forEach((reel) => reel.classList.add("slot-jackpot"));
      slotResult.classList.add("result-jackpot");
      slotResult.textContent = `JACKPOT — ${a} ${a} ${a}. Congratulations, randomness briefly pretended to care.`;
      return;
    }

    if (a === b || a === c || b === c) {
      reels.forEach((reel) => reel.classList.add("slot-win"));
      slotResult.classList.add("result-small-win");
      slotResult.textContent = `Small win — two symbols matched. Just enough hope to keep bad ideas alive.`;
      return;
    }

    slotResult.classList.add("result-loss");
    slotResult.textContent = `No win. The machine remains cold, distant, and statistically consistent.`;
  }

  function spinReel(reel, delay) {
    return new Promise((resolve) => {
      reel.classList.add("reel-spinning");

      const interval = setInterval(() => {
        setSymbol(reel, randomSymbol());
      }, 90);

      setTimeout(() => {
        clearInterval(interval);
        reel.classList.remove("reel-spinning");
        const finalSymbol = randomSymbol();
        setSymbol(reel, finalSymbol);
        resolve(finalSymbol);
      }, delay);
    });
  }

  async function spinSlots() {
    spinBtn.disabled = true;
    clearReelStates();
    slotResult.textContent = "Spinning... while math quietly prepares your disappointment.";

    const result1 = await spinReel(reel1, 850);
    const result2 = await spinReel(reel2, 1150);
    const result3 = await spinReel(reel3, 1450);

    evaluateResult([result1, result2, result3]);

    spinBtn.disabled = false;
  }

  spinBtn.addEventListener("click", spinSlots);
});