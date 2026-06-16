(function () {
  const form = document.querySelector("#bonus-ev-form");
  const results = document.querySelector("#bonus-ev-results");
  const message = document.querySelector("#bonus-ev-message");

  if (!form || !results) return;

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const pct = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  });

  function getNumber(id) {
    const el = document.getElementById(id);
    const value = Number(el.value);
    return Number.isFinite(value) ? value : 0;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showError(text) {
    if (message) {
      message.textContent = text;
      message.className = "calculator-message error";
    }
  }

  function showNote(text, type = "neutral") {
    if (message) {
      message.textContent = text;
      message.className = `calculator-message ${type}`;
    }
  }

  function calculateBonusEV() {
    const bonusAmount = getNumber("bonus-amount");
    const depositAmount = getNumber("deposit-amount");
    const wageringMultiplier = getNumber("wagering-multiplier");
    const contributionPercent = getNumber("game-contribution");
    const rtpPercent = getNumber("game-rtp");
    const maxCashout = getNumber("max-cashout");
    const extraCosts = getNumber("extra-costs");

    const wageringAppliesTo = document.querySelector(
      'input[name="wagering-base"]:checked'
    )?.value || "bonus";

    if (bonusAmount <= 0) {
      showError("Enter a bonus amount greater than $0.");
      return;
    }

    if (wageringMultiplier <= 0) {
      showError("Enter a wagering requirement greater than 0x.");
      return;
    }

    if (contributionPercent <= 0 || contributionPercent > 100) {
      showError("Game contribution must be between 1% and 100%.");
      return;
    }

    if (rtpPercent <= 0 || rtpPercent >= 100) {
      showError("RTP should be greater than 0% and less than 100%.");
      return;
    }

    const bonusBase =
      wageringAppliesTo === "deposit-plus-bonus"
        ? depositAmount + bonusAmount
        : bonusAmount;

    const gameContributionDecimal = contributionPercent / 100;
    const rtpDecimal = rtpPercent / 100;
    const houseEdge = 1 - rtpDecimal;

    const totalWagering = bonusBase * wageringMultiplier;
    const adjustedWagering = totalWagering / gameContributionDecimal;
    const expectedLoss = adjustedWagering * houseEdge;
    // A max cashout cap limits the bonus upside before the EV verdict is classified.
    const cappedBonusValue =
      maxCashout > 0 ? Math.min(bonusAmount, maxCashout) : bonusAmount;
    const grossEV = cappedBonusValue - expectedLoss;
    const netEV = grossEV - extraCosts;

    setText("result-bonus-base", money.format(bonusBase));
    setText("result-total-wagering", money.format(totalWagering));
    setText("result-adjusted-wagering", money.format(adjustedWagering));
    setText("result-house-edge", pct.format(houseEdge));
    setText("result-expected-loss", money.format(expectedLoss));
    setText("result-gross-ev", money.format(grossEV));
    setText("result-net-ev", money.format(netEV));

    const cashoutWarning = document.getElementById("result-cashout-warning");

    if (cashoutWarning) {
      cashoutWarning.textContent =
        maxCashout > 0
          ? `Max cashout is set to ${money.format(maxCashout)}. The EV estimate and verdict cap the bonus upside at ${money.format(cappedBonusValue)} before subtracting expected loss and fees.`
          : "No max cashout entered. Still check withdrawal limits, max bet rules, and excluded games.";
    }

    if (netEV > 0.01) {
      showNote(
        "This bonus may be positive EV on paper after the entered cashout cap, but variance, bet caps, game exclusions, and withdrawal rules can still wreck it.",
        "positive"
      );
    } else if (Math.abs(netEV) <= 0.01) {
      showNote(
        "This bonus is roughly break-even before variance and fine print.",
        "neutral"
      );
    } else {
      showNote(
        "This bonus appears negative EV. The wagering requirement is probably eating the bonus alive.",
        "negative"
      );
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculateBonusEV();
  });

  form.addEventListener("input", calculateBonusEV);
})();
