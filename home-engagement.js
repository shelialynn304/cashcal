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
      text: "Start here to see how bet size, house edge, and number of wagers affect expected loss and bust risk.",
      href: "blackjack-bankroll-calculator.html",
      cta: "Open Bankroll Calculator"
    },
    blackjack: {
      title: "Blackjack Strategy + Trainer",
      text: "Use the strategy guide for the correct baseline, then practice decisions in the free blackjack trainer.",
      href: "blackjack-game.html",
      cta: "Open Blackjack Trainer"
    },
    roulette: {
      title: "Roulette Odds Tool",
      text: "Compare roulette bets, systems, and bankroll pressure without assuming a progression can beat the wheel.",
      href: "roulette.html",
      cta: "Open Roulette Tool"
    },
    slots: {
      title: "Slot Simulator",
      text: "Use the slot simulator to see how RTP and volatility can still create big drawdowns in short sessions.",
      href: "slots.html",
      cta: "Run Slot Simulator"
    },
    horses: {
      title: "Horse Racing Guide",
      text: "Start with bet types, odds formats, and bankroll basics before comparing risk across win, place, show, and exotic wagers.",
      href: "horse-racing-guide.html",
      cta: "Read Horse Racing Guide"
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
    if (paceOutput) paceOutput.textContent = pressure >= 4 ? "High burn rate" : pressure >= 2 ? "Manageable burn rate" : "Low burn rate";

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
