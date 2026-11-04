(function () {
  function parseFractionalOdds(rawValue) {
    let cleaned = String(rawValue || '').trim();

    if (!cleaned) return null;

    // Accept US tote-style hyphen odds such as 5-2 as 5/2.
    if (/^\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?$/.test(cleaned)) {
      cleaned = cleaned.replace('-', '/');
    }

    if (cleaned.includes('/')) {
      const [left, right] = cleaned.split('/').map((part) => Number(part.trim()));
      if (!Number.isFinite(left) || !Number.isFinite(right) || left <= 0 || right <= 0) {
        return null;
      }
      return {
        fractional: `${left}/${right}`,
        decimal: 1 + left / right,
        numerator: left,
        denominator: right,
        inputType: 'fractional'
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
      denominator: 1,
      inputType: 'decimal'
    };
  }

  function trimNumber(value) {
    return String(Number(value.toFixed(2)));
  }

  function describeOddsReading(parsed) {
    if (parsed.inputType === 'decimal') {
      return `Read as decimal odds ${parsed.decimal.toFixed(2)} (= ${trimNumber(parsed.numerator)}/1)`;
    }
    return `Read as fractional odds ${trimNumber(parsed.numerator)}/${trimNumber(parsed.denominator)} (decimal ${parsed.decimal.toFixed(2)})`;
  }

  function signedFixed(value, decimals) {
    const rounded = Number(value.toFixed(decimals));
    if (rounded === 0) return (0).toFixed(decimals);
    return `${rounded > 0 ? '+' : ''}${value.toFixed(decimals)}`;
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
      // Win-pool assumption: posted odds are net of takeout, so the pool's money share is (1 - takeout) / decimal odds.
      const assumedWinTakeout = 0.165;
      const poolShare = ((1 - assumedWinTakeout) / parsed.decimal) * 100;
      const noTakeoutOdds = parsed.decimal / (1 - assumedWinTakeout) - 1;

      resultEl.textContent = `${describeOddsReading(parsed)}. Implied probability: ${impliedProb.toFixed(2)}%. Posted tote odds are already net of takeout. If this is a win-pool price and takeout is about 16.5% (it varies by state), the pool's money share is about ${poolShare.toFixed(2)}% (about ${noTakeoutOdds.toFixed(2)}/1 with no takeout); breakage and odds rounding make this approximate.`;
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

    const ticketRules = {
      exacta: { legs: 2, label: 'Exacta', formula: 'n × (n - 1)' },
      trifecta: { legs: 3, label: 'Trifecta', formula: 'n × (n - 1) × (n - 2)' },
      superfecta: { legs: 4, label: 'Superfecta', formula: 'n × (n - 1) × (n - 2) × (n - 3)' }
    };

    function render() {
      const base = Number(ticketBase.value);
      const runners = Number(horsesUsed.value);
      const rule = ticketRules[ticketType.value] || ticketRules.exacta;

      if (!Number.isFinite(base) || base <= 0) {
        resultEl.textContent = 'Enter a base bet amount greater than $0 before calculating ticket cost.';
        return;
      }

      if (!Number.isFinite(runners) || runners <= 0 || !Number.isInteger(runners)) {
        resultEl.textContent = 'Enter a positive whole number of horses in the box.';
        return;
      }

      if (runners > 20) {
        resultEl.textContent = 'This calculator supports up to 20 horses. Most race fields are much smaller; 20 is the Kentucky Derby limit.';
        return;
      }

      if (base < 0.10) {
        resultEl.textContent = 'Enter a base bet of at least $0.10 (the smallest common minimum, used for dime superfectas).';
        return;
      }

      if (runners < rule.legs) {
        resultEl.textContent = `${rule.label} boxes require at least ${rule.legs} horses. Add more horses or choose a smaller exotic bet type.`;
        return;
      }

      const combos = permutationsCount(runners, rule.legs);
      const ticketCost = combos * base;

      if (!Number.isFinite(combos) || !Number.isFinite(ticketCost) || combos <= 0 || ticketCost < 0) {
        resultEl.textContent = 'This ticket cannot be calculated safely. Check the base bet and horse count.';
        return;
      }

      resultEl.innerHTML = `Estimated ticket cost: <strong>${formatCurrency(ticketCost)}</strong><br>${rule.label} box with ${runners} horses creates ${combos.toLocaleString('en-US')} combinations using ${rule.formula}. Actual payout depends on the final pool, takeout, and how many other winning tickets share the pool.`;
    }

    calcButton.addEventListener('click', render);
    ticketType.addEventListener('change', render);
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
      const estimateRaw = String(estimateInput.value).trim();
      const estimate = Number(estimateRaw);

      if (!parsed || estimateRaw === '' || !Number.isFinite(estimate) || estimate < 0 || estimate > 100) {
        resultEl.textContent = 'Enter valid market odds and your estimated win percentage (0–100).';
        return;
      }

      const impliedProb = (1 / parsed.decimal) * 100;
      const edgePoints = estimate - impliedProb;
      const expectedRoi = (estimate / 100) * parsed.decimal - 1;
      const isBreakEven = Math.abs(edgePoints) < 0.005;
      const edgeLabel = isBreakEven ? 'Break-even price' : (edgePoints > 0 ? 'Value bet' : 'Overpriced');
      const readingNote = parsed.inputType === 'decimal' ? `${describeOddsReading(parsed)}. ` : '';

      resultEl.textContent = `${readingNote}Market implied probability: ${impliedProb.toFixed(2)}%. Your estimate: ${estimate.toFixed(2)}%. ${edgeLabel}: ${signedFixed(isBreakEven ? 0 : edgePoints, 2)} percentage points. Expected ROI if your estimate is correct: ${signedFixed(expectedRoi * 100, 1)}%.`;
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

      if (!Number.isFinite(bankrollStart) || bankrollStart <= 0 || !Number.isFinite(betUnit) || betUnit <= 0 || !Number.isFinite(races) || races <= 0 || !Number.isInteger(races) || !Number.isFinite(hitRate) || hitRate < 0.01 || hitRate > 0.99 || !Number.isFinite(avgNetMultiple) || avgNetMultiple <= 0) {
        resultEl.textContent = 'Use valid bankroll, bet size, whole-number race count, hit rate (1% to 99%), and average net profit multiple.';
        return;
      }

      const avgNetWin = betUnit * avgNetMultiple;
      const trials = 1200;
      let bustCount = 0;
      const endingBankrolls = [];

      for (let t = 0; t < trials; t += 1) {
        let bankroll = bankrollStart;
        let busted = false;
        for (let race = 0; race < races; race += 1) {
          if (bankroll < betUnit) {
            busted = true;
            break;
          }

          bankroll -= betUnit;
          if (Math.random() < hitRate) {
            bankroll += betUnit + avgNetWin;
          }
        }
        // A session that ends unable to cover one more bet also counts as a bust.
        if (busted || bankroll < betUnit) {
          bustCount += 1;
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

      // Assume about 16.5% win-pool takeout and accurate crowd prices: true chance = (1 - takeout) / decimal odds.
      const assumedWinTakeout = 0.165;
      const favProb = (1 - assumedWinTakeout) / fav.decimal;
      const longProb = (1 - assumedWinTakeout) / longshot.decimal;

      if (favProb + longProb > 1 + 1e-9) {
        resultEl.textContent = 'These two prices cannot come from the same win pool: at about 16.5% takeout their pool shares add up to more than 100%. Use longer odds for one or both horses.';
        return;
      }

      let favWins = 0;
      let longWins = 0;
      let favProfit = 0;
      let longProfit = 0;

      for (let i = 0; i < races; i += 1) {
        // One draw per race, so the favorite and the longshot cannot both win the same race.
        const roll = Math.random();

        favProfit -= 1;
        longProfit -= 1;
        if (roll < favProb) {
          favWins += 1;
          favProfit += fav.decimal;
        } else if (roll < favProb + longProb) {
          longWins += 1;
          longProfit += longshot.decimal;
        }
      }

      const favRoi = (favProfit / races) * 100;
      const longRoi = (longProfit / races) * 100;

      resultEl.textContent = `After ${races} races: Favorite won ${favWins} (${((favWins / races) * 100).toFixed(1)}%) with ${favProfit.toFixed(1)} units total (${favRoi.toFixed(1)}% ROI). Longshot won ${longWins} (${((longWins / races) * 100).toFixed(1)}%) with ${longProfit.toFixed(1)} units total (${longRoi.toFixed(1)}% ROI). This model assumes about 16.5% win-pool takeout and accurate crowd prices, so both bets have a long-run expected ROI of about -16.5%. The gap between favorite and longshot in one run is mostly volatility.`;
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
