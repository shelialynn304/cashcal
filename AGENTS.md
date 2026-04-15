# CashCal Project Guidelines (AGENTS.md)

## Project Overview
CashCal is a casino/math tool website with:
- Bankroll calculator
- Blackjack trainer
- Slot simulator

Built with:
- Plain HTML
- CSS (shared style.css)
- Vanilla JavaScript

Goal:
- Clean UI
- Mobile-friendly
- High conversion (users clicking tools)
- SEO-friendly structure

---

## Core Rules (DO NOT BREAK THESE)

1. Do NOT redesign the site from scratch
2. Always reuse existing CSS classes from style.css
3. Keep consistent layout across all pages
4. Do NOT introduce heavy frameworks or libraries
5. Keep code simple, readable, and fast

---

## Layout System

Pages should use:
- `.container` for main content
- `.card` for sections
- `.btn` for buttons
- shared navbar and footer structure

Avoid:
- excessive inline styles
- random new class systems

---

## Design Style

- Dark background
- Gold/yellow accent colors
- Clean card-based layout
- Modern but simple

---

## Mobile Requirements

- Must look clean under 768px width
- Avoid oversized text
- Avoid long vertical spacing
- Keep key content visible early

---

## JavaScript Rules

- Do NOT break existing logic unless fixing a bug
- If fixing a bug, explain the root cause
- Keep calculations accurate (especially bankroll/math logic)
- Avoid unnecessary complexity

---

## When Adding Features

- Integrate into existing pages (do NOT rebuild entire page)
- Keep visual consistency
- Keep performance fast

---

## SEO Rules

- Each page should have:
  - proper title tag
  - meta description
  - heading structure (H1, H2)
- Avoid keyword stuffing
- Keep content readable

---

## Output Expectations

- Prefer full updated files over fragments
- Only modify files that need changes
- Keep changes minimal and targeted

---

## Priority Order

1. Functionality (it must work correctly)
2. Consistency (match existing design)
3. Mobile usability
4. Clean code
5. SEO improvements