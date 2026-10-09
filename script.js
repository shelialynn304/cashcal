let resultsChart;
let sessionChart;
// Set by the preset buttons. Blackjack uses the shared blackjack outcome
// table; everything else is modeled as even-money bets.
let currentGame = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

function getWinProbability(houseEdgePercent) {
  return clamp(0.5 - (houseEdgePercent / 200), 0.01, 0.99);
}

// The blackjack outcome table covers realistic blackjack edges only; larger
// entries fall back to the even-money model, and the summary says which ran.
function usesBlackjackModel(houseEdgePercent, game = currentGame) {
  const outcomes = window.EdgeOverLuckBlackjackOutcomes;
  return game === "blackjack" && Boolean(outcomes) && houseEdgePercent <= outcomes.MAX_EDGE_PERCENT;
}

// Returns { play(maxUnits) }, giving one bet's net result in bet units when
// the balance covers maxUnits bets.
function makeBetPlayer(houseEdgePercent, game = currentGame) {
  if (usesBlackjackModel(houseEdgePercent, game)) {
    const outcomes = window.EdgeOverLuckBlackjackOutcomes;
    return outcomes.makeHandPlayer(outcomes.getBlackjackOutcomeTable(houseEdgePercent));
  }

  const winProbability = getWinProbability(houseEdgePercent);
  return { play: () => (Math.random() < winProbability ? 1 : -1) };
}

// One bet. On a short bankroll a blackjack double or split is made for less,
// so neither the win nor the loss can exceed the balance (Math.max only
// absorbs rounding).
function playBet(player, balance, betSize) {
  return Math.max(0, balance + betSize * player.play(balance / betSize));
}

function simulateSession(bankroll, betSize, houseEdgePercent, bets) {
  let balance = bankroll;
  const player = makeBetPlayer(houseEdgePercent);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) break;
    balance = playBet(player, balance, betSize);
  }

  return balance;
}

function generateSession(bankroll, betSize, houseEdgePercent, bets) {
  const balances = [bankroll];
  let balance = bankroll;
  const player = makeBetPlayer(houseEdgePercent);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) break;
    balance = playBet(player, balance, betSize);
    balances.push(balance);
  }

  return balances;
}

function runMonteCarlo(bankroll, betSize, houseEdgePercent, bets, simulations) {
  const endings = [];
  let bustCount = 0;
  let profitCount = 0;
  let lossCount = 0;

  for (let i = 0; i < simulations; i++) {
    const ending = simulateSession(bankroll, betSize, houseEdgePercent, bets);
    endings.push(ending);

    // Bust = the session ended without enough left to cover another bet.
    if (ending < betSize) bustCount++;
    else if (ending > bankroll) profitCount++;
    else lossCount++;
  }

  const total = endings.reduce((sum, value) => sum + value, 0);

  return {
    averageEnding: total / endings.length,
    minEnding: Math.min(...endings),
    maxEnding: Math.max(...endings),
    bustRisk: (bustCount / simulations) * 100,
    profitChance: (profitCount / simulations) * 100,
    bustCount,
    profitCount,
    lossCount
  };
}

function updateCalculator() {
  const bankroll = parseFloat(document.getElementById("bankroll")?.value);
  const betSize = parseFloat(document.getElementById("betSize")?.value);
  const houseEdge = parseFloat(document.getElementById("houseEdge")?.value);
  const bets = parseInt(document.getElementById("bets")?.value, 10);
  const simulations = 5000;

  if (
    !Number.isFinite(bankroll) ||
    !Number.isFinite(betSize) ||
    !Number.isFinite(houseEdge) ||
    !Number.isFinite(bets) ||
    bankroll <= 0 ||
    betSize <= 0 ||
    bets <= 0 ||
    houseEdge < 0
  ) {
    return;
  }

  const results = runMonteCarlo(bankroll, betSize, houseEdge, bets, simulations);

  document.getElementById("expectedLoss").textContent = formatMoney(bankroll - results.averageEnding);
  document.getElementById("endingBankroll").textContent = formatMoney(results.averageEnding);
  document.getElementById("bustRisk").textContent = `${results.bustRisk.toFixed(1)}%`;
  document.getElementById("profitChance").textContent = `${results.profitChance.toFixed(1)}%`;

  const summaryEl = document.getElementById("summary");
  if (summaryEl) {
    summaryEl.textContent =
      `Based on ${simulations.toLocaleString()} simulated sessions, the average ending bankroll was ${formatMoney(results.averageEnding)}. ` +
      `Bust risk was ${results.bustRisk.toFixed(1)}% and profit chance was ${results.profitChance.toFixed(1)}%. ` +
      `Worst result: ${formatMoney(results.minEnding)}. Best result: ${formatMoney(results.maxEnding)}. ` +
      (usesBlackjackModel(houseEdge)
        ? "Model: blackjack hands, including 3:2 blackjacks, doubles, and splits."
        : "Model: even-money bets (win or lose one bet each round).");
  }

  const resultsCanvas = document.getElementById("resultsChart");
  if (resultsCanvas && window.Chart) {
    const resultsCtx = resultsCanvas.getContext("2d");
    if (resultsChart) resultsChart.destroy();

    resultsChart = new Chart(resultsCtx, {
      type: "bar",
      data: {
        labels: ["Bust", "Lost Money", "Profit"],
        datasets: [{
          label: "Simulation Outcomes",
          data: [results.bustCount, results.lossCount, results.profitCount]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  const sessionCanvas = document.getElementById("sessionChart");
  if (sessionCanvas && window.Chart) {
    const sessionData = generateSession(bankroll, betSize, houseEdge, bets);
    const sessionCtx = sessionCanvas.getContext("2d");
    if (sessionChart) sessionChart.destroy();

    sessionChart = new Chart(sessionCtx, {
      type: "line",
      data: {
        labels: sessionData.map((_, i) => i),
        datasets: [{
          label: "Bankroll",
          data: sessionData,
          borderWidth: 2,
          tension: 0.2,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }

}

function setPreset(game) {
  const houseEdgeInput = document.getElementById("houseEdge");
  const betSizeInput = document.getElementById("betSize");
  const form = document.getElementById("bankrollForm");

  if (!houseEdgeInput || !betSizeInput || !form) return;

  if (game === "blackjack") {
    houseEdgeInput.value = 0.5;
    betSizeInput.value = 5;
  } else if (game === "roulette") {
    houseEdgeInput.value = 5.26;
    betSizeInput.value = 5;
  } else if (game === "baccarat") {
    houseEdgeInput.value = 1.06;
    betSizeInput.value = 5;
  }

  currentGame = game;
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.preset === game ? "true" : "false");
  });
  updateCalculator();
}

window.setPreset = setPreset;
window.EdgeOverLuckQuickBankroll = { runMonteCarlo, makeBetPlayer, setGame: (game) => { currentGame = game; } };

const bankrollForm = document.getElementById("bankrollForm");
if (bankrollForm) {
  bankrollForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateCalculator();
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => setPreset(button.dataset.preset));
  });

  updateCalculator();
}
