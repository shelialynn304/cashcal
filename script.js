function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(num) {
  return `$${num.toFixed(2)}`;
}

function calculateResults(bankroll, betSize, houseEdgePercent, bets, volatility) {
  const edge = houseEdgePercent / 100;

  // Expected loss = total wagered * house edge
  const totalWagered = betSize * bets;
  const expectedLoss = totalWagered * edge;
  const expectedEndingBankroll = bankroll - expectedLoss;

  // Simple variance estimate, not casino-grade modeling
  const stdDev = Math.sqrt(bets) * betSize * volatility;

  // Approximate bust/profit using normal-ish estimate
  // Bust occurs if losses exceed bankroll
  const zBust = (bankroll - expectedLoss) / (stdDev || 1);
  let bustRisk = 50 - (zBust * 18);

  // Profit occurs if actual result > 0 net result
  const zProfit = expectedLoss / (stdDev || 1);
  let profitChance = 50 - (zProfit * 18);

  bustRisk = clamp(bustRisk, 1, 99);
  profitChance = clamp(profitChance, 1, 99);

  return {
    expectedLoss,
    expectedEndingBankroll: Math.max(expectedEndingBankroll, 0),
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
  const volatility = parseFloat(document.getElementById("volatility").value);

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

  const results = calculateResults(bankroll, betSize, houseEdge, bets, volatility);

  document.getElementById("expectedLoss").textContent = formatMoney(results.expectedLoss);
  document.getElementById("endingBankroll").textContent = formatMoney(results.expectedEndingBankroll);
  document.getElementById("bustRisk").textContent = `${results.bustRisk.toFixed(1)}%`;
  document.getElementById("profitChance").textContent = `${results.profitChance.toFixed(1)}%`;

  const summary = `
    With a starting bankroll of ${formatMoney(bankroll)} and ${bets} bets at ${formatMoney(betSize)}
    each, the expected loss is ${formatMoney(results.expectedLoss)} at a ${houseEdge.toFixed(2)}% house edge.
    Your estimated chance of losing the full bankroll is about ${results.bustRisk.toFixed(1)}%, while
    the rough chance of finishing ahead is about ${results.profitChance.toFixed(1)}%.
  `;

  document.getElementById("summary").textContent = summary.trim();
});

// Auto-run once on page load
document.getElementById("bankrollForm").dispatchEvent(new Event("submit"));
