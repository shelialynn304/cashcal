(function () {
  const scenarioRows = document.querySelectorAll(".scenario-row");
  const riskOutput = document.getElementById("scenarioRisk");
  const walkOutput = document.getElementById("scenarioWalkAway");
  const paceOutput = document.getElementById("scenarioPace");
  const quickLinks = document.querySelectorAll("[data-tool-tab]");
  const toolCards = document.querySelectorAll("[data-tool-card]");
  const scenarioChoices = document.querySelectorAll("[data-scenario-choice]");
  const mythCards = document.querySelectorAll(".myth-card");

  const recommendations = {
    bankroll: {
      title: "Bankroll Calculator",
      text: "Start here to see whether bet size, house edge, and volume are quietly loading the trapdoor.",
      href: "blackjack-bankroll-calculator.html",
      cta: "Open the Damage Gauge"
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
      href: "slots.html",
      cta: "Spin the Simulator"
    },
    horses: {
      title: "Horse Racing Guide",
      text: "Start with bet types, odds formats, and bankroll basics before exotic wagers make simple mistakes expensive.",
      href: "horse-racing-guide.html",
      cta: "Read the Horse Racing Guide"
    }
  };

  function evaluateScenario() {
    const bankroll = Number(document.getElementById("scenarioBankroll")?.value || 250);
    const bet = Number(document.getElementById("scenarioBet")?.value || 10);
    const edge = Number(document.getElementById("scenarioEdge")?.value || 1.2);
    const hands = Number(document.getElementById("scenarioHands")?.value || 120);

    const pressure = (bet / bankroll) * 100;
    const adjustedRisk = Math.max(1, Math.min(99, (pressure * 5.6) + (edge * 3.2) + (hands / 32)));
    const walkAway = Math.max(0, bankroll - (hands * bet * (edge / 100)));

    if (riskOutput) riskOutput.textContent = `${adjustedRisk.toFixed(1)}%`;
    if (walkOutput) walkOutput.textContent = `$${walkAway.toFixed(0)}`;
    if (paceOutput) paceOutput.textContent = pressure >= 4 ? "High burn rate" : pressure >= 2 ? "Manageable, not immortal" : "Low burn, still burning";

    scenarioRows.forEach((row) => row.classList.toggle("is-strong", pressure < 3.5 && adjustedRisk < 40));
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

  evaluateScenario();
})();
