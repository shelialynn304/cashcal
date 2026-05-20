# Edge Over Luck Repo Skill

## Purpose

This skill captures the editing workflow for the Edge Over Luck static website repository (`cashcal`). It is designed for safe, incremental changes to HTML/CSS/JavaScript pages, with a consistent dark casino aesthetic, accurate gambling math, and strong conversion focus.

## When to use

Use this skill when making any content, layout, styling, or logic change inside this repository, including:
- page copy updates
- tool bug fixes
- CSS or JS adjustments
- SEO/meta improvements
- mobile/responsive fixes

## Workflow

1. Read the request carefully and identify the exact page or feature in scope.
2. Open `AGENTS.md` first to understand the repository rules and brand guidelines.
3. Locate the target file(s) and any existing pattern or related page.
4. Limit edits to the smallest set of files needed for the task.
5. Preserve existing behavior and avoid broad redesigns unless explicitly requested.
6. Apply the change incrementally, using existing classes and site structure.
7. Verify the result logically and check for obvious issues.
8. Report changed files, what was fixed/added, and any manual validation steps.

## Decision points

- If the request is a bug fix, prioritize correct behavior and safety over style.
- If the request is a styling or copy improvement, reuse existing classes/styles instead of adding new systems.
- If the request touches a game or simulator, confirm the bankroll/math logic stays correct and do not change gameplay rules unless asked.
- If the request is page-specific, do not edit unrelated pages or global assets.
- If the request involves a new feature, keep it lightweight and avoid adding libraries or frameworks.

## Quality criteria

- Only edit files directly related to the request.
- Preserve the public brand: **Edge Over Luck**, not `CashCal`.
- Keep the site lightweight and mobile-friendly.
- Avoid console errors and broken links/assets.
- Do not remove analytics, canonical tags, or tracking unless asked.
- Use dark casino visual language and maintain consistent layout.
- Keep JavaScript simple and accurate; do not introduce unnecessary globals.
- For gambling tools, enforce realistic bets and bankroll limits.

## Completion checks

Before finishing a change, verify:
- The requested behavior or content is implemented.
- Only necessary files were modified.
- Brand and page metadata remain correct.
- The page still matches the site’s visual/UX style.
- No new console errors are introduced.
- Mobile layout remains usable under 768px.
- Relevant CTAs and internal links are preserved or improved.

## Example prompts

- "Update `blackjack-bankroll-calculator.html` to make the hero CTA stronger and add a second internal link to the blackjack trainer."
- "Fix the bankroll validation bug in `roulette-simulator.js` so users can’t bet more than their current balance."
- "Improve the SEO metadata on `slot-simulator.html` and keep the page layout consistent with the rest of the site."
- "Add a small explanatory note on `roulette-calculator.html` that clarifies how house edge affects payout odds."

## Related customizations

- Add a repository-level `.instructions.md` or prompt template for consistent editing tasks.
- Create a `REVIEW.md` with small test cases for each simulator page.
- Add a `STYLEGUIDE.md` describing common classes and layout patterns used across the site.
