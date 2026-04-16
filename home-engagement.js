(function () {
  const scenarioRows = document.querySelectorAll(".scenario-row");
  const riskOutput = document.getElementById("scenarioRisk");
  const walkOutput = document.getElementById("scenarioWalkAway");
  const paceOutput = document.getElementById("scenarioPace");
  const quickLinks = document.querySelectorAll("[data-tool-tab]");
  const toolCards = document.querySelectorAll("[data-tool-card]");

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

  if (quickLinks.length) {
    quickLinks.forEach((tab) => {
      tab.addEventListener("click", () => activateToolTab(tab.dataset.toolTab));
    });
  }

  ["scenarioBankroll", "scenarioBet", "scenarioEdge", "scenarioHands"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", evaluateScenario);
  });

  evaluateScenario();
})();
