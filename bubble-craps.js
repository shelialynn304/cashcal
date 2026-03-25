let betTotal = 0;
let bankroll = 100;
let wins = 0;
let losses = 0;
let rolls = 0;
let point = null;
let roundActive = false;
let highBankroll = 100;

const bankrollHistory = [100];
const rollHistory = [];

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
const highBankrollEl = document.getElementById("highBankroll");
const rollHistoryEl = document.getElementById("rollHistory");

let bankrollChart;

function createChart() {
  const ctx = document.getElementById("bankrollChart").getContext("2d");

  bankrollChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Start"],
      datasets: [{
        label: "Bankroll",
        data: bankrollHistory,
        borderWidth: 2,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "white"
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        },
        y: {
          ticks: {
            color: "white"
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        }
      }
    }
  });
}

function updateChart() {
  bankrollChart.data.labels = bankrollHistory.map((_, i) => i === 0 ? "Start" : `Roll ${i}`);
  bankrollChart.data.datasets[0].data = bankrollHistory;
  bankrollChart.update();
}

function updateRollHistory() {
  if (rollHistory.length === 0) {
    rollHistoryEl.innerHTML = `<span class="history-empty">No rolls yet.</span>`;
    return;
  }

  rollHistoryEl.innerHTML = rollHistory
    .slice(-10)
    .reverse()
    .map(item => `<span class="roll-badge">${item}</span>`)
    .join("");
}

function updateDisplay() {
  betTotalEl.textContent = betTotal;
  bankrollEl.textContent = bankroll;
  rollCountEl.textContent = rolls;
  winCountEl.textContent = wins;
  lossCountEl.textContent = losses;
  highBankrollEl.textContent = highBankroll;
  pointEl.textContent = point === null ? "OFF" : point;
}

function playChipSound() {
  if (chipSound) {
    chipSound.currentTime = 0;
    chipSound.play().catch(() => {});
  }
}

function recordRoll(die1, die2, total) {
  rollHistory.push(`${die1}+${die2}=${total}`);
  updateRollHistory();
}

function recordBankroll() {
  bankrollHistory.push(bankroll);
  if (bankroll > highBankroll) {
    highBankroll = bankroll;
  }
  updateChart();
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
  recordRoll(die1, die2, total);

  if (!roundActive) {
    if (total === 7 || total === 11) {
      bankroll += betTotal;
      wins++;
      roundResultEl.textContent = `Natural! ${total} on the come-out roll. You won $${betTotal}.`;
      betTotal = 0;
      recordBankroll();
    } else if (total === 2 || total === 3 || total === 12) {
      bankroll -= betTotal;
      losses++;
      roundResultEl.textContent = `Craps! ${total} on the come-out roll. You lost $${betTotal}.`;
      betTotal = 0;
      recordBankroll();
    } else {
      point = total;
      roundActive = true;
      roundResultEl.textContent = `Point is set to ${point}. Roll again before a 7 kills the party.`;
    }
  } else {
    if (total === point) {
      bankroll += betTotal;
      wins++;
      roundResultEl.textContent = `Point hit! You rolled ${point} and won $${betTotal}.`;
      betTotal = 0;
      point = null;
      roundActive = false;
      recordBankroll();
    } else if (total === 7) {
      bankroll -= betTotal;
      losses++;
      roundResultEl.textContent = `Seven out! You lost $${betTotal}.`;
      betTotal = 0;
      point = null;
      roundActive = false;
      recordBankroll();
    } else {
      roundResultEl.textContent = `Rolled ${total}. Point is still ${point}. Keep rolling.`;
    }
  }

  if (bankroll <= 0) {
    bankroll = 0;
    roundResultEl.textContent = "Bankroll busted! The dice dragged your wallet behind the shed.";
    rollBtn.disabled = true;
    betTotal = 0;
    point = null;
    roundActive = false;
    recordBankroll();
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
  highBankroll = 100;

  bankrollHistory.length = 0;
  bankrollHistory.push(100);

  rollHistory.length = 0;

  diceResultEl.textContent = "-";
  roundResultEl.textContent = "-";
  rollBtn.disabled = false;

  updateDisplay();
  updateRollHistory();
  updateChart();
});

createChart();
updateDisplay();
updateRollHistory();
