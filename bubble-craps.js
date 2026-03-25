let betTotal = 0;
let bankroll = 100;
let wins = 0;
let losses = 0;
let rolls = 0;
let point = null;
let roundActive = false;

const betTotalEl = document.getElementById("betTotal");
const bankrollEl = document.getElementById("bankroll");
const diceResultEl = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetGame");
const chipSound = document.getElementById("chipSound");
const chips = document.querySelectorAll(".chip");

const roundResultEl = document.getElementById("roundResult");
const rollCountEl = document.getElementById("rollCount");
const winCountEl = document.getElementById("winCount");
const lossCountEl = document.getElementById("lossCount");
const pointEl = document.getElementById("pointValue");

function updateDisplay() {
  betTotalEl.textContent = betTotal;
  bankrollEl.textContent = bankroll;
  rollCountEl.textContent = rolls;
  winCountEl.textContent = wins;
  lossCountEl.textContent = losses;
  pointEl.textContent = point === null ? "-" : point;
}

function playChipSound() {
  if (!chipSound) return;
  chipSound.currentTime = 0;
  chipSound.play().catch((err) => {
    console.log("Chip sound failed:", err);
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    if (bankroll <= 0) return;

    if (roundActive) {
      alert("Finish the current round before changing the bet.");
      return;
    }

    const value = Number(chip.dataset.value);

    if (betTotal + value > bankroll) {
      alert("Not enough bankroll!");
      return;
    }

    betTotal += value;
    updateDisplay();
    playChipSound();
  });
});

rollBtn.addEventListener("click", () => {
  if (bankroll <= 0) {
    alert("Bankroll busted! Reset to play again.");
    return;
  }

  if (betTotal === 0) {
    alert("Place a bet first.");
    return;
  }

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const total = die1 + die2;

  rolls++;
  diceResultEl.textContent = `${die1} + ${die2} = ${total}`;

  // Come-out roll
  if (!roundActive) {
    if (total === 7 || total === 11) {
      bankroll += betTotal;
      wins++;
      roundResultEl.textContent = `Natural! ${total} on the come-out roll. You won $${betTotal}.`;
      betTotal = 0;
    } else if (total === 2 || total === 3 || total === 12) {
      bankroll -= betTotal;
      losses++;
      roundResultEl.textContent = `Craps! ${total} on the come-out roll. You lost $${betTotal}.`;
      betTotal = 0;
    } else {
      point = total;
      roundActive = true;
      roundResultEl.textContent = `Point is set to ${point}. Roll again to hit the point before a 7.`;
    }
  } else {
    // Point phase
    if (total === point) {
      bankroll += betTotal;
      wins++;
      roundResultEl.textContent = `Point hit! You rolled ${point} and won $${betTotal}.`;
      betTotal = 0;
      point = null;
      roundActive = false;
    } else if (total === 7) {
      bankroll -= betTotal;
      losses++;
      roundResultEl.textContent = `Seven out! You lost $${betTotal}.`;
      betTotal = 0;
      point = null;
      roundActive = false;
    } else {
      roundResultEl.textContent = `Rolled ${total}. Point is still ${point}. Keep rolling.`;
    }
  }

  if (bankroll <= 0) {
    bankroll = 0;
    roundResultEl.textContent = "Bankroll busted!";
    rollBtn.disabled = true;
    betTotal = 0;
    point = null;
    roundActive = false;
  }

  updateDisplay();
});

resetBtn.addEventListener("click", () => {
  betTotal = 0;
  bankroll = 100;
  wins = 0;
  losses = 0;
  rolls = 0;
  point = null;
  roundActive = false;

  diceResultEl.textContent = "-";
  roundResultEl.textContent = "-";
  rollBtn.disabled = false;

  updateDisplay();
});

updateDisplay();
