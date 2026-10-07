(function () {
  const scenarioRows = document.querySelectorAll(".scenario-row");
  const riskOutput = document.getElementById("scenarioRisk");
  const walkOutput = document.getElementById("scenarioWalkAway");
  const paceOutput = document.getElementById("scenarioPace");
  const quickLinks = document.querySelectorAll("[data-tool-tab]");
  const toolCards = document.querySelectorAll("[data-tool-card]");
  const scenarioChoices = document.querySelectorAll("[data-scenario-choice]");
  const mythCards = document.querySelectorAll(".myth-card");
  const strategyAccuracyMetric = document.getElementById("strategyAccuracyMetric");
  const strategyAccuracyHelper = document.getElementById("strategyAccuracyHelper");

  const recommendations = {
    bankroll: {
      title: "Bankroll Calculator",
      text: "Start here to see whether bet size, house edge, and volume are putting too much pressure on your bankroll.",
      href: "blackjack-bankroll-calculator.html",
      cta: "Open Bankroll Calculator"
    },
    blackjack: {
      title: "Blackjack Strategy + Trainer",
      text: "Study the baseline, then train decisions before the dealer trains you with real money.",
      href: "blackjack-game.html",
      cta: "Train Before the Dealer"
    },
    roulette: {
      title: "Roulette Odds Tool",
      text: "Compare roulette bets, systems, and bankroll pressure before a progression starts pretending it found an exit.",
      href: "roulette.html",
      cta: "Interrogate the Wheel"
    },
    slots: {
      title: "Slot Simulator",
      text: "Use the slot simulator to see how RTP and volatility can still ambush a short session.",
      href: "slot-simulator.html",
      cta: "Spin the Simulator"
    },
    horses: {
      title: "Horse Racing Guide",
      text: "Start with bet types, odds formats, and bankroll basics before exotic wagers make simple mistakes costly.",
      href: "horse-racing-guide.html",
      cta: "Read the Horse Racing Guide"
    }
  };

  function getSavedStrategyStats() {
    try {
      return JSON.parse(localStorage.getItem("blackjackTrainerStats") || "{}");
    } catch (error) {
      return {};
    }
  }

  function updateStrategyAccuracyMetric() {
    if (!strategyAccuracyMetric || !strategyAccuracyHelper) return;

    const savedStats = getSavedStrategyStats();
    const correct = Number(savedStats.correct || 0);
    const wrong = Number(savedStats.wrong || 0);
    const total = correct + wrong;

    if (!total) {
      strategyAccuracyMetric.textContent = "—";
      strategyAccuracyHelper.textContent = "Train blackjack hands to build a decision sample.";
      return;
    }

    const accuracy = Math.round((correct / total) * 100);
    strategyAccuracyMetric.textContent = `${accuracy}%`;
    strategyAccuracyHelper.textContent = `Based on ${total} recent training decision${total === 1 ? "" : "s"}.`;
  }

  function evaluateScenario() {
    const bankroll = Number(document.getElementById("scenarioBankroll")?.value || 250);
    const bet = Number(document.getElementById("scenarioBet")?.value || 10);
    const edge = Number(document.getElementById("scenarioEdge")?.value || 1.2);
    const hands = Number(document.getElementById("scenarioHands")?.value || 120);

    const pressure = (bet / bankroll) * 100;
    const bustRisk = 100 * evenMoneyBustProbability(Math.floor(bankroll / bet), hands, 0.5 - edge / 200);
    const walkAway = Math.max(0, bankroll - (hands * bet * (edge / 100)));

    if (riskOutput) riskOutput.textContent = `${bustRisk.toFixed(1)}%`;
    if (walkOutput) walkOutput.textContent = `$${walkAway.toFixed(0)}`;
    if (paceOutput) paceOutput.textContent = pressure >= 4 ? "High burn rate" : pressure >= 2 ? "Manageable, still finite" : "Low burn, still burning";

    scenarioRows.forEach((row) => row.classList.toggle("is-strong", pressure < 3.5 && bustRisk < 40));
  }

  // Exact chance that a player making even-money bets (win or lose one bet,
  // win probability p) can no longer cover a bet within `hands` bets, starting
  // with `units` affordable bets. Tracks the probability of every balance.
  function evenMoneyBustProbability(units, hands, p) {
    if (units <= 0) return 1;
    let dist = new Float64Array(units + hands + 2);
    dist[units] = 1;
    let busted = 0;

    for (let h = 0; h < hands; h++) {
      const next = new Float64Array(dist.length);
      for (let u = 1; u < dist.length - 1; u++) {
        const chance = dist[u];
        if (!chance) continue;
        next[u + 1] += chance * p;
        if (u === 1) busted += chance * (1 - p);
        else next[u - 1] += chance * (1 - p);
      }
      dist = next;
    }

    return busted;
  }

  function activateToolTab(toolName) {
    quickLinks.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.toolTab === toolName);
    });

    toolCards.forEach((card) => {
      const isMatch = card.dataset.toolCard === toolName;
      card.classList.toggle("tool-highlight", isMatch);
      if (isMatch) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function updateScenarioChoice(choice) {
    const recommendation = recommendations[choice];
    const title = document.getElementById("scenarioChoiceTitle");
    const text = document.getElementById("scenarioChoiceText");
    const link = document.getElementById("scenarioChoiceLink");

    if (!recommendation || !title || !text || !link) return;

    scenarioChoices.forEach((button) => {
      button.classList.toggle("active", button.dataset.scenarioChoice === choice);
    });

    title.textContent = recommendation.title;
    text.textContent = recommendation.text;
    link.href = recommendation.href;
    link.textContent = recommendation.cta;
  }

  if (quickLinks.length) {
    quickLinks.forEach((tab) => {
      tab.addEventListener("click", () => activateToolTab(tab.dataset.toolTab));
    });
  }

  if (scenarioChoices.length) {
    scenarioChoices.forEach((button) => {
      button.addEventListener("click", () => updateScenarioChoice(button.dataset.scenarioChoice));
    });
  }

  if (mythCards.length) {
    mythCards.forEach((card) => {
      card.addEventListener("click", () => {
        const isExpanded = card.getAttribute("aria-expanded") === "true";
        card.setAttribute("aria-expanded", String(!isExpanded));
      });
    });
  }

  ["scenarioBankroll", "scenarioBet", "scenarioEdge", "scenarioHands"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", evaluateScenario);
  });

  updateStrategyAccuracyMetric();
  evaluateScenario();
})();
