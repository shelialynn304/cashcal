# CashCal Project Guidelines (AGENTS.md)

## Project Purpose
CashCal is a high-conversion gambling/math tool site designed to:
- Attract search traffic (SEO)
- Keep users engaged (interactive tools)
- Drive clicks to core tools and future affiliate offers

Primary goal:
Turn visitors into tool users (and eventually affiliate clicks)

---

## Tech Stack
- HTML
- CSS (shared style.css)
- Vanilla JavaScript

NO frameworks. Keep it lightweight and fast.

---

## Core Rules (DO NOT BREAK)

1. Do NOT redesign pages from scratch unless explicitly told
2. Always reuse existing style.css classes
3. Maintain consistent layout across all pages
4. Do NOT add heavy libraries or frameworks
5. Keep code clean, readable, and fast
6. Do NOT remove working features unless fixing a bug

---

## Conversion Rules (HIGH PRIORITY)

Every page should:

- Have a clear purpose (what the user should do next)
- Include at least one strong call-to-action (CTA)
- Guide users toward:
  - Bankroll calculator
  - Blackjack trainer
  - Slot simulator

### Required Conversion Elements

1. Strong headline (clear benefit)
2. Supporting subtext (what the tool does)
3. CTA button above the fold
4. Additional CTA mid-page or bottom
5. Internal links to other tools

Avoid:
- vague text
- cluttered layouts
- dead-end pages with no next step

---

## Layout System

Use consistent structure:

- Header / Navbar
- Hero section (top)
- Main content sections (cards or grids)
- CTA section
- Footer

Use classes:
- `.container`
- `.card`
- `.btn`

Avoid:
- inline styles unless necessary
- creating new layout systems

---

## Design Style

- Dark theme
- Gold/yellow accents
- Clean card-based layout
- Modern, minimal, readable

---

## Mobile Optimization (CRITICAL)

- Must look clean under 768px width
- No oversized text
- No broken layouts or overflow
- Keep important content visible early
- Buttons must be easy to tap

---

## JavaScript Rules

- Do NOT break existing logic unless fixing a bug
- If fixing a bug, identify root cause
- Keep math accurate (especially bankroll/probability logic)
- Keep scripts simple and efficient

---

## Feature Development Rules

When adding features:

- Extend existing pages (do NOT rebuild everything)
- Maintain visual consistency
- Keep performance fast
- Avoid unnecessary complexity

---

## SEO Rules

Each page must include:

- Optimized title tag (keywords like:
  blackjack calculator, bankroll calculator, gambling odds)
- Meta description
- Proper heading structure (H1, H2, H3)
- Internal links to other pages

Optional:
- Schema markup (WebApplication or FAQ)

Avoid:
- keyword stuffing
- spammy content

---

## Internal Linking Strategy

Every page should:
- Link to at least 2–3 other tools
- Help users continue exploring the site
- Avoid dead ends

---

## Output Expectations

- Return FULL updated files (not fragments) when making changes
- Only modify necessary sections
- Keep changes minimal and targeted
- Briefly explain what was changed

---

## Priority Order

1. Functionality (must work correctly)
2. Conversion (must guide user action)
3. Consistency (match existing design)
4. Mobile usability
5. Clean code
6. SEO improvements