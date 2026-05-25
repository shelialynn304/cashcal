# Edge Over Luck Tool QA Checklist

Use this checklist for manual QA on calculator and simulator pages before publishing updates. The goal is to keep math accurate, outputs visible, UX mobile-friendly, and copy honest.

## Scope and usage

- Run this checklist after any calculator/simulator logic, layout, copy, or SEO edits.
- Test on both desktop and mobile viewport sizes.
- Record pass/fail notes and screenshots for any failed checks.
- If a check fails, log the exact field values and output shown.

## 1) Calculator/math checks

### A. Formula visibility and assumptions

- [ ] Formula is listed **or** assumptions are clearly explained near inputs/results.
- [ ] Tool language labels models correctly (for example, estimator/simulation when exact solving is not used).
- [ ] Key assumptions are not hidden (ruleset, bet sizing logic, RTP/house edge basis, payout structure, etc.).

### B. Sample test cases

- [ ] At least 2–3 known-value sample inputs are tested.
- [ ] Sample cases include one typical case and one stress/high-variance case.
- [ ] Inputs and observed outputs are documented in QA notes.

### C. Expected output validation

- [ ] Output matches expected math direction and magnitude.
- [ ] Units and labels are correct (%, bankroll, EV, probability, spins/hands/sessions).
- [ ] Theoretical values and simulation values are not mixed or mislabeled.
- [ ] Rounding looks intentional and does not hide major differences.

### D. Edge-case checks

- [ ] Minimum/maximum input boundaries are tested.
- [ ] Empty, zero, negative, and non-numeric input handling is tested.
- [ ] Impossible states are blocked (for example, wager > bankroll when not allowed by tool rules).
- [ ] Tool fails safely with clear feedback instead of silent or misleading output.

## 2) UX checks

- [ ] Result appears near the controls after interaction (no “where did it go?” behavior).
- [ ] Mobile view does not require excessive scrolling to find primary results.
- [ ] Primary action buttons are visible, obvious, and tappable on mobile.
- [ ] Error states are clear, specific, and actionable.
- [ ] Controls do not overlap, clip, or cause horizontal scrolling.
- [ ] Result cards remain readable at small widths.

## 3) SEO checks

- [ ] Page has a unique, descriptive `<title>`.
- [ ] Meta description exists and matches page intent.
- [ ] Canonical URL exists and uses `https://edgeoverluck.com/`.
- [ ] Exactly one clear H1 is present.
- [ ] Internal links to related tools are present and useful.

## 4) Trust checks

- [ ] No claim suggests a betting system can beat house edge long-term.
- [ ] Assumptions and model limits are disclosed in plain language.
- [ ] Copy does not imply guaranteed profit, risk-free outcomes, or prediction certainty.
- [ ] Responsible gambling page is linked where appropriate.
- [ ] Educational framing is preserved (analysis/estimation/simulation, not promises).

## 5) Pages to review first

Prioritize this queue when rolling out QA:

1. `blackjack-bankroll-calculator.html`
2. `blackjack-ev-calculator.html`
3. `blackjack-game.html`
4. `roulette-calculator.html`
5. `roulette-simulator.html`
6. `roulette-strategy-simulator.html`
7. `slot-simulator.html`
8. `bankroll-survival-slots.html`
9. `bubble-craps.html`
10. `horse-racing-guide.html`

## QA log template (copy/paste)

Use this per page so reviews stay repeatable:

```text
Page:
Date:
Reviewer:

Calculator/math checks:
- Formula/assumptions:
- Sample case #1:
- Sample case #2:
- Edge cases tested:

UX checks:
- Result visibility near controls:
- Mobile scroll/tap checks:
- Error-state clarity:

SEO checks:
- Title:
- Meta description:
- Canonical:
- H1:
- Internal links:

Trust checks:
- House-edge claim check:
- Assumption disclosure check:
- Responsible gambling link check:

Overall status: Pass / Needs fixes
Notes:
```
