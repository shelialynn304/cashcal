let resultsChart;
let sessionChart;

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
  } else if (game === "slots") {
    houseEdgeInput.value = 4;
    betSizeInput.value = 3;
  } else if (game === "baccarat") {
    houseEdgeInput.value = 1.06;
    betSizeInput.value = 5;
  }

  form.dispatchEvent(new Event("submit"));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

function getOutcomeProbabilities(houseEdgePercent) {
  const pushProbability = 0.08;
  const winProbability = clamp(0.5 - (houseEdgePercent / 200), 0.01, 0.99 - pushProbability);
  const lossProbability = clamp(1 - pushProbability - winProbability, 0.01, 0.98);
  return { winProbability, pushProbability, lossProbability };
}

function simulateSession(bankroll, betSize, houseEdgePercent, bets) {
  let balance = bankroll;
  const { winProbability, pushProbability } = getOutcomeProbabilities(houseEdgePercent);
  let bustHand = null;
  let handsPlayed = 0;

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) {
      bustHand = i;
      break;
    }

    const r = Math.random();

    if (r < pushProbability) {
      // push
    } else if (r < pushProbability + winProbability) {
      balance += betSize;
    } else {
      balance -= betSize;
    }

    handsPlayed = i + 1;

    if (balance < betSize && bustHand === null && i < bets - 1) {
      bustHand = i + 1;
      break;
    }
  }

  if (bustHand === null && balance < betSize) {
    bustHand = handsPlayed;
  }

  return {
    endingBalance: balance,
    bust: bustHand !== null,
    bustHand,
    handsPlayed
  };
}

function generateSession(bankroll, betSize, houseEdgePercent, bets) {
  const balances = [];
  let balance = bankroll;
  const { winProbability, pushProbability } = getOutcomeProbabilities(houseEdgePercent);

  balances.push(balance);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) break;

    const r = Math.random();

    if (r < pushProbability) {
      // push
    } else if (r < pushProbability + winProbability) {
      balance += betSize;
    } else {
      balance -= betSize;
    }

    balances.push(balance);
  }

  return balances;
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, n) => sum + n, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function runMonteCarlo(bankroll, betSize, houseEdgePercent, bets, simulations) {
  const endings = [];
  const bustHands = [];
  let bustCount = 0;
  let profitCount = 0;
  let lossCount = 0;
  let survivedFullSessionCount = 0;

  for (let i = 0; i < simulations; i++) {
    const result = simulateSession(bankroll, betSize, houseEdgePercent, bets);
    const ending = result.endingBalance;

    endings.push(ending);

    if (result.bust) {
      bustCount++;
      if (result.bustHand !== null) bustHands.push(result.bustHand);
    } else {
      survivedFullSessionCount++;
    }

    if (ending <= 0 || result.bust) {
      // bust bucket only
    } else if (ending > bankroll) {
      profitCount++;
    } else {
      lossCount++;
    }
  }

  const total = endings.reduce((sum, value) => sum + value, 0);
  const averageEnding = total / endings.length;
  const minEnding = Math.min(...endings);
  const maxEnding = Math.max(...endings);
  const bustRisk = (bustCount / simulations) * 100;
  const profitChance = (profitCount / simulations) * 100;
  const survivalRate = (survivedFullSessionCount / simulations) * 100;
  const avgBustHand = average(bustHands);
  const medianBustHand = median(bustHands);

  return {
    averageEnding,
    minEnding,
    maxEnding,
    bustRisk,
    profitChance,
    survivalRate,
    bustCount,
    profitCount,
    lossCount,
    avgBustHand,
    medianBustHand,
    bustHands
  };
}

document.getElementById("bankrollForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const bankroll = parseFloat(document.getElementById("bankroll").value);
  const betSize = parseFloat(document.getElementById("betSize").value);
  const houseEdge = parseFloat(document.getElementById("houseEdge").value);
  const bets = parseInt(document.getElementById("bets").value, 10);
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
    alert("Please enter valid numbers.");
    return;
  }

  const results = runMonteCarlo(bankroll, betSize, houseEdge, bets, simulations);

  document.getElementById("expectedLoss").textContent = formatMoney(bankroll - results.averageEnding);
  document.getElementById("endingBankroll").textContent = formatMoney(results.averageEnding);
  document.getElementById("bustRisk").textContent = `${results.bustRisk.toFixed(1)}%`;
  document.getElementById("profitChance").textContent = `${results.profitChance.toFixed(1)}%`;

  const lastsHandsStat = document.getElementById("lastsHandsStat");
  const lastsHandsNote = document.getElementById("lastsHandsNote");

  if (lastsHandsStat && lastsHandsNote) {
    if (results.bustHands.length > 0) {
      lastsHandsStat.textContent = `YOU LAST ~${Math.round(results.medianBustHand).toLocaleString()} HANDS`;
      lastsHandsNote.textContent =
        `Among busted sessions, the median bust point was about hand ${Math.round(results.medianBustHand).toLocaleString()}, and full-session survival was ${results.survivalRate.toFixed(1)}%.`;
    } else {
      lastsHandsStat.textContent = `YOU LAST THE FULL ${bets.toLocaleString()} HANDS`;
      lastsHandsNote.textContent =
        `In these simulations, the bankroll survived the full session every time. That still does not turn the casino into a charity.`;
    }
  }

  document.getElementById("summary").textContent =
    `Based on ${simulations.toLocaleString()} simulated sessions, the average ending bankroll was ${formatMoney(results.averageEnding)}. ` +
    `Bust risk was ${results.bustRisk.toFixed(1)}%, full-session survival was ${results.survivalRate.toFixed(1)}%, and the chance of finishing ahead was ${results.profitChance.toFixed(1)}%. ` +
    `The worst simulated result was ${formatMoney(results.minEnding)}, and the best was ${formatMoney(results.maxEnding)}.` +
    (results.bustHands.length > 0
      ? ` Busted sessions died around hand ${Math.round(results.avgBustHand).toLocaleString()} on average, with a median bust point of hand ${Math.round(results.medianBustHand).toLocaleString()}.`
      : ``);

  const resultsCanvas = document.getElementById("resultsChart");
  if (resultsCanvas) {
    const resultsCtx = resultsCanvas.getContext("2d");

    if (resultsChart) resultsChart.destroy();

    resultsChart = new Chart(resultsCtx, {
      type: "bar",
      data: {
        labels: ["Bust", "Lost Money", "Profit"],
        datasets: [
          {
            label: "Simulation Outcomes",
            data: [results.bustCount, results.lossCount, results.profitCount]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  const sessionCanvas = document.getElementById("sessionChart");
  if (sessionCanvas) {
    const sessionData = generateSession(bankroll, betSize, houseEdge, bets);
    const sessionCtx = sessionCanvas.getContext("2d");

    if (sessionChart) sessionChart.destroy();

    sessionChart = new Chart(sessionCtx, {
      type: "line",
      data: {
        labels: sessionData.map((_, i) => i),
        datasets: [
          {
            label: "Bankroll",
            data: sessionData,
            borderWidth: 2,
            tension: 0.2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }
});

document.getElementById("bankrollForm").dispatchEvent(new Event("submit"));
