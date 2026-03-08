let betTotal = 0;
let bankroll = 100;

const betTotalEl = document.getElementById("betTotal");
const bankrollEl = document.getElementById("bankroll");
const diceResultEl = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetGame");
const chipSound = document.getElementById("chipSound");
const chips = document.querySelectorAll(".chip");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const value = Number(chip.dataset.value);

    if (betTotal + value > bankroll) {
      alert("Not enough bankroll!");
      return;
    }

    betTotal += value;
    betTotalEl.textContent = betTotal;

    if (chipSound) {
      chipSound.currentTime = 0;
      chipSound.play().catch(() => {});
    }
  });
});

rollBtn.addEventListener("click", () => {
  if (betTotal === 0) {
    alert("Place a bet first");
    return;
  }

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const dice = die1 + die2;

  diceResultEl.textContent = dice;

  if (dice === 7) {
    bankroll += betTotal;
  } else {
    bankroll -= betTotal;
  }

  if (bankroll <= 0) {
    bankroll = 0;
    bankrollEl.textContent = bankroll;
    betTotal = 0;
    betTotalEl.textContent = 0;
    alert("Bankroll busted!");
    rollBtn.disabled = true;
    return;
  }

  bankrollEl.textContent = bankroll;
  betTotal = 0;
  betTotalEl.textContent = 0;
});

resetBtn.addEventListener("click", () => {
  betTotal = 0;
  bankroll = 100;

  betTotalEl.textContent = 0;
  bankrollEl.textContent = 100;
  diceResultEl.textContent = "-";
  rollBtn.disabled = false;
});

