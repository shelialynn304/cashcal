(function () {
  function parseFractionalOdds(rawValue) {
    const cleaned = String(rawValue || '').trim();

    if (!cleaned) return null;

    if (cleaned.includes('/')) {
      const [left, right] = cleaned.split('/').map((part) => Number(part.trim()));
      if (!Number.isFinite(left) || !Number.isFinite(right) || left <= 0 || right <= 0) {
        return null;
      }
      return {
        fractional: `${left}/${right}`,
        decimal: 1 + left / right,
        numerator: left,
        denominator: right
      };
    }

    const asDecimal = Number(cleaned);
    if (!Number.isFinite(asDecimal) || asDecimal <= 1) {
      return null;
    }

    return {
      fractional: `${(asDecimal - 1).toFixed(2)}/1`,
      decimal: asDecimal,
      numerator: asDecimal - 1,
      denominator: 1
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }

  function permutationsCount(n, r) {
    if (n < r || n <= 0 || r <= 0) return 0;
    let result = 1;
    for (let i = 0; i < r; i += 1) {
      result *= (n - i);
    }
    return result;
  }

  function setupOddsCalculator() {
    const oddsInput = document.getElementById('oddsInput');
    const calcButton = document.getElementById('calcOddsBtn');
    const resultEl = document.getElementById('oddsResult');

    if (!oddsInput || !calcButton || !resultEl) return;

    function render() {
      const parsed = parseFractionalOdds(oddsInput.value);

      if (!parsed) {
        resultEl.textContent = 'Enter valid odds like 5/2 or decimal odds above 1.00.';
        return;
      }

      const impliedProb = (1 / parsed.decimal) * 100;
      const fairPrice = (1 - impliedProb / 100) / (impliedProb / 100);

      resultEl.textContent = `Implied probability: ${impliedProb.toFixed(2)}%. Decimal odds: ${parsed.decimal.toFixed(2)}. Theoretical fair odds before takeout: about ${fairPrice.toFixed(2)}/1.`;
    }

    calcButton.addEventListener('click', render);
    oddsInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') render();
    });

    render();
  }

  function setupTicketEstimator() {
    const ticketType = document.getElementById('ticketType');
    const ticketBase = document.getElementById('ticketBase');
    const horsesUsed = document.getElementById('horsesUsed');
    const calcButton = document.getElementById('calcTicketBtn');
    const resultEl = document.getElementById('ticketResult');

    if (!ticketType || !ticketBase || !horsesUsed || !calcButton || !resultEl) return;

    function render() {
      const base = Number(ticketBase.value);
      const runners = Number(horsesUsed.value);

      if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(runners) || runners < 2) {
        resultEl.textContent = 'Use a valid unit size and horse count to estimate ticket cost.';
        return;
      }

      const legs = ticketType.value === 'exacta' ? 2 : ticketType.value === 'trifecta' ? 3 : 4;
      const combos = permutationsCount(runners, legs);
      const ticketCost = combos * base;

      resultEl.textContent = `${ticketType.value.toUpperCase()} with ${runners} horses creates ${combos} combos. Estimated ticket cost: ${formatCurrency(ticketCost)}. Actual payout depends on the final pool, takeout, and how many other winning tickets share the pool.`;
    }

    calcButton.addEventListener('click', render);
    render();
  }

  function setupValueEdgeCalculator() {
    const marketOddsInput = document.getElementById('edgeMarketOdds');
    const estimateInput = document.getElementById('edgeEstimate');
    const calcButton = document.getElementById('calcEdgeBtn');
    const resultEl = document.getElementById('edgeResult');

    if (!marketOddsInput || !estimateInput || !calcButton || !resultEl) return;

    function render() {
      const parsed = parseFractionalOdds(marketOddsInput.value);
      const estimate = Number(estimateInput.value);

      if (!parsed || !Number.isFinite(estimate) || estimate < 0 || estimate > 100) {
        resultEl.textContent = 'Enter valid market odds and your estimated win percentage (0–100).';
        return;
      }

      const impliedProb = (1 / parsed.decimal) * 100;
      const edgePoints = estimate - impliedProb;
      const expectedRoi = (estimate / 100) * parsed.decimal - 1;
      const edgeLabel = edgePoints >= 0 ? 'Value bet' : 'Overpriced';

      resultEl.textContent = `Market implied probability: ${impliedProb.toFixed(2)}%. Your estimate: ${estimate.toFixed(2)}%. ${edgeLabel}: ${edgePoints >= 0 ? '+' : ''}${edgePoints.toFixed(2)} percentage points. Expected ROI if your estimate is correct: ${expectedRoi >= 0 ? '+' : ''}${(expectedRoi * 100).toFixed(1)}%.`;
    }

    calcButton.addEventListener('click', render);
    estimateInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') render();
    });

    render();
  }

  function setupBankrollEstimator() {
    const bankrollInput = document.getElementById('bankrollInput');
    const unitInput = document.getElementById('unitInput');
    const racesInput = document.getElementById('racesInput');
    const hitRateInput = document.getElementById('hitRateInput');
    const avgNetMultipleInput = document.getElementById('avgNetMultipleInput');
    const calcButton = document.getElementById('calcBankrollBtn');
    const resultEl = document.getElementById('bankrollResult');

    if (!bankrollInput || !unitInput || !racesInput || !hitRateInput || !calcButton || !resultEl) return;

    function runSessionMonteCarlo() {
      const bankrollStart = Number(bankrollInput.value);
      const betUnit = Number(unitInput.value);
      const races = Number(racesInput.value);
      const hitRate = Number(hitRateInput.value) / 100;
      const avgNetMultiple = avgNetMultipleInput ? Number(avgNetMultipleInput.value) : 2.4;

      if (!Number.isFinite(bankrollStart) || bankrollStart <= 0 || !Number.isFinite(betUnit) || betUnit <= 0 || !Number.isFinite(races) || races <= 0 || !Number.isFinite(hitRate) || hitRate <= 0 || hitRate >= 1 || !Number.isFinite(avgNetMultiple) || avgNetMultiple <= 0) {
        resultEl.textContent = 'Use valid bankroll, bet size, race count, hit rate (1% to 99%), and average net profit multiple.';
        return;
      }

      const avgNetWin = betUnit * avgNetMultiple;
      const trials = 1200;
      let bustCount = 0;
      const endingBankrolls = [];

      for (let t = 0; t < trials; t += 1) {
        let bankroll = bankrollStart;
        for (let race = 0; race < races; race += 1) {
          if (bankroll < betUnit) {
            bustCount += 1;
            bankroll = 0;
            break;
          }

          bankroll -= betUnit;
          if (Math.random() < hitRate) {
            bankroll += betUnit + avgNetWin;
          }
        }
        endingBankrolls.push(bankroll);
      }

      endingBankrolls.sort(function (a, b) { return a - b; });
      const median = endingBankrolls[Math.floor(endingBankrolls.length / 2)];
      const bustRate = (bustCount / trials) * 100;

      resultEl.textContent = `Estimated bust risk over ${races} races: ${bustRate.toFixed(1)}%. Median ending bankroll: ${formatCurrency(median)}. Model assumption: each winning race nets ${avgNetMultiple.toFixed(2)}x your bet before fees/taxes.`;
    }

    calcButton.addEventListener('click', runSessionMonteCarlo);
    runSessionMonteCarlo();
  }

  function setupFavoriteLongshotSimulator() {
    const favOddsInput = document.getElementById('favOdds');
    const longOddsInput = document.getElementById('longOdds');
    const simRacesInput = document.getElementById('simRaces');
    const runButton = document.getElementById('runSimBtn');
    const resultEl = document.getElementById('simResult');

    if (!favOddsInput || !longOddsInput || !simRacesInput || !runButton || !resultEl) return;

    function runSimulation() {
      const fav = parseFractionalOdds(favOddsInput.value);
      const longshot = parseFractionalOdds(longOddsInput.value);
      const races = Number(simRacesInput.value);

      if (!fav || !longshot || !Number.isFinite(races) || races < 20) {
        resultEl.textContent = 'Use valid odds and race count (20+).';
        return;
      }

      const favProb = 1 / fav.decimal;
      const longProb = 1 / longshot.decimal;

      let favWins = 0;
      let longWins = 0;
      let favProfit = 0;
      let longProfit = 0;

      for (let i = 0; i < races; i += 1) {
        favProfit -= 1;
        if (Math.random() < favProb) {
          favWins += 1;
          favProfit += fav.decimal;
        }

        longProfit -= 1;
        if (Math.random() < longProb) {
          longWins += 1;
          longProfit += longshot.decimal;
        }
      }

      const favRoi = (favProfit / races) * 100;
      const longRoi = (longProfit / races) * 100;

      resultEl.textContent = `After ${races} races: Favorite won ${favWins} (${((favWins / races) * 100).toFixed(1)}%) with ${favProfit.toFixed(1)} units total (${favRoi.toFixed(1)}% ROI). Longshot won ${longWins} (${((longWins / races) * 100).toFixed(1)}%) with ${longProfit.toFixed(1)} units total (${longRoi.toFixed(1)}% ROI). If these are fair market prices, the average ROI should hover near 0% and the difference is mainly volatility.`;
    }

    runButton.addEventListener('click', runSimulation);
    runSimulation();
  }

  function setupLegacyChecklist() {
    const checkboxes = Array.from(document.querySelectorAll('[data-check]'));
    const status = document.getElementById('checklist-status');
    const resetButton = document.getElementById('reset-checklist');

    if (!checkboxes.length || !status || !resetButton) return;

    function updateStatus() {
      const checked = checkboxes.filter(function (item) { return item.checked; }).length;
      status.textContent = `${checked} / ${checkboxes.length} complete`;
    }

    checkboxes.forEach(function (item) {
      item.addEventListener('change', updateStatus);
    });

    resetButton.addEventListener('click', function () {
      checkboxes.forEach(function (item) {
        item.checked = false;
      });
      updateStatus();
    });

    updateStatus();
  }

  setupOddsCalculator();
  setupTicketEstimator();
  setupValueEdgeCalculator();
  setupBankrollEstimator();
  setupFavoriteLongshotSimulator();
  setupLegacyChecklist();
})();
