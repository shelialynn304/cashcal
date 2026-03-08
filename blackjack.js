let resultsChart;
let sessionChart;


function setPreset(game) {
  const houseEdgeInput = document.getElementById("houseEdge");
  const betSizeInput = document.getElementById("betSize");
  const form = document.getElementById("bankrollForm");

  if (!houseEdgeInput || !betSizeInput || !form) {
    return;
  }

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

