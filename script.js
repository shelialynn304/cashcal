let resultsChart;
let sessionChart;
// Set by the preset buttons. Blackjack uses the shared blackjack outcome
// table, baccarat adds ties as pushes; everything else is modeled as
// even-money bets.
let currentGame = null;

// Each run simulates 5,000 sessions synchronously, so cap the session length.
const MAX_BETS = 10000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

// Percent with one decimal, without rounding a rare event to 0.0% or a
// near-certain one to 100.0% (same helper as the bankroll page).
function formatShare(percent) {
  if (percent > 0 && percent < 0.05) return "under 0.1%";
  if (percent >= 99.95 && percent < 100) return "over 99.9%";
  return `${percent.toFixed(1)}%`;
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

// Baccarat banker bets push on ties (about 9.5% of hands). The win/push/lose
// table stays valid only for realistic edges; larger entries fall back to the
// even-money model, and the summary says which ran.
const BACCARAT_PUSH_PROBABILITY = 0.095;
const BACCARAT_MAX_EDGE_PERCENT = 10;

function usesBaccaratModel(houseEdgePercent, game = currentGame) {
  return game === "baccarat" && houseEdgePercent <= BACCARAT_MAX_EDGE_PERCENT;
}

// Returns { play(maxUnits), meanUnits(maxUnits) }: one bet's net result in
// bet units, and that bet's average result, when the balance covers maxUnits
// bets. meanUnits always matches what play samples.
function makeBetPlayer(houseEdgePercent, game = currentGame) {
  if (usesBlackjackModel(houseEdgePercent, game)) {
    const outcomes = window.EdgeOverLuckBlackjackOutcomes;
    return outcomes.makeHandPlayer(outcomes.getBlackjackOutcomeTable(houseEdgePercent));
  }

  if (usesBaccaratModel(houseEdgePercent, game)) {
    const edge = houseEdgePercent / 100;
    const winProbability = (1 - BACCARAT_PUSH_PROBABILITY - edge) / 2;
    const lossProbability = (1 - BACCARAT_PUSH_PROBABILITY + edge) / 2;
    return {
      play: () => {
        const draw = Math.random();
        if (draw < winProbability) return 1;
        return draw < winProbability + BACCARAT_PUSH_PROBABILITY ? 0 : -1;
      },
      meanUnits: () => winProbability - lossProbability
    };
  }

  const winProbability = getWinProbability(houseEdgePercent);
  return {
    play: () => (Math.random() < winProbability ? 1 : -1),
    meanUnits: () => 2 * winProbability - 1
  };
}

// Reuse one player across the thousands of sessions in a run.
let cachedPlayer = null;
let cachedPlayerKey = "";

function getBetPlayer(houseEdgePercent) {
  const key = `${currentGame}:${houseEdgePercent}`;
  if (key !== cachedPlayerKey) {
    cachedPlayer = makeBetPlayer(houseEdgePercent);
    cachedPlayerKey = key;
  }
  return cachedPlayer;
}

// One bet. On a short bankroll a blackjack double or split is made for less,
// so neither the win nor the loss can exceed the balance (Math.max only
// absorbs rounding).
function playBet(player, balance, betSize) {
  return Math.max(0, balance + betSize * player.play(balance / betSize));
}

function simulateSession(bankroll, betSize, houseEdgePercent, bets) {
  let balance = bankroll;
  let expectedLoss = 0;
  const player = getBetPlayer(houseEdgePercent);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) break;
    // This bet's average loss at this balance: house edge x bet, plus the
    // extra cost of a blackjack double or split made for less.
    expectedLoss -= betSize * player.meanUnits(balance / betSize);
    balance = playBet(player, balance, betSize);
  }

  return { balance, expectedLoss };
}

function generateSession(bankroll, betSize, houseEdgePercent, bets) {
  const balances = [bankroll];
  let balance = bankroll;
  const player = getBetPlayer(houseEdgePercent);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) break;
    balance = playBet(player, balance, betSize);
    balances.push(balance);
  }

  return balances;
}

function runMonteCarlo(bankroll, betSize, houseEdgePercent, bets, simulations) {
  const endings = [];
  let expectedLossTotal = 0;
  let bustCount = 0;
  let profitCount = 0;
  let breakEvenCount = 0;
  let lossCount = 0;

  for (let i = 0; i < simulations; i++) {
    const session = simulateSession(bankroll, betSize, houseEdgePercent, bets);
    const ending = session.balance;
    endings.push(ending);
    expectedLossTotal += session.expectedLoss;

    // Bust = the session ended without enough left to cover another bet.
    // Break-even allows for floating-point drift from adding and subtracting
    // fractional bets (e.g. $0.07) many times.
    if (ending < betSize) bustCount++;
    else if (Math.abs(ending - bankroll) < betSize * 1e-6) breakEvenCount++;
    else if (ending > bankroll) profitCount++;
    else lossCount++;
  }

  const total = endings.reduce((sum, value) => sum + value, 0);

  return {
    averageEnding: total / endings.length,
    // Sum of each simulated bet's average loss: the same average as bankroll
    // minus the average ending, with far less run-to-run noise.
    expectedLoss: expectedLossTotal / simulations,
    minEnding: Math.min(...endings),
    maxEnding: Math.max(...endings),
    bustRisk: (bustCount / simulations) * 100,
    profitChance: (profitCount / simulations) * 100,
    bustCount,
    profitCount,
    breakEvenCount,
    lossCount
  };
}

// Shown instead of results when the inputs cannot (or should not) be run.
function showNoResults(message) {
  ["expectedLoss", "endingBankroll", "bustRisk", "profitChance"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "—";
  });

  const summaryEl = document.getElementById("summary");
  if (summaryEl) summaryEl.textContent = message;

  if (resultsChart) resultsChart.destroy();
  if (sessionChart) sessionChart.destroy();
  resultsChart = null;
  sessionChart = null;
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

  if (betSize > bankroll) {
    showNoResults("Bet size is larger than the starting bankroll, so no bets can be placed.");
    return;
  }

  if (bets > MAX_BETS) {
    showNoResults(`Use ${MAX_BETS.toLocaleString()} bets or fewer. Longer sessions would freeze the page while ${simulations.toLocaleString()} sessions are simulated.`);
    return;
  }

  const results = runMonteCarlo(bankroll, betSize, houseEdge, bets, simulations);

  document.getElementById("expectedLoss").textContent = formatMoney(clamp(results.expectedLoss, 0, bankroll));
  document.getElementById("endingBankroll").textContent = formatMoney(results.averageEnding);
  document.getElementById("bustRisk").textContent = formatShare(results.bustRisk);
  document.getElementById("profitChance").textContent = formatShare(results.profitChance);

  const summaryEl = document.getElementById("summary");
  if (summaryEl) {
    const bustSessions = results.bustCount > 0
      ? ` (${results.bustCount.toLocaleString()} of ${simulations.toLocaleString()} sessions)`
      : "";
    let model = "Model: even-money bets (win or lose one bet each round).";
    if (usesBlackjackModel(houseEdge)) model = "Model: blackjack hands, including 3:2 blackjacks, doubles, and splits.";
    else if (usesBaccaratModel(houseEdge)) model = "Model: even-money bets with ties as pushes (baccarat).";

    summaryEl.textContent =
      `Based on ${simulations.toLocaleString()} simulated sessions, the average ending bankroll was ${formatMoney(results.averageEnding)}. ` +
      `Bust risk was ${formatShare(results.bustRisk)}${bustSessions} and profit chance was ${formatShare(results.profitChance)}. ` +
      `Worst result: ${formatMoney(results.minEnding)}. Best result: ${formatMoney(results.maxEnding)}. ` +
      model +
      (currentGame === "roulette"
        ? " 5.26% is an American double-zero wheel; a European single-zero wheel is 2.70%."
        : "");
  }

  const resultsCanvas = document.getElementById("resultsChart");
  if (resultsCanvas && window.Chart) {
    const resultsCtx = resultsCanvas.getContext("2d");
    if (resultsChart) resultsChart.destroy();

    resultsChart = new Chart(resultsCtx, {
      type: "bar",
      data: {
        labels: ["Bust", "Lost Money", "Broke even", "Profit"],
        datasets: [{
          label: "Simulation Outcomes",
          data: [results.bustCount, results.lossCount, results.breakEvenCount, results.profitCount]
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

const useToolsCta = document.querySelector('[data-track-label="Use the Tools"]');
if (useToolsCta) {
  useToolsCta.addEventListener("click", () => {
    if (window.amplitudeTrack) {
      window.amplitudeTrack("Clicked Use The Tools", { prompt_version: "BA400.4" }); // helps improve this setup flow — safe to remove once you've verified the event lands
    }
  });
}
