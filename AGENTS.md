# Edge Over Luck Project Guidelines (AGENTS.md)




## Project Purpose

Edge Over Luck is a gambling math, odds, and casino tool site designed to:

- Attract search traffic through SEO
- Keep users engaged with interactive gambling tools
- Explain real gambling math in a clear, useful way
- Drive clicks to core tools and future affiliate offers

Primary goal:

Turn visitors into tool users first, then eventually affiliate clicks.

---

# Edge Over Luck Agent Instructions

Repository-level instructions for AI agents, Codex, and assistant-driven edits in the Edge Over Luck codebase.

## Purpose

This file defines how AI agents should work inside this repository.

Primary goals:

- Protect working site behavior.
- Keep edits small, specific, and reviewable.
- Preserve the Edge Over Luck brand.
- Prioritize calculator accuracy, honest gambling math, mobile usability, and SEO structure.
- Avoid broad rewrites unless explicitly requested.

This repository powers EdgeOverLuck.com, a static casino math and gambling tools site built with HTML, CSS, and vanilla JavaScript.

--## Repository / Brand Clarification

This repository may be named `CashCal`, but the public-facing website brand is:

**Edge Over Luck**

Public domain:

**edgeoverluck.com**

Important:

- Use **Edge Over Luck** in public-facing copy.
- Use **edgeoverluck.com** for canonical/domain references.-
- Do not replace public branding with `CashCal`.
- `CashCal` is only the internal repository/project name unless specifically requested.

---
## Core Rules

Agents must:

- Inspect relevant files before editing.
- Edit only the files needed for the task.
- Preserve existing behavior unless the task explicitly asks to change it.
- Avoid broad redesigns unless requested.
- Keep changes page-specific when possible.
- Preserve existing IDs, classes, scripts, schema, analytics, canonical URLs, navigation, and footer unless the task specifically involves them.
- Keep the site mobile-friendly and responsive.
- Avoid introducing external frameworks, build systems, or bloated libraries.
- Explain any formula or calculator behavior changes clearly.

Agents must not:

- Rewrite full pages when a targeted edit would solve the issue.
- Remove working features without a clear reason.
- Change unrelated pages “while already there.”
- Add React, Vue, Angular, bundlers, package managers, or heavy dependencies.
- Make gambling tools sound predictive or guaranteed.
- Claim that any betting system beats house edge.
- Hide model assumptions or risk disclaimers.

---

## How to Prompt the Agent

When requesting changes, include:

- The target page, script, or tool.
- The specific issue or improvement.
- Whether the task is focused on math, UX, copy, SEO, style, or code safety.
- Files allowed, when possible.
- What should not change.

Example prompts:

- Audit `blackjack-bankroll-calculator.html` and `blackjack.js` for math accuracy and confusing UX. Do not redesign the page.
- Fix the stretched image on `slot-rtp-explained.html`. Do not change unrelated layout or copy.
- Add clearer internal CTAs to `roulette-calculator.html` while preserving the current brand style, nav, footer, and calculator behavior.
- Review `slot-simulator.js` for edge-case bugs. Do not change RTP formulas unless there is a documented bug.

---

## Standard Safe Task Format

Use this structure for most Codex or agent tasks:

### Safe task template

Read `AGENTS.md` before editing.

Task:
[Describe the specific task.]

Files allowed:
- [file 1]
- [file 2]

Do not edit any other files.

Goal:
[Explain the desired outcome.]

Hard limits:
- Do not rewrite the page.
- Do not change unrelated files.
- Do not remove working features.
- Do not change nav, footer, analytics, schema, or canonical URLs unless requested.
- Preserve existing IDs used by JavaScript.

Required changes:
1. [Specific change]
2. [Specific change]
3. [Specific change]

After editing, report:
- Files changed.
- What changed.
- Whether formulas changed.
- What was intentionally not changed.
- Any tests or checks performed.

---

## Brand and Tone

The brand is Edge Over Luck.

The site should feel:

- Math-first
- Clear
- Confident
- Honest
- Practical
- Beginner-friendly
- Slightly sharp, but not try-hard

Preferred tone:

- Smart Gambling Tools for Real Players
- Play with the numbers before you play with your money.

Avoid:

- Hype
- Fake guru claims
- Guaranteed-profit language
- Overly technical walls of text
- Forced jokes every other sentence
- Cynicism that makes the tools feel pointless

Use dark humor lightly. A sharp line is fine. A page full of jokes is just a clown car with meta tags.

---

## Gambling Math Standards

Accuracy and honesty matter more than polish.

For every calculator, simulator, or gambling math page:

- Explain assumptions clearly.
- Separate theoretical expected value from simulated results.
- Label estimates as estimates.
- Do not imply the tool predicts future outcomes.
- Do not imply a betting system removes house edge.
- Do not imply short-term wins prove a strategy works.
- Do not hide uncertainty or model limits.

Forbidden claims:

- Guaranteed profit
- Beat the casino
- Safe betting system
- Risk-free gambling
- Predict the next result
- Due for a win
- Recover losses safely
- Secret winning method

Preferred language:

- Educational estimate
- Simulation
- Bankroll pressure
- Expected value
- Approximate model
- House edge remains
- Short-term wins can happen
- Long-term math still matters

---

## Calculator and Simulator Rules

### Blackjack

For blackjack tools:

- Do not overclaim exact EV unless the tool is a full solver.
- If the model is simplified, call it an estimator.
- Disclose missing assumptions when relevant:
  - Splits
  - Surrender
  - Insurance
  - Dealer peek
  - Deck composition
  - S17/H17
  - Double-after-split
  - Blackjack payout differences
  - True-count approximation

`blackjack-ev-calculator.html` and `blackjack-ev.js` should be treated as an EV estimator unless a full solver is explicitly built.

### Roulette

For roulette tools:

- European roulette has 37 pockets.
- American roulette has 38 pockets.
- European house edge is about 2.70%.
- American house edge is about 5.26%.
- Standard bet EV should match the wheel house edge.
- Betting systems change volatility and bankroll path, not long-term expected value.

Keep these separate:

- Per-spin win probability
- Payout
- House edge
- Expected value
- Simulated profit chance
- Bust risk
- Average ending bankroll

### Slots

For slot tools:

- RTP is a long-run average, not a session prediction.
- Volatility affects bankroll swings.
- Bonus features are part of RTP, not extra value outside the math.
- Past spins do not affect future spins.
- High-volatility games need enough simulation trials for stable estimates.

Do not imply:

- A machine is due.
- Bonus chasing improves EV.
- RTP predicts tonight’s result.

### Horse Racing

For horse racing tools:

- Odds imply probability.
- Payout size is not the same as value.
- Pari-mutuel takeout matters.
- Picking winners is not enough; price matters.
- Longshots have higher variance.
- Favorites win more often but are not automatically profitable.

Clarify:

- Gross payout
- Net profit
- Returned stake
- Implied probability
- Estimated true probability
- Expected ROI

### Bubble Craps

For craps tools:

- Bet rules must be clear.
- Pass Line and Don’t Pass behavior must be accurate.
- Come-out and point phases must be handled separately.
- Bankroll should not silently go negative.
- Dice sounds should not break roll logic if audio fails.

---

## Code Safety Rules

When editing code:

- Keep JavaScript vanilla.
- Preserve existing HTML IDs used by scripts.
- Guard optional DOM elements with null checks.
- Validate user inputs.
- Do not silently calculate nonsense.
- Avoid clever code in calculator logic.
- Keep functions readable.
- Use comments for math assumptions or fragile behavior.

For simulations:

- Keep random simulation results separate from theoretical EV.
- Use enough trials for stable estimates when practical.
- Avoid fake precision.
- Explain model assumptions near the output.

---

## UX Rules

Tools should be understandable to beginners.

For calculator pages:

- Explain each important input.
- Explain each important output.
- Add helper text under confusing fields.
- Put assumptions near the calculator.
- Keep CTAs specific.
- Make mobile controls easy to tap.
- Prevent result sections from overflowing on mobile.
- Make validation messages clear.

Good CTA examples:

- Run the Bankroll Check
- Compare Roulette Odds
- Test the Strategy
- Practice Blackjack Decisions

Avoid vague CTA text:

- Click Here
- Submit
- Learn More
- Win Smarter

---

## SEO Rules

Important pages should have:

- One clear H1.
- Useful H2 sections.
- Unique `<title>`.
- Clear meta description.
- Canonical URL using `https://edgeoverluck.com/`.
- Internal links to related tools.
- Helpful beginner-friendly copy.
- Alt text for meaningful images.
- FAQ/schema where useful.
- Responsible gambling language where relevant.

Use apex domain canonicals:

- `https://edgeoverluck.com/`

Do not use `www` unless explicitly requested.

---

## Visual and Style Rules

Use existing shared classes and patterns before adding new ones.

Preferred classes/patterns:

- `.container`
- `.section`
- `.section-tight`
- `.card`
- `.glass-card`
- `.glass-panel`
- `.btn`
- `.btn-secondary`
- `.grid`
- `.grid-2`
- `.grid-3`
- `.section-title`
- `.section-subtext`
- `.small-note`
- `.warning-box`
- `.info-box`

Do not create a totally new visual system for one page.

Preferred visual feel:

- Dark background
- Gold accents
- Optional cyan secondary accents
- Glass cards
- Glow gradients
- Clean contrast
- Strong readability
- Subtle motion, not chaos

Avoid:

- Overloaded sections
- Tiny controls
- Stretched images
- Excessive animation
- Autoplay sound
- Third-party assets for core UI
- Malware-banner energy

---

## Supporting Repo Guidance Files

Use these files depending on the task:

- `.agent.md` — short entry point that points agents to the correct repo guidance files. Do not duplicate full instructions there.
- `STYLEGUIDE.md` — brand voice, visual style, copy rules, layout patterns, and UX tone.
- `REVIEW.md` — manual QA checklist and small calculator/simulator test cases.
- `.github/agents/agentsmath.md.agent.md` — gambling math review standards for calculators, simulators, EV, RTP, house edge, bankroll risk, and probability tools.

When a task involves calculator math, odds, RTP, EV, blackjack, roulette, slots, horse racing, craps, or bankroll simulation, read and follow:

- `.github/agents/agentsmath.md.agent.md`
- `REVIEW.md`

When a task involves copy, page wording, visual polish, layout consistency, CTAs, or brand tone, read and follow:

- `STYLEGUIDE.md`
- `AGENTS.md`

When a task involves testing or PR review, read and follow:

- `REVIEW.md`

Do not duplicate the full contents of supporting files inside this file. Each file has one job. This one defines repo-level agent behavior.

---

## Review Checklist

For any change, verify:

- Only necessary files were modified.
- The brand remains Edge Over Luck.
- Existing behavior still works unless intentionally changed.
- The page stays mobile-friendly and responsive.
- No new console errors are introduced.
- Gambling math and assumptions are accurate.
- Page tone is honest and not hype-driven.
- Existing nav/footer still work.
- No unrelated SEO/schema/canonical changes were made.

If formulas changed, report:

Formula changed: yes

Before:
[old formula or behavior]

After:
[new formula or behavior]

Reason:
[why it changed]

If formulas did not change, report:

No formulas changed.

---

## Final Rule

Protect these in order:

1. Mathematical correctness
2. User trust
3. Existing working behavior
4. Mobile usability
5. SEO structure
6. Brand consistency
7. Visual polish

A flashy wrong calculator is worse than a boring correct one. Boring at least has the decency not to lie.
-