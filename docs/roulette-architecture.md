# Roulette Script Architecture

## Current script responsibilities

- `js/roulette.js`
  - Powers the standalone roulette simulator page runtime (`roulette-simulator.html`).
  - Owns interactive table behavior, active bet handling, bankroll state, wheel rendering, spin animation timing, result resolution, and optional sound controls/effects.
  - Uses page-specific DOM IDs and UI flow; this file is high-risk to refactor broadly.

- `roulette.js`
  - Powers roulette widgets on `roulette.html` (guide page), including odds summary rendering, session simulation snippets, single-spin demo output, strategy comparison cards, and risk estimator outputs.
  - Contains its own local constants and simulation helpers for those guide-page modules.

- `roulette-shared.js`
  - Defines shared pure helpers under `window.RouletteMath`.
  - Current shared scope includes bet metadata, wheel config, clamp/format helpers, spin math (`calculateSpinMath`), and `randomSpinWin`.
  - Used by `roulette-hub.js`, `roulette-calculator.js`, and `roulette-strategy-simulator.js`.

- `roulette-hub.js`
  - Page module for `roulette.html` that drives quick comparison widgets and risk-style recommendation UI.
  - Consumes `window.RouletteMath` for win probability/EV/house-edge display.

- `roulette-calculator.js`
  - Powers `roulette-calculator.html` inputs/results, Monte Carlo session estimates, and learning widgets.
  - Consumes shared helpers from `window.RouletteMath` and adds calculator-specific UI/result copy.

- `roulette-strategy-simulator.js`
  - Powers `roulette-strategy-simulator.html` strategy comparison and bankroll-drain demos.
  - Uses `window.RouletteMath` for wheel math and randomness, while keeping strategy progression/session orchestration local.

## Known duplication risks

- Duplicated red number sets exist in multiple roulette scripts.
- Duplicated wheel configuration/constants (pocket counts, house edge values) exist across files.
- Duplicated win probability logic exists both in local modules and shared math patterns.
- Duplicated strategy progression logic (flat/martingale/fibonacci/dalembert) appears in more than one file.
- Bet-key naming mismatch risk exists between variants such as:
  - `redblack` vs `evenMoney`
  - `dozens` vs `dozen`
- Simulator payout hardcoding risk exists in `js/roulette.js` if simulator bet types expand later without central payout metadata.

## Safe shared-helper candidates

The following are good candidates for **pure helper** extraction or normalization in `roulette-shared.js`:

- Red/black lookup helper.
- Wheel sequence/constants (European/American number order and/or canonical wheel metadata).
- Bet-key alias normalization (map legacy and current key variants to one canonical key).
- Payout metadata lookup (single source for payout values by bet key/type).
- Pure strategy step helpers for:
  - flat
  - martingale
  - fibonacci
  - dalembert

## Do not move into shared helpers

Keep these concerns page-local (especially in simulator runtime files):

- DOM updates.
- Wheel SVG rendering.
- Spin animation.
- Audio controls/sfx behavior.
- Simulator bankroll state storage and mutation.
- Event listeners and interaction wiring.
- Page-specific UI copy and explanation text.

## Recommended PR sequence

1. **PR 1: documentation only**
   - Add/confirm architecture notes and risk boundaries before any refactor.

2. **PR 2: add pure helpers to `roulette-shared.js` without wiring changes**
   - Introduce helper exports only.
   - No runtime behavior changes.

3. **PR 3: migrate root `roulette.js` to consume shared helpers**
   - Replace duplicated constants/math with shared helper calls while preserving current outputs.

4. **PR 4: migrate `roulette-strategy-simulator.js` progression math**
   - Adopt shared pure strategy-step helpers and verify parity.

5. **PR 5: optionally adopt safe helpers in `js/roulette.js` only for constants/color/payout lookup**
   - Keep simulator DOM/animation/audio/state logic local.

6. **PR 6: remove dead duplicated constants after parity checks**
   - Delete only after before/after output comparison confirms no behavior drift.

## Verification checklist

- Run site audit.
- Manually test `roulette.html`.
- Manually test `roulette-calculator.html`.
- Manually test `roulette-strategy-simulator.html`.
- Manually test `roulette-simulator.html`.
- Confirm outputs are unchanged before/after helper migration.
- Confirm simulator spin animation/audio still works.
