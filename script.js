function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

// Monte Carlo simulation for a simple even-money style game
function simulateSession(bankroll, betSize, houseEdgePercent, bets) {
  let balance = bankroll;

  // Rough even-money game model:
  // 50% win chance would be fair.
  // House edge lowers actual win chance slightly.
  const winProbability = clamp(0.5 - (houseEdgePercent / 200), 0.01, 0.99);

  for (let i = 0; i < bets; i++) {
    if (balance < betSize) {
      break; // busted, can't keep betting
    }

    const roll = Math.random();

    if (roll < winProbability) {
      balance += betSize;
    } else {
      balance -= betSize;
    }
  }

  return balance;
}

function runMonteCarlo(bankroll, betSize, houseEdgePercent, bets, simulations) {
  const endings = [];
  let bustCount = 0;
  let profitCount = 0;

  for (let i = 0; i < simulations; i++) {
    const ending = simulateSession(bankroll, betSize, houseEdgePercent, bets);
    endings.push(ending);

    if (ending < betSize) {
      bustCount++;
    }

    if (ending > bankroll) {
      profitCount++;
    }
  }

  const total = endings.reduce((sum, value) => sum + value, 0);
  const averageEnding = total / endings.length;
  const minEnding = Math.min(...endings);
  const maxEnding = Math.max(...endings);

  const bustRisk = (bustCount / simulations) * 100;
  const profitChance = (profitCount / simulations) * 100;

  return {
    averageEnding,
    minEnding,
    maxEnding,
    bustRisk,
    profitChance
  };
}

document.getElementById("bankrollForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const bankroll = parseFloat(document.getElementById("bankroll").value);
  const betSize = parseFloat(document.getElementById("betSize").value);
  const houseEdge = parseFloat(document.getElementById("houseEdge").value);
  const bets = parseInt(document.getElementById("bets").value, 10);

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

  const simulations = 5000;
  const results = runMonteCarlo(bankroll, betSize, houseEdge, bets, simulations);

  document.getElementById("expectedLoss").textContent = formatMoney(bankroll - results.averageEnding);
  document.getElementById("endingBankroll").textContent = formatMoney(results.averageEnding);
  document.getElementById("bustRisk").textContent = `${results.bustRisk.toFixed(1)}%`;
  document.getElementById("profitChance").textContent = `${results.profitChance.toFixed(1)}%`;

  const summary = `
    Based on ${simulations.toLocaleString()} simulated sessions, the average ending bankroll was ${formatMoney(results.averageEnding)}.
    The estimated chance of busting was ${results.bustRisk.toFixed(1)}%, and the chance of finishing ahead was ${results.profitChance.toFixed(1)}%.
    The worst simulated result was ${formatMoney(results.minEnding)}, and the best was ${formatMoney(results.maxEnding)}.
  `;

  document.getElementById("summary").textContent = summary.trim();
});

// Auto-run on load
document.getElementById("bankrollForm").dispatchEvent(new Event("submit"));
