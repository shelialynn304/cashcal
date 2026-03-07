let resultsChart;
let sessionChart;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

function simulateSession(bankroll, betSize, houseEdgePercent, bets) {
  let balance = bankroll;
  const winProbability = clamp(0.5 - (houseEdgePercent / 200), 0.01, 0.99);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) {
      break;
    }

    if (Math.random() < winProbability) {
      balance += betSize;
    } else {
      balance -= betSize;
    }
  }

  return balance;
}

function generateSession(bankroll, betSize, houseEdgePercent, bets) {
  const balances = [];
  let balance = bankroll;
  const winProbability = clamp(0.5 - (houseEdgePercent / 200), 0.01, 0.99);

  balances.push(balance);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) {
      break;
    }

    if (Math.random() < winProbability) {
      balance += betSize;
    } else {
      balance -= betSize;
    }

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

    if (ending <= 0) {
      bustCount++;
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

  return {
    averageEnding,
    minEnding,
    maxEnding,
    bustRisk: (bustCount / simulations) * 100,
    profitChance: (profitCount / simulations) * 100,
    bustCount,
    profitCount,
    lossCount
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

  document.getElementById("summary").textContent =
    `Based on ${simulations.toLocaleString()} simulated sessions, the average ending bankroll was ${formatMoney(results.averageEnding)}. ` +
    `The estimated chance of busting was ${results.bustRisk.toFixed(1)}%, and the chance of finishing ahead was ${results.profitChance.toFixed(1)}%. ` +
    `The worst simulated result was ${formatMoney(results.minEnding)}, and the best was ${formatMoney(results.maxEnding)}.`;

  const resultsCanvas = document.getElementById("resultsChart");
  if (resultsCanvas) {
    const resultsCtx = resultsCanvas.getContext("2d");

    if (resultsChart) {
      resultsChart.destroy();
    }

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
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  const sessionCanvas = document.getElementById("sessionChart");
  if (sessionCanvas) {
    const sessionData = generateSession(bankroll, betSize, houseEdge, bets);
    const sessionCtx = sessionCanvas.getContext("2d");

    if (sessionChart) {
      sessionChart.destroy();
    }

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
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
});

document.getElementById("bankrollForm").dispatchEvent(new Event("submit"));
