(() => {
  const CURRENCY_FORMAT = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  });

  const WHOLE_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  });

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("bonusCalcForm");
    const results = document.getElementById("bonusCalcResults");
    const errorBox = document.getElementById("bonusCalcError");
    const warningBox = document.getElementById("bonusCalcWarnings");

    if (!form || !results || !errorBox || !warningBox) {
      return;
    }

    const output = {
      bonusAmount: document.getElementById("resultBonusAmount"),
      startingBalance: document.getElementById("resultStartingBalance"),
      rawWagering: document.getElementById("resultRawWagering"),
      adjustedWagering: document.getElementById("resultAdjustedWagering"),
      expectedLoss: document.getElementById("resultExpectedLoss"),
      numberOfBets: document.getElementById("resultNumberOfBets"),
      theoreticalValue: document.getElementById("resultTheoreticalValue"),
      riskRating: document.getElementById("resultRiskRating"),
      riskSummary: document.getElementById("resultRiskSummary")
    };

    const hasAllOutputs = Object.values(output).every(Boolean);
    if (!hasAllOutputs) {
      return;
    }

    function parseOptionalNumber(value) {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    function getInputValues() {
      return {
        depositAmount: Number.parseFloat(form.depositAmount.value),
        bonusMatchPercent: Number.parseFloat(form.bonusMatchPercent.value),
        maxBonusAmount: Number.parseFloat(form.maxBonusAmount.value),
        wageringMultiplier: Number.parseFloat(form.wageringMultiplier.value),
        wageringAppliesTo: form.wageringAppliesTo.value,
        gameContributionPercent: Number.parseFloat(form.gameContributionPercent.value),
        rtpPercent: Number.parseFloat(form.rtpPercent.value),
        averageBetSize: parseOptionalNumber(form.averageBetSize.value),
        maxCashout: parseOptionalNumber(form.maxCashout.value),
        timeLimitDays: parseOptionalNumber(form.timeLimitDays.value)
      };
    }

    function validateInputs(values) {
      if (!Number.isFinite(values.depositAmount) || values.depositAmount < 0) {
        return "Deposit amount must be 0 or greater.";
      }

      if (!Number.isFinite(values.bonusMatchPercent) || values.bonusMatchPercent < 0) {
        return "Bonus match percentage must be 0 or greater.";
      }

      if (!Number.isFinite(values.maxBonusAmount) || values.maxBonusAmount < 0) {
        return "Maximum bonus amount must be 0 or greater.";
      }

      if (!Number.isFinite(values.wageringMultiplier) || values.wageringMultiplier < 0) {
        return "Wagering requirement multiplier must be 0 or greater.";
      }

      if (!Number.isFinite(values.gameContributionPercent) || values.gameContributionPercent <= 0 || values.gameContributionPercent > 100) {
        return "Game contribution must be more than 0% and no higher than 100%.";
      }

      if (!Number.isFinite(values.rtpPercent) || values.rtpPercent < 0 || values.rtpPercent > 100) {
        return "RTP must be between 0% and 100%.";
      }

      if (values.averageBetSize !== null && values.averageBetSize < 0) {
        return "Average bet size cannot be negative.";
      }

      if (values.maxCashout !== null && values.maxCashout < 0) {
        return "Max cashout cannot be negative.";
      }

      if (values.timeLimitDays !== null && values.timeLimitDays < 0) {
        return "Time limit in days cannot be negative.";
      }

      if (values.wageringAppliesTo !== "bonus-only" && values.wageringAppliesTo !== "deposit-plus-bonus") {
        return "Choose a valid wagering base option.";
      }

      return "";
    }

    function calculateBonusMath(values) {
      const bonusAmount = Math.min((values.depositAmount * values.bonusMatchPercent) / 100, values.maxBonusAmount);
      const startingBalance = values.depositAmount + bonusAmount;
      const wageringBase = values.wageringAppliesTo === "bonus-only" ? bonusAmount : startingBalance;
      const rawWageringRequired = wageringBase * values.wageringMultiplier;
      const adjustedWageringRequired = rawWageringRequired / (values.gameContributionPercent / 100);
      const houseEdge = 1 - values.rtpPercent / 100;
      const estimatedExpectedLoss = adjustedWageringRequired * houseEdge;
      const estimatedNumberOfBets = values.averageBetSize && values.averageBetSize > 0
        ? adjustedWageringRequired / values.averageBetSize
        : null;
      const theoreticalBonusValue = bonusAmount - estimatedExpectedLoss;

      return {
        bonusAmount,
        startingBalance,
        wageringBase,
        rawWageringRequired,
        adjustedWageringRequired,
        houseEdge,
        estimatedExpectedLoss,
        estimatedNumberOfBets,
        theoreticalBonusValue
      };
    }

    function isMaxCashoutRestrictive(maxCashout, adjustedWageringRequired, startingBalance) {
      if (!Number.isFinite(maxCashout) || maxCashout <= 0) {
        return false;
      }

      const cashoutToWagerRatio = maxCashout / Math.max(adjustedWageringRequired, 1);
      return maxCashout <= startingBalance || cashoutToWagerRatio < 0.1;
    }

    function getRiskRating(values, result) {
      const restrictiveCashout = isMaxCashoutRestrictive(values.maxCashout, result.adjustedWageringRequired, result.startingBalance);
      const stronglyNegative = result.theoreticalBonusValue <= -Math.max(50, result.bonusAmount * 0.5);
      const veryLowContribution = values.gameContributionPercent <= 30;

      if (stronglyNegative || values.wageringMultiplier > 50 || veryLowContribution || restrictiveCashout) {
        return {
          label: "Dumpster Fire",
          summary: "Math warning: this setup is heavily stacked against the player before variance even gets involved."
        };
      }

      if (result.theoreticalBonusValue < 0 || values.wageringMultiplier > 35) {
        return {
          label: "Ugly",
          summary: "Theoretical value is negative or wagering is very high, so this bonus likely costs more than it gives."
        };
      }

      if (result.theoreticalBonusValue > 0 && values.wageringMultiplier <= 20 && values.gameContributionPercent === 100) {
        return {
          label: "Fair",
          summary: "This setup is cleaner than most: positive theoretical value with moderate wagering and full game contribution."
        };
      }

      return {
        label: "Risky",
        summary: "Theoretical value may be positive, but high wagering or reduced contribution increases bankroll pressure."
      };
    }

    function formatMoney(value) {
      return CURRENCY_FORMAT.format(value);
    }

    function formatWhole(value) {
      return WHOLE_NUMBER_FORMAT.format(value);
    }

    function formatNumber(value) {
      return NUMBER_FORMAT.format(value);
    }

    function showError(message) {
      errorBox.textContent = message;
      results.hidden = true;
    }

    function clearMessages() {
      errorBox.textContent = "";
      warningBox.textContent = "";
      warningBox.hidden = true;
    }

    function renderWarnings(values, result) {
      const warnings = [];

      if (!values.averageBetSize || values.averageBetSize <= 0) {
        warnings.push("Average bet size must be above 0 to estimate number of bets/spins.");
      }

      if (isMaxCashoutRestrictive(values.maxCashout, result.adjustedWageringRequired, result.startingBalance)) {
        warnings.push("Max cashout looks restrictive versus the required wagering. You could clear wagering and still be capped hard.");
      }

      if (Number.isFinite(values.timeLimitDays) && values.timeLimitDays > 0 && Number.isFinite(result.estimatedNumberOfBets)) {
        const betsPerDay = result.estimatedNumberOfBets / values.timeLimitDays;
        if (betsPerDay > 1000) {
          warnings.push(`Time pressure warning: this setup needs about ${formatWhole(betsPerDay)} bets/spins per day to clear in time.`);
        }
      }

      if (warnings.length === 0) {
        warningBox.textContent = "";
        warningBox.hidden = true;
        return;
      }

      warningBox.innerHTML = `<ul>${warnings.map((warning) => `<li>${warning}</li>`).join("")}</ul>`;
      warningBox.hidden = false;
    }

    function render(values, result) {
      const risk = getRiskRating(values, result);

      output.bonusAmount.textContent = formatMoney(result.bonusAmount);
      output.startingBalance.textContent = formatMoney(result.startingBalance);
      output.rawWagering.textContent = formatMoney(result.rawWageringRequired);
      output.adjustedWagering.textContent = formatMoney(result.adjustedWageringRequired);
      output.expectedLoss.textContent = formatMoney(result.estimatedExpectedLoss);
      output.numberOfBets.textContent = Number.isFinite(result.estimatedNumberOfBets)
        ? `${formatWhole(result.estimatedNumberOfBets)} bets/spins`
        : "Enter average bet > 0";
      output.theoreticalValue.textContent = formatMoney(result.theoreticalBonusValue);
      output.riskRating.textContent = risk.label;
      output.riskRating.dataset.riskLevel = risk.label.toLowerCase().replace(/\s+/g, "-");
      output.riskSummary.textContent = `${risk.summary} Expected loss is theoretical, not predictive.`;

      renderWarnings(values, result);
      results.hidden = false;
    }

    function handleCalculate(event) {
      if (event) {
        event.preventDefault();
      }

      clearMessages();
      const values = getInputValues();
      const validationMessage = validateInputs(values);

      if (validationMessage) {
        showError(validationMessage);
        return;
      }

      const result = calculateBonusMath(values);
      render(values, result);
    }

    function assertClose(actual, expected, tolerance = 0.0001, label = "value") {
      if (Math.abs(actual - expected) > tolerance) {
        console.warn(`${label} mismatch: expected ${expected}, got ${actual}`);
      }
    }

    function runSanityChecks() {
      const testCaseOne = calculateBonusMath({
        depositAmount: 100,
        bonusMatchPercent: 100,
        maxBonusAmount: 100,
        wageringMultiplier: 30,
        wageringAppliesTo: "bonus-only",
        gameContributionPercent: 100,
        rtpPercent: 96,
        averageBetSize: 1,
        maxCashout: null,
        timeLimitDays: null
      });

      assertClose(testCaseOne.bonusAmount, 100, 0.0001, "Test 1 bonus amount");
      assertClose(testCaseOne.startingBalance, 200, 0.0001, "Test 1 starting balance");
      assertClose(testCaseOne.rawWageringRequired, 3000, 0.0001, "Test 1 raw wagering");
      assertClose(testCaseOne.adjustedWageringRequired, 3000, 0.0001, "Test 1 adjusted wagering");
      assertClose(testCaseOne.estimatedExpectedLoss, 120, 0.0001, "Test 1 expected loss");
      assertClose(testCaseOne.estimatedNumberOfBets || 0, 3000, 0.0001, "Test 1 number of bets");
      assertClose(testCaseOne.theoreticalBonusValue, -20, 0.0001, "Test 1 theoretical bonus value");

      const testCaseTwo = calculateBonusMath({
        depositAmount: 100,
        bonusMatchPercent: 100,
        maxBonusAmount: 100,
        wageringMultiplier: 30,
        wageringAppliesTo: "deposit-plus-bonus",
        gameContributionPercent: 100,
        rtpPercent: 96,
        averageBetSize: 1,
        maxCashout: null,
        timeLimitDays: null
      });

      assertClose(testCaseTwo.rawWageringRequired, 6000, 0.0001, "Test 2 raw wagering");
      assertClose(testCaseTwo.adjustedWageringRequired, 6000, 0.0001, "Test 2 adjusted wagering");
      assertClose(testCaseTwo.estimatedExpectedLoss, 240, 0.0001, "Test 2 expected loss");
      assertClose(testCaseTwo.theoreticalBonusValue, -140, 0.0001, "Test 2 theoretical bonus value");
    }

    form.addEventListener("submit", handleCalculate);
    form.addEventListener("input", () => {
      if (results.hidden) {
        return;
      }
      handleCalculate();
    });

    runSanityChecks();
    handleCalculate();

    const debugRtp = formatNumber((1 - calculateBonusMath({
      depositAmount: 100,
      bonusMatchPercent: 100,
      maxBonusAmount: 100,
      wageringMultiplier: 30,
      wageringAppliesTo: "bonus-only",
      gameContributionPercent: 100,
      rtpPercent: 96,
      averageBetSize: 1,
      maxCashout: null,
      timeLimitDays: null
    }).houseEdge) * 100);

    if (!debugRtp) {
      console.warn("RTP formatting failed.");
    }
  });
})();
