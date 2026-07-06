# Edge Over Luck Project Instructions

## Site Identity

EdgeOverLuck.com is an educational gambling math website.

The site helps users understand:
- Casino odds
- House edge
- Expected value
- Bankroll risk
- Blackjack
- Roulette
- Slots
- Craps
- Bubble craps
- Horse betting
- Responsible gambling

Brand line:

Smart gambling tools for real players.

Main positioning:

Play with the numbers before you play with your money.

## Tech Stack

Use:
- Static HTML
- CSS
- Vanilla JavaScript

Avoid:
- React
- Vue
- Angular
- Heavy frameworks
- Unnecessary dependencies
- Large libraries unless explicitly requested

Keep the site fast, lightweight, and easy to audit.

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
- Preserve SEO metadata unless the task is specifically SEO-related.
- Preserve Google Analytics, Litlyx, and tracking snippets.
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
- Use known benchmark values where possible.
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

Edge Over Luck should feel:
- Smart
- Sharp
- Honest
- Premium
- Math-based
- Black/gold
- Fast
- Mobile-friendly

Avoid:
- Spammy casino visuals
- Neon overload
- Fake luxury
- Clutter
- Tiny text
- Hover-only information
- Unnecessary animations

## Preferred Workflow

Before editing:
1. Inspect the relevant files.
2. Identify the smallest safe change.
3. Avoid unrelated changes.

After editing:
1. Check for JavaScript errors when relevant.
2. Check invalid inputs for calculators.
3. Check mobile layout when relevant.
4. Check changed or added links.
5. Confirm no unrelated files were changed.
6. Summarize files changed and why.

## Specialist Skills

Use specialist skills when relevant:

- casino-math-calculator: calculator math, EV, house edge, RTP, simulations, bankroll risk
- edge-over-luck-frontend-designer: layout, mobile, UI, accessibility, performance
- edge-over-luck-brand-guardian: copy tone, brand consistency, PDFs, emails, social posts
- edge-over-luck-seo: title tags, metadata, internal links, schema, content clusters
- edge-over-luck-aeo-foundations: robots.txt, llms.txt, AI-readability, structured content
- edge-over-luck-devops: GitHub Actions, link checks, deployment safety, audits

Do not load or apply specialist guidance unless the task matches the skill or the user explicitly asks for it.
