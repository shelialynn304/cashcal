# Edge Over Luck Project Guidelines (AGENTS.md)

## Repository / Brand Clarification

This repository may be named `CashCal`, but the public-facing website brand is:

**Edge Over Luck**

Public domain:

**edgeoverluck.com**

Important:

- Use **Edge Over Luck** in public-facing copy.
- Use **edgeoverluck.com** for canonical/domain references.
- Do not replace public branding with `CashCal`.
- `CashCal` is only the internal repository/project name unless specifically requested.

---

## Project Purpose

Edge Over Luck is a gambling math, odds, and casino tool site designed to:

- Attract search traffic through SEO
- Keep users engaged with interactive gambling tools
- Explain real gambling math in a clear, useful way
- Drive clicks to core tools and future affiliate offers

Primary goal:

Turn visitors into tool users first, then eventually affiliate clicks.

---

## Brand Positioning

Edge Over Luck should feel like:

- Smart gambling tools for real players
- Real math, real odds, clear explanations
- Dark casino atmosphere without looking cheap or spammy
- Confident, useful, slightly sharp-edged
- A site that helps players understand risk before variance eats their lunch

Avoid:

- Generic casino hype
- Fake guarantees
- Spammy affiliate language
- Vague motivational copy
- Overdone jokes that make the site feel unserious
- Anything that sounds like a sketchy bonus-chasing casino ad

---

## Tech Stack

- HTML
- CSS using shared `style.css`
- Vanilla JavaScript

No frameworks.

Keep the site lightweight, fast, and easy to maintain.

---

## Core Rules: Do Not Break

1. Do not redesign pages from scratch unless explicitly told.
2. Reuse existing `style.css` classes whenever possible.
3. Maintain consistent layout across all pages.
4. Do not add heavy libraries or frameworks.
5. Keep code clean, readable, and fast.
6. Do not remove working features unless fixing a confirmed bug.
7. Do not rewrite unrelated files.
8. Do not make broad refactors unless explicitly requested.
9. Do not change game rules, math logic, betting logic, or simulation logic unless the task specifically asks for it.
10. Do not remove analytics, tracking, canonical tags, schema, nav, footer, or existing CTAs unless explicitly requested.
11. Do not change public branding from **Edge Over Luck** to `CashCal`.

---

## Task Scope Rules

When working on a task:

- Only edit files directly related to the request.
- Keep changes minimal and targeted.
- If more files need to be changed, explain why.
- Do not “improve” unrelated pages while completing a specific task.
- Do not rename files, move assets, or restructure folders unless specifically requested.
- Preserve existing behavior unless the task is explicitly about changing behavior.
- Avoid mixing bug fixes, design changes, SEO edits, and refactors in the same task.

Bad behavior:

- Fixing roulette and changing blackjack.
- Updating copy and rewriting CSS.
- Moving assets and refactoring JavaScript.
- Adding new features during a bug fix.
- Rebranding pages from Edge Over Luck to CashCal.

Good behavior:

- Fix the requested issue.
- Verify the fix.
- Report exactly what changed.
- Keep the PR small enough to review safely.

---

## Domain and Branding Rules

- Public brand name: **Edge Over Luck**
- Public domain: **edgeoverluck.com**
- Repository/internal name may be `CashCal`
- Canonical URLs should use `https://edgeoverluck.com/`
- Public page titles, meta descriptions, headers, and CTAs should use **Edge Over Luck**, not `CashCal`, unless specifically requested.
- Do not add `www` to canonical URLs unless specifically requested.
- Keep branding consistent across homepage, tools, calculators, games, guides, nav, footer, metadata, and schema.

---

## Conversion Rules: High Priority

Every page should:

- Have a clear purpose.
- Make the next action obvious.
- Include at least one strong call-to-action.
- Guide users toward core tools:
  - Bankroll calculator
  - Blackjack trainer
  - Slot simulator
  - Roulette simulator, where relevant

### Required Conversion Elements

1. Strong headline with a clear benefit
2. Supporting subtext explaining what the tool does
3. CTA button above the fold
4. Additional CTA mid-page or near the bottom
5. Internal links to other tools

Avoid:

- Vague text
- Cluttered layouts
- Dead-end pages
- Weak CTAs
- Fake urgency
- Overpromising outcomes
- Spammy casino language

---

## Layout System

Use consistent structure:

- Header / navbar
- Hero section
- Main content sections
- Cards or grids
- CTA section
- Footer

Use existing classes when possible:

- `.container`
- `.card`
- `.btn`
- `.section`
- `.grid`
- `.hero`

Avoid:

- Inline styles unless absolutely necessary
- Creating new layout systems
- Duplicating CSS patterns that already exist
- Page-specific styling unless the page truly needs it
- Rebuilding shared navigation differently on each page

---

## Design Style

The site should use:

- Dark theme
- Gold/yellow accents
- Clean card-based layout
- Strong contrast
- Modern, readable spacing
- Subtle casino atmosphere
- Lightweight animations only when useful

Acceptable visual elements:

- Glow gradients
- Glass-style cards
- Depth shadows
- Subtle hover effects
- Section separators
- Small ambient motion
- Floating chip/card effects if lightweight and not distracting

Avoid:

- Heavy animations that slow loading
- Clutter
- Cheap casino spam visuals
- Unreadable text
- Excessive effects that distract from the tool
- Random style changes that do not match the rest of the site

---

## Mobile Optimization: Critical

Every change must work under 768px width.

Mobile rules:

- No horizontal overflow
- No oversized text
- No crushed cards
- No tiny tap targets
- Important content must appear early
- Buttons must be easy to tap
- Tools must remain usable on phones
- Game controls should appear in a logical order
- Do not bury controls below giant visuals on mobile

Always consider mobile before desktop polish.

---

## JavaScript Rules

- Do not break existing logic unless fixing a bug.
- If fixing a bug, identify the root cause.
- Keep math accurate.
- Keep scripts simple and efficient.
- Avoid global variables unless already part of the page pattern.
- Do not duplicate utility functions if an existing shared helper can be reused.
- Do not introduce unnecessary dependencies.
- Do not silently change simulation assumptions.

For gambling tools:

- Bankroll math must be accurate.
- Probability logic must be accurate.
- Betting limits must prevent impossible bets.
- Users must not be allowed to bet more than their bankroll.
- Simulations should be transparent and explain assumptions.
- Randomness should be handled clearly and consistently.
- Do not make fake claims that a tool can predict outcomes.

---

## Game / Simulator Rules

For blackjack, roulette, slots, dice, or any future casino-style tool:

- Prevent impossible states.
- Prevent betting more than current bankroll.
- Preserve reset/replay behavior unless intentionally changing it.
- Keep controls visible and easy to use.
- Keep feedback clear after each action.
- Do not let animations block basic usability.
- Do not let sounds loop endlessly unless explicitly requested.
- Do not make the page dependent on audio to understand what happened.

When changing a game page, test:

- Starting bankroll
- Bet input
- Repeat bet
- Win/loss/push behavior
- Reset behavior
- Mobile layout
- Broken images
- Broken sounds
- Console errors

---

## Audio Rules

Audio should improve interaction without becoming annoying.

Rules:

- Do not autoplay looping sounds unless explicitly requested.
- Do not create sounds that repeat endlessly.
- Button/click sounds should be subtle.
- Game sounds should trigger only on relevant actions.
- Preserve existing audio paths unless the task is about audio.
- Check that referenced audio files actually exist.
- Respect browser autoplay restrictions.
- If audio fails, the game should still work.

Common folders:

- `/assets/sounds/cards/`
- `/assets/sounds/chips/`
- `/assets/sounds/games/`
- `/assets/sounds/ui/`
- `/assets/sounds/voices/`

---

## Asset Rules

Use organized asset paths.

Common folders:

- `/assets/images/`
- `/assets/images/cards/`
- `/assets/sounds/`

When replacing assets:

- Preserve existing filenames when game logic depends on them.
- Do not change code paths if replacing files with same-name assets.
- Verify referenced files exist.
- Do not leave duplicate unused assets unless intentionally archived.
- Do not rename files casually.
- Do not move assets unless the task specifically asks for asset organization.


---

## Feature Development Rules

When adding features:

- Extend existing pages instead of rebuilding them.
- Maintain visual consistency.
- Keep performance fast.
- Avoid unnecessary complexity.
- Add one feature at a time.
- Do not combine feature work with cleanup/refactoring unless requested.
- Make the feature useful before making it fancy.

Feature work should be easy to review in a pull request.

---

## SEO Rules

Each page should include:

- Optimized title tag
- Meta description
- One clear H1
- Logical H2/H3 structure
- Internal links to related tools
- Canonical URL using `https://edgeoverluck.com/`
- Useful, non-spammy content

Optional when appropriate:

- `WebApplication` schema
- `FAQPage` schema
- Breadcrumb schema

Avoid:

- Keyword stuffing
- Fake expertise
- Thin content
- Repeating the same paragraph across pages
- Spammy affiliate wording
- Any claim that gambling tools guarantee profit

---

## Internal Linking Strategy

Every page should:

- Link to at least 2–3 relevant tools or guides.
- Help users continue exploring the site.
- Avoid dead ends.

Priority internal links:

- Bankroll calculator
- Blackjack trainer
- Slot simulator
- Roulette simulator
- Blackjack strategy content
- Gambling math/odds explainers

---

## Analytics / Tracking Rules

Do not remove or duplicate analytics/tracking code unless the task specifically asks for it.

Preserve:

- Google Analytics tags
- Event tracking stubs
- Form tracking hooks
- Phone/link click tracking hooks, if present

If editing CTAs or forms, verify that tracking still works or report what needs manual testing.

---

## Forms / CTA Rules

If a page includes forms or lead-capture elements:

- Preserve existing form actions.
- Preserve hidden fields.
- Preserve thank-you redirect behavior.
- Preserve required inputs.
- Do not change form providers unless explicitly requested.

For CTA buttons:

- Keep wording clear.
- Link to relevant tools or pages.
- Avoid fake urgency.
- Avoid misleading casino/promotional claims.

---

## Verification Checklist

Before finishing any task, check:

1. Does the requested feature or fix work?
2. Were only necessary files changed?
3. Did any unrelated layout, nav, SEO, or analytics change?
4. Are asset paths valid?
5. Are there missing images, sounds, scripts, or CSS files?
6. Does the page still work on mobile?
7. Are there obvious console errors?
8. Did the change preserve existing functionality?
9. Is the PR small enough to review safely?

For asset changes, also check:

- Old references are updated or preserved correctly.
- New files are in the expected folders.
- No broken image/audio paths remain.
- Duplicate files are reported.
- New filenames match existing logic.

For game changes, also check:

- Users cannot bet more than bankroll.
- Repeat bet still works.
- Reset still works.
- Win/loss/push states display correctly.
- Controls are usable on mobile.

---

## Pull Request Expectations

When making changes:

- Keep diffs small.
- Do not rewrite full files unless explicitly requested.
- Do not reformat entire files just because formatting differs.
- Explain what changed.
- List files modified.
- List anything that should be manually tested.
- Mention any uncertainty or files that could not be verified.
- Separate unrelated changes into separate PRs.

Do not hide risky changes inside unrelated updates.

---

## Output Expectations

When reporting work completed, include:

- Summary of changes
- Files changed
- Tests/checks performed
- Anything not tested
- Any manual review needed

Do not claim something was tested unless it actually was.

---

## Priority Order

1. Functionality: the site must work correctly.
2. Accuracy: math, odds, and simulations must be honest.
3. Conversion: pages must guide user action.
4. Consistency: pages should look like the same product.
5. Mobile usability: tools must work on phones.
6. Performance: keep it fast and lightweight.
7. SEO: improve discoverability without spam.
8. Clean code: make future changes easier.
