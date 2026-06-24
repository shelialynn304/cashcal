(function () {
  "use strict";

  const form = document.getElementById("blackjack-rules-form");
  const message = document.getElementById("rules-edge-message");

  if (!form) return;

  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const percent = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const number = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });

  const BASE_EDGE = 0.0064;

  const RULE_ADJUSTMENTS = {
    decks: {
      "1": -0.0018,
      "2": -0.0012,
      "4": -0.0003,
      "6": 0,
      "8": 0.0002,
    },
    blackjackPayout: {
      "3to2": 0,
      "6to5": 0.014,
      "1to1": 0.023,
    },
    soft17: {
      stand: 0,
      hit: 0.002,
    },
    double: {
      any: 0,
      "9-11": 0.001,
      "10-11": 0.0018,
      none: 0.014,
    },
    das: {
      yes: 0,
      no: 0.0014,
    },
    surrender: {
      none: 0,
      late: -0.0007,
    },
    resplitAces: {
      no: 0,
      yes: -0.0007,
    },
    peek: {
      peek: 0,
      "no-peek": 0.0011,
    },
  };

  function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
  }

  function getNumber(id) {
    const value = Number.parseFloat(getValue(id));
    return Number.isFinite(value) ? value : NaN;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function showMessage(text, isWarning) {
    if (!message) return;

    message.textContent = text;
    message.className = isWarning ? "warning-box" : "info-box";
  }

  function readInputs() {
    return {
      decks: getValue("rule-decks"),
      blackjackPayout: getValue("rule-blackjack-payout"),
      soft17: getValue("rule-soft-17"),
      double: getValue("rule-double"),
      das: getValue("rule-das"),
      surrender: getValue("rule-surrender"),
      resplitAces: getValue("rule-resplit-aces"),
      peek: getValue("rule-peek"),
      avgBetSize: getNumber("avg-bet-size"),
      handsPerHour: getNumber("hands-per-hour"),
      sessionHours: getNumber("session-hours"),
      sessionBankroll: getNumber("session-bankroll"),
    };
  }

  function validateInputs(inputs) {
    if (!Number.isFinite(inputs.avgBetSize) || inputs.avgBetSize <= 0) {
      return "Average bet size must be greater than $0.";
    }

    if (!Number.isFinite(inputs.handsPerHour) || inputs.handsPerHour <= 0) {
      return "Hands per hour must be greater than 0.";
    }

    if (!Number.isFinite(inputs.sessionHours) || inputs.sessionHours <= 0) {
      return "Session hours must be greater than 0.";
    }

    if (!Number.isFinite(inputs.sessionBankroll) || inputs.sessionBankroll <= 0) {
      return "Session bankroll must be greater than $0.";
    }

    return "";
  }

  function addRule(adjustments, label, value) {
    adjustments.push({ label, value });
  }

  function calculateEdge(inputs) {
    const adjustments = [];

    addRule(adjustments, "Deck count", RULE_ADJUSTMENTS.decks[inputs.decks] || 0);
    addRule(adjustments, "Blackjack payout", RULE_ADJUSTMENTS.blackjackPayout[inputs.blackjackPayout] || 0);
    addRule(adjustments, "Soft 17 rule", RULE_ADJUSTMENTS.soft17[inputs.soft17] || 0);
    addRule(adjustments, "Double rule", RULE_ADJUSTMENTS.double[inputs.double] || 0);
    addRule(
      adjustments,
      "Double after split",
      inputs.double === "none" ? 0 : RULE_ADJUSTMENTS.das[inputs.das] || 0
    );
    addRule(adjustments, "Surrender", RULE_ADJUSTMENTS.surrender[inputs.surrender] || 0);
    addRule(adjustments, "Re-split aces", RULE_ADJUSTMENTS.resplitAces[inputs.resplitAces] || 0);
    addRule(adjustments, "Peek rule", RULE_ADJUSTMENTS.peek[inputs.peek] || 0);

    const totalAdjustment = adjustments.reduce((sum, item) => sum + item.value, 0);
    const houseEdge = BASE_EDGE + totalAdjustment;
    const totalHands = inputs.handsPerHour * inputs.sessionHours;
    const totalAction = inputs.avgBetSize * totalHands;
    const expectedLossPerHour = inputs.avgBetSize * inputs.handsPerHour * houseEdge;
    const sessionExpectedLoss = totalAction * houseEdge;
    const bankrollPressure = sessionExpectedLoss / inputs.sessionBankroll;

    return {
      adjustments,
      houseEdge,
      playerRtp: 1 - houseEdge,
      lossPer1000: houseEdge * 1000,
      totalHands,
      totalAction,
      expectedLossPerHour,
      sessionExpectedLoss,
      bankrollPressure,
    };
  }

  function getRuleGrade(edge) {
    if (edge < 0) return "Player-favorable estimate";
    if (edge === 0) return "Break-even estimate";
    if (edge <= 0.004) return "Excellent table";
    if (edge <= 0.0075) return "Good table";
    if (edge <= 0.0125) return "Playable but costly";
    if (edge <= 0.02) return "Bad rules";
    return "Very expensive table";
  }

  function getBestFix(inputs, result) {
    const ranked = result.adjustments
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (!ranked.length) {
      return "Rules are already player-friendly for this approximation.";
    }

    const top = ranked[0];

    if (top.label === "Blackjack payout" && inputs.blackjackPayout !== "3to2") {
      return "Find a 3:2 blackjack table. This is usually the biggest upgrade.";
    }

    if (top.label === "Soft 17 rule") {
      return "Prefer tables where dealer stands on soft 17.";
    }

    if (top.label === "Double rule") {
      return "Prefer tables that allow double on any first two cards.";
    }

    if (top.label === "Double after split") {
      return "Prefer tables that allow double after split.";
    }

    if (top.label === "Peek rule") {
      return "Avoid no-peek rules when extra doubled/split money can be exposed to dealer blackjack.";
    }

    return `Improve: ${top.label}.`;
  }

  function explainInputs(inputs) {
    const payoutText = {
      "3to2": "3:2 blackjack",
      "6to5": "6:5 blackjack",
      "1to1": "even-money blackjack",
    }[inputs.blackjackPayout];

    const soft17Text =
      inputs.soft17 === "hit"
        ? "dealer hits soft 17"
        : "dealer stands on soft 17";

    const dasText =
      inputs.das === "yes"
        ? "DAS allowed"
        : "DAS not allowed";

    const surrenderText =
      inputs.surrender === "late"
        ? "late surrender available"
        : "no surrender";

    return `${inputs.decks}-deck game, ${payoutText}, ${soft17Text}, ${dasText}, ${surrenderText}.`;
  }

  function render(inputs, result) {
    const grade = getRuleGrade(result.houseEdge);
    const bestFix = getBestFix(inputs, result);

    setText("result-house-edge", percent.format(result.houseEdge));
    setText("result-rtp", percent.format(result.playerRtp));
    setText("result-loss-per-1000", money.format(result.lossPer1000));
    setText("result-loss-per-hour", money.format(result.expectedLossPerHour));
    setText("result-session-loss", money.format(result.sessionExpectedLoss));
    setText("result-total-action", money.format(result.totalAction));
    setText("result-bankroll-pressure", percent.format(result.bankrollPressure));
    setText("result-rule-grade", grade);
    setText("result-best-fix", bestFix);

    const expectationText =
      result.sessionExpectedLoss < 0
        ? `an estimated player advantage of ${money.format(
            Math.abs(result.sessionExpectedLoss)
          )}`
        : `an expected loss near ${money.format(result.sessionExpectedLoss)}`;

    setText(
      "result-explanation",
      `${explainInputs(inputs)} Estimated edge is ${percent.format(
        result.houseEdge
      )}. At ${money.format(inputs.avgBetSize)} per hand and ${number.format(
        inputs.handsPerHour
      )} hands/hour, that is about ${money.format(
        result.expectedLossPerHour
      )} expected loss per hour. Over ${
        inputs.sessionHours
      } hours, total action is about ${money.format(
        result.totalAction
      )} with ${expectationText}.`
    );

    if (result.houseEdge >= 0.02) {
      showMessage(
        "Warning: these rules are expensive. The table is likely doing more damage than variance alone.",
        true
      );
      return;
    }

    if (result.houseEdge >= 0.0125) {
      showMessage(
        "These rules look costly. Check payout and soft-17 rules before playing.",
        true
      );
      return;
    }

    showMessage(
      "Approximate rule scan complete. Still use basic strategy and bankroll limits.",
      false
    );
  }

  function runCalculator() {
    const inputs = readInputs();
    const error = validateInputs(inputs);

    if (error) {
      showMessage(error, true);
      return;
    }

    const result = calculateEdge(inputs);
    render(inputs, result);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    runCalculator();
  });

  form.addEventListener("input", runCalculator);

  runCalculator();
})();
