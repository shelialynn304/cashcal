(function () {
  function permutationsCount(n, r) {
    if (n < r || n <= 0 || r <= 0) return 0;
    let result = 1;
    for (let i = 0; i < r; i += 1) {
      result *= (n - i);
    }
    return result;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  }

  const ticketRules = {
    exacta:     { legs: 2, label: 'Exacta',     formula: 'n \u00d7 (n \u2212 1)' },
    trifecta:   { legs: 3, label: 'Trifecta',   formula: 'n \u00d7 (n \u2212 1) \u00d7 (n \u2212 2)' },
    superfecta: { legs: 4, label: 'Superfecta', formula: 'n \u00d7 (n \u2212 1) \u00d7 (n \u2212 2) \u00d7 (n \u2212 3)' }
  };

  function setupFixedTicketCalculator() {
    const type = ((document.body && document.body.dataset.calcType) || 'exacta').toLowerCase();
    const rule = ticketRules[type] || ticketRules.exacta;

    const ticketBase = document.getElementById('ticketBase');
    const horsesUsed = document.getElementById('horsesUsed');
    const calcButton = document.getElementById('calcTicketBtn');
    const resultEl   = document.getElementById('ticketResult');

    if (!ticketBase || !horsesUsed || !calcButton || !resultEl) return;

    function render() {
      const base    = Number(ticketBase.value);
      const runners = Number(horsesUsed.value);

      if (!Number.isFinite(base) || base <= 0) {
        resultEl.textContent = 'Enter a base bet amount greater than $0 before calculating ticket cost.';
        return;
      }

      if (!Number.isFinite(runners) || runners <= 0 || !Number.isInteger(runners)) {
        resultEl.textContent = 'Enter a positive whole number of horses in the box.';
        return;
      }

      if (runners < rule.legs) {
        resultEl.textContent = `${rule.label} boxes require at least ${rule.legs} horses. Add more horses or choose a smaller exotic bet type.`;
        return;
      }

      const combos     = permutationsCount(runners, rule.legs);
      const ticketCost = combos * base;

      if (!Number.isFinite(combos) || !Number.isFinite(ticketCost) || combos <= 0 || ticketCost < 0) {
        resultEl.textContent = 'This ticket cannot be calculated safely. Check the base bet and horse count.';
        return;
      }

      resultEl.innerHTML = `Estimated ticket cost: <strong>${formatCurrency(ticketCost)}</strong><br>${rule.label} box with ${runners} horses creates ${combos.toLocaleString('en-US')} combinations using ${rule.formula}. Actual payout depends on the final pool, takeout, and how many other winning tickets share the pool.`;
    }

    calcButton.addEventListener('click', render);
    render();
  }

  setupFixedTicketCalculator();
})();
