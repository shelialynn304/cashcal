(function () {
  const form = document.querySelector("#bonus-form");
  const results = document.querySelector("#bonus-results");
  const message = document.querySelector("#bonus-message");

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

  const number = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  function getNumber(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`Missing calculator input: ${id}`);
      return 0;
    }
    const value = Number(el.value);
    return Number.isFinite(value) ? value : 0;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showError(text) {
    if (!message) return;
    message.textContent = text;
    message.className = "warning-box";
  }

  function showNote(text, isWarning = false) {
    if (!message) return;
    message.textContent = text;
    message.className = isWarning ? "warning-box" : "info-box";
  }

  function calculateBonusRealityCheck() {
    const depositAmount = getNumber("deposit-amount");
    const bonusMatchPercent = getNumber("bonus-match-percent");
    const maxBonusAmount = getNumber("max-bonus-amount");
    const wageringMultiplier = getNumber("wagering-multiplier");
    const contributionPercent = getNumber("game-contribution");
    const rtpPercent = getNumber("game-rtp");
    const averageBetSize = getNumber("average-bet-size");
    const maxCashout = getNumber("max-cashout");
    const fees = getNumber("fees");
    const timeLimitHours = getNumber("time-limit-hours");

    const wageringAppliesTo = document.querySelector(
      'input[name="wagering-base"]:checked'
    )?.value || "bonus";

    if (depositAmount < 0) return showError("Deposit amount cannot be negative.");
    if (bonusMatchPercent < 0) return showError("Bonus match cannot be negative.");
    if (maxBonusAmount < 0) return showError("Max bonus amount cannot be negative.");
    if (wageringMultiplier < 0) return showError("Wagering multiplier cannot be negative.");
    if (contributionPercent <= 0 || contributionPercent > 100) return showError("Game contribution must be greater than 0% and no more than 100%.");
    if (rtpPercent < 0 || rtpPercent > 100) return showError("RTP must be between 0% and 100%.");
    if (averageBetSize < 0) return showError("Average bet size cannot be negative.");
    if (maxCashout < 0) return showError("Max cashout cannot be negative.");
    if (fees < 0) return showError("Optional fees cannot be negative.");
    if (timeLimitHours < 0) return showError("Time limit cannot be negative.");

    const bonusAmount = Math.min(
      (depositAmount * bonusMatchPercent) / 100,
      maxBonusAmount
    );
    const startingBalance = depositAmount + bonusAmount;
    const wageringBase =
      wageringAppliesTo === "deposit-plus-bonus"
        ? depositAmount + bonusAmount
        : bonusAmount;
    const rawWageringRequired = wageringBase * wageringMultiplier;
    const adjustedWageringRequired =
      rawWageringRequired / (contributionPercent / 100);
    const houseEdge = 1 - rtpPercent / 100;
    const estimatedExpectedLoss = adjustedWageringRequired * houseEdge;
    const estimatedNumberOfBets =
      averageBetSize > 0
        ? Math.ceil(adjustedWageringRequired / averageBetSize)
        : 0;
    const uncappedTheoreticalBonusValue =
      bonusAmount - estimatedExpectedLoss;

    let theoreticalBonusValue = uncappedTheoreticalBonusValue;
    let cashoutLimitedProfit = null;
    let cashoutText = "No max cashout cap entered.";
    let restrictiveCashout = false;

    if (maxCashout > 0) {
      cashoutLimitedProfit = maxCashout - depositAmount;
      theoreticalBonusValue = Math.min(
        uncappedTheoreticalBonusValue,
        cashoutLimitedProfit
      );
      restrictiveCashout = cashoutLimitedProfit < uncappedTheoreticalBonusValue;
      cashoutText = `Assumption used: max cashout is a total withdrawal cap of ${money.format(maxCashout)}. Profit above deposit is capped at ${money.format(cashoutLimitedProfit)} (max cashout - deposit).`;
    }

    const netTheoreticalValue = theoreticalBonusValue - fees;
    const baseLabel =
      wageringAppliesTo === "deposit-plus-bonus"
        ? "deposit + bonus"
        : "bonus only";

    setText("result-bonus-amount", money.format(bonusAmount));
    setText("result-starting-balance", money.format(startingBalance));
    setText("result-wagering-base", money.format(wageringBase));
    setText("result-raw-wagering", money.format(rawWageringRequired));
    setText(
      "result-adjusted-wagering",
      money.format(adjustedWageringRequired)
    );
    setText("result-bets-count", number.format(estimatedNumberOfBets));
    setText("result-house-edge", pct.format(houseEdge));
    setText("result-expected-loss", money.format(estimatedExpectedLoss));
    setText(
      "result-uncapped-value",
      money.format(uncappedTheoreticalBonusValue)
    );
    setText("result-theoretical-value", money.format(theoreticalBonusValue));
    setText("result-net-value", money.format(netTheoreticalValue));
    setText("result-cashout-note", cashoutText);

    const explanation = document.getElementById("result-explanation");
    if (explanation) {
      const betsText =
        averageBetSize > 0
          ? `At ${money.format(averageBetSize)} average bet size, that is at least ${number.format(estimatedNumberOfBets)} bets/spins.`
          : "Enter an average bet size above $0 to estimate bets/spins needed.";
      const cashoutExplain =
        maxCashout > 0
          ? `With max cashout set, displayed theoretical value is capped by max cashout - deposit (${money.format(cashoutLimitedProfit)}).`
          : "No max cashout cap was applied.";
      const feesExplain =
        fees > 0
          ? `Optional fees of ${money.format(fees)} are subtracted to show net theoretical value.`
          : "No optional fees were entered.";
      const timeText =
        timeLimitHours > 0
          ? `A ${number.format(timeLimitHours)}-hour time limit was entered; compare it with required wagering pace.`
          : "No time limit was entered.";

      explanation.textContent = `You deposit ${money.format(depositAmount)}. With a ${pct.format(
        bonusMatchPercent / 100
      )} match and ${money.format(maxBonusAmount)} max bonus, the calculated bonus is ${money.format(
        bonusAmount
      )}, so starting balance is ${money.format(
        startingBalance
      )}. Wagering applies to ${baseLabel}, giving a wagering base of ${money.format(
        wageringBase
      )}. You must wager ${money.format(
        rawWageringRequired
      )} before terms clear, and ${money.format(
        adjustedWageringRequired
      )} after ${pct.format(contributionPercent / 100)} game contribution. ${betsText} At ${pct.format(
        rtpPercent / 100
      )} RTP (house edge ${pct.format(
        houseEdge
      )}), estimated expected loss is ${money.format(
        estimatedExpectedLoss
      )}. Uncapped theoretical bonus value is ${money.format(
        uncappedTheoreticalBonusValue
      )}. ${cashoutExplain} ${feesExplain} ${timeText} These are theoretical estimates only, not guaranteed profit, and this calculator does not predict wins.`;
    }

    if (netTheoreticalValue < 0 || restrictiveCashout) {
      showNote(
        "Warning: this offer looks restrictive or negative after wagering pressure, cap rules, and fees.",
        true
      );
    } else if (Math.abs(netTheoreticalValue) <= 0.01) {
      showNote(
        "This offer looks roughly break-even on paper before real-session variance and hidden terms."
      );
    } else {
      showNote(
        "This offer may look positive on paper, but variance and bonus terms can still reduce real outcomes."
      );
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculateBonusRealityCheck();
  });

  form.addEventListener("input", calculateBonusRealityCheck);
  calculateBonusRealityCheck();
})();
