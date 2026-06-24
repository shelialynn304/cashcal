(function () {
  'use strict';

  const form = document.getElementById('blackjack-rules-form');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  // Approximate rule effects in percentage points, starting from a common 6-deck, 3:2, S17, DAS baseline.
  // Values are educational estimates only; exact edge requires full rules and combinatorial analysis.
  const deckAdjustments = { 1: -0.34, 2: -0.19, 4: -0.03, 6: 0, 8: 0.02 };
  const payoutAdjustments = { '3to2': 0, '6to5': 1.39, '1to1': 2.27 };
  const doubleAdjustments = { any: 0, '9-11': 0.09, '10-11': 0.18, none: 1.48 };

  function numericValue(id) {
    const value = Number($(id).value);
    return Number.isFinite(value) ? value : 0;
  }

  function percent(value) {
    return `${value.toFixed(2)}%`;
  }

  function calculateEdgePercent() {
    let edge = 0.46;
    edge += deckAdjustments[$('rule-decks').value] || 0;
    edge += payoutAdjustments[$('rule-blackjack-payout').value] || 0;
    edge += $('rule-soft-17').value === 'hit' ? 0.20 : 0;
    edge += doubleAdjustments[$('rule-double').value] || 0;
    edge += $('rule-das').value === 'no' ? 0.14 : 0;
    edge += $('rule-surrender').value === 'late' ? -0.08 : 0;
    edge += $('rule-resplit-aces').value === 'yes' ? -0.07 : 0;
    edge += $('rule-peek').value === 'no-peek' ? 0.11 : 0;
    return Math.max(0.05, edge);
  }

  function grade(edge) {
    if (edge < 0.5) return 'Strong table';
    if (edge < 0.8) return 'Playable rules';
    if (edge < 1.5) return 'Costly rules';
    return 'Rough game';
  }

  function bestFix() {
    if ($('rule-blackjack-payout').value !== '3to2') return 'Find a 3:2 blackjack payout.';
    if ($('rule-soft-17').value === 'hit') return 'Prefer dealer stands on soft 17.';
    if ($('rule-double').value !== 'any') return 'Look for doubling on any first two cards.';
    if ($('rule-das').value === 'no') return 'Prefer double after split allowed.';
    if ($('rule-surrender').value === 'none') return 'Late surrender helps when available.';
    return 'Rules are already relatively player-friendly.';
  }

  function pressure(sessionLoss, bankroll) {
    const ratio = bankroll > 0 ? sessionLoss / bankroll : 1;
    if (ratio < 0.03) return 'Low estimated pressure';
    if (ratio < 0.08) return 'Moderate pressure';
    if (ratio < 0.15) return 'High pressure';
    return 'Very high pressure';
  }

  function calculate(event) {
    event.preventDefault();

    const avgBet = numericValue('avg-bet-size');
    const handsPerHour = numericValue('hands-per-hour');
    const sessionHours = numericValue('session-hours');
    const bankroll = numericValue('session-bankroll');

    if (avgBet <= 0 || handsPerHour <= 0 || sessionHours <= 0 || bankroll <= 0) {
      $('rules-edge-message').textContent = 'Enter positive values for bet size, hands per hour, session length, and bankroll.';
      return;
    }

    const edgePercent = calculateEdgePercent();
    const edge = edgePercent / 100;
    const totalHands = handsPerHour * sessionHours;
    const totalAction = avgBet * totalHands;
    const lossPer1000 = 1000 * edge;
    const lossPerHour = avgBet * handsPerHour * edge;
    const sessionLoss = totalAction * edge;
    const rtp = 100 - edgePercent;

    $('result-house-edge').textContent = percent(edgePercent);
    $('result-rtp').textContent = percent(rtp);
    $('result-loss-per-1000').textContent = currency.format(lossPer1000);
    $('result-loss-per-hour').textContent = currency.format(lossPerHour);
    $('result-session-loss').textContent = currency.format(sessionLoss);
    $('result-total-action').textContent = currency.format(totalAction);
    $('result-bankroll-pressure').textContent = pressure(sessionLoss, bankroll);
    $('result-rule-grade').textContent = grade(edgePercent);
    $('result-best-fix').textContent = bestFix();
    $('result-explanation').textContent = `At ${currency.format(avgBet)} per hand for about ${totalHands.toFixed(0)} hands, this rule set estimates ${currency.format(sessionLoss)} in long-run expected loss. Short sessions can win or lose much more than that; the house edge is the average drag, not a prediction.`;
    $('rules-edge-message').textContent = 'Estimate updated. Rule adjustments are approximate and assume basic-strategy play.';
    $('rules-edge-results').dataset.resultReady = 'true';
  }

  form.addEventListener('submit', calculate);
  form.dispatchEvent(new Event('submit', { cancelable: true }));
}());
