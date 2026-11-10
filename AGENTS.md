# Edge Over Luck Project Instructions

This is the single source of truth for every AI agent working in this repo (Claude Code, Codex, Copilot, and others). Other instruction files point here; they do not override it.

## Site Identity

EdgeOverLuck.com is an educational gambling math website.

The site helps users understand casino odds, house edge, expected value, bankroll risk, blackjack, roulette, slots, craps, bubble craps, horse betting, and responsible gambling.

Brand line: Smart gambling tools for real players.

Main positioning: Play with the numbers before you play with your money.

The site provides casino math education, bankroll calculators, game explainers, static public metadata endpoints, and downloadable educational materials.

The site does NOT:
- place bets or process gambling transactions
- provide guaranteed winning systems or financial advice
- provide OAuth/OIDC login
- run an MCP server
- expose protected APIs
- support Agent-to-Agent protocol unless explicitly implemented later

## Tech Stack

Use static HTML, CSS, and vanilla JavaScript. There is no build step and no `package.json`.

Avoid React, Vue, Angular, heavy frameworks, unnecessary dependencies, and large libraries unless explicitly requested.

Keep the site fast, lightweight, and easy to audit.

## Where to Look

Read these only when the task needs them:

| Task | Read |
|---|---|
| Calculator, simulator, odds, EV, RTP, house edge, bankroll logic | `math_sources.md` (formulas and benchmarks) and `.github/agents/Casino-Math-Calculator-Agent.md` |
| Copy, brand voice, CTAs, visual style, UX consistency | `STYLEGUIDE.md` |
| Manual QA and calculator test cases | `docs/tool-qa-checklist.md` |
| Roulette code structure | `docs/roulette-architecture.md` |
| Agent discovery files | `AGENT_DISCOVERY.md` and the `static-agent-discovery-validator` skill |

## Hosting and Agent Discovery Rules

- Domain: edgeoverluck.com
- Hosting: GitHub Pages
- DNS/CDN: Cloudflare
- GitHub Pages does not process `_headers`
- Production HTTP response headers are handled by Cloudflare Snippets, not repo files
- `.nojekyll` must exist so GitHub Pages serves `.well-known/`

For agent discovery work:

1. Do not invent fake infrastructure.
2. Do not add fake OAuth, OIDC, auth.md, MCP, WebMCP, protected-resource metadata, or fake DNS-AID completion.
3. Do not claim DNS records are live from repo changes.
4. Do not rely on `_headers` for production behavior.
5. Keep all JSON valid.
6. Keep OpenAPI strict OpenAPI 3.1.
7. Use `components.schemas` in OpenAPI, not top-level `$defs`.
8. Do not invent URLs. Search the repo and use real files.
9. API catalogs must point to actual public API/member endpoints, not normal website pages pretending to be APIs.
10. Keep all gambling disclaimers accurate: educational use only, no guaranteed wins, gamble responsibly, follow local laws.

Before finishing any task that touches agent discovery files, validate:

- `.nojekyll` exists
- `.well-known/api-catalog` exists with no `.json` extension
- `/api/tools.json` exists
- `/api/status.json` exists
- `/api/openapi.json` exists
- all JSON parses
- OpenAPI uses `components.schemas`
- no top-level `$defs` exists in OpenAPI
- every listed tool URL exists in the repo
- `index.html` discovery links are inside `<head>`
- `robots.txt` preserves sitemap and includes Content-Signal
- no fake OAuth/OIDC/MCP/auth.md/protected-resource/WebMCP files were added

## Global Development Rules

- Preserve existing URLs.
- Preserve canonical tags.
- Preserve non-www canonical preference.
- Preserve SEO metadata, Open Graph tags, structured data, and existing navigation unless the task is specifically about them.
- Preserve Google Analytics and tracking snippets.
- Preserve responsible gambling language.
- Preserve affiliate disclosures.
- Do not remove working features unless there is a clear math, logic, accessibility, SEO, or bug reason.
- Do not redesign pages unless specifically asked.
- Make the smallest safe change.
- Do not modify unrelated files.
- Explain exactly what changed.

## Gambling Compliance Rules

Edge Over Luck is educational. It must not sound like a casino, sportsbook, gambling tout, or guaranteed-winning system.

Never use:
- Guaranteed win
- Beat the casino
- Risk-free
- Easy money
- Secret system
- Loophole
- Cheat code
- Sure thing
- Can’t lose
- Profit strategy
- Win every time
- Lock

Prefer:
- Understand the math
- Estimate risk
- Compare odds
- Track bankroll
- See the house edge
- Make informed decisions
- Educational use only
- Math does not guarantee wins
- The house usually has the edge
- Gambling involves risk
- Follow local laws
- 21+ where applicable
- Gamble responsibly

## Casino Math Rules

Casino math accuracy is critical.

For calculator or simulator work:
- Verify expected value formulas.
- Distinguish net profit from total payout returned.
- Verify house edge and RTP calculations.
- Use known benchmark values where possible (see `math_sources.md`).
- Do not claim betting systems change house edge.
- Label simplified blackjack calculations as estimates.
- Do not imply slots are due for bonuses.
- Do not treat horse odds like fixed casino odds without explaining pari-mutuel betting.

Accuracy beats design.

## SEO Rules

For SEO-related work:
- Use one clear H1 per page.
- Preserve or improve title tags and meta descriptions.
- Preserve self-referencing canonical URLs.
- Use descriptive internal links.
- Avoid duplicate keyword intent across similar pages.
- Add FAQ/schema only when it matches visible page content.
- Do not create thin AI filler pages.
- Do not keyword-stuff.

## Design Rules

Edge Over Luck should feel smart, sharp, honest, premium, math-based, black/gold, fast, and mobile-friendly.

Avoid spammy casino visuals, neon overload, fake luxury, clutter, tiny text, hover-only information, and unnecessary animations.

## Preferred Workflow

Before editing:
1. Inspect the relevant files.
2. Identify the smallest safe change.
3. Avoid unrelated changes.

After editing:
1. Run `bash scripts/check-all.sh` (the same checks CI runs). Do not push if it fails.
2. Check invalid inputs for calculators.
3. Check mobile layout when relevant.
4. Check changed or added links.
5. Confirm no unrelated files were changed.

## Reporting

When done, report:
- files changed and why
- whether formulas changed (if not, say: No formulas changed.)
- what was intentionally not changed
- checks and validation performed
- any warnings
- any manual Cloudflare steps still required

## Specialist Skills

Skills live in `.agents/skills/` (the full versions). `.claude/skills/` holds short pointers to them so Claude Code can discover them. Edit the `.agents/skills/` copy; keep the pointer's `name` and `description` in sync.

- `edge-over-luck-frontend-designer`: layout, mobile, UI, accessibility, performance
- `edge-over-luck-product-strategist`: new tools, guides, funnels, roadmap decisions
- `eol-devops-automator`: GitHub Actions, link checks, deployment safety, audits
- `static-agent-discovery-validator`: API catalog, OpenAPI, `.well-known`, robots.txt Content Signals, Cloudflare header docs, and agent-discovery validation

GitHub Copilot custom agents live in `.github/agents/` (math reviewer, planner, coder, designer, orchestrator, and marketing/SEO/AEO specialists in `.github/agents/marketing/`).

Do not load or apply specialist guidance unless the task matches the skill or the user explicitly asks for it.
