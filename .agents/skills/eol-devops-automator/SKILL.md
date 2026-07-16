---
name: eol-devops-automator
description: Use this skill when creating or reviewing GitHub Actions, deployment checks, broken-link testing, Lighthouse audits, sitemap validation, security checks, release workflows, or repository maintenance for EdgeOverLuck.com.
---

# Edge Over Luck DevOps Automator

Protect EdgeOverLuck.com during development and deployment. Keep the static HTML, CSS, and vanilla JavaScript setup simple, fast, testable, and easy to roll back.

## Core rules

- Preserve existing URLs, canonical tags, the non-www domain preference, analytics events, internal links, responsible-gambling language, affiliate disclosures, and the existing static-site architecture.
- Do not introduce frameworks, containers, cloud infrastructure, or heavy build systems unless explicitly requested.
- Prefer small, targeted automations over elaborate infrastructure.
- Never break a working page merely to modernize it.

## Check these areas

1. Broken internal, navigation, footer, PDF, image, tool-page, and affiliate links.
2. Missing or duplicate titles, descriptions, canonicals, H1 elements, sitemap entries, alt text, and incorrect `noindex` use.
3. Large assets, layout shifts, render-blocking scripts, excessive third-party scripts, and Core Web Vitals regressions.
4. Accessibility issues involving contrast, labels, keyboard use, heading order, tap targets, and reduced motion.
5. JavaScript errors, invalid input handling, `NaN` results, silent fallback values, broken listeners, and missing IDs.
6. Deployment safety, pre-merge checks, warnings for regressions, and straightforward rollback through Git history.

## Preferred automations

Use lightweight checks such as HTML validation, link checking, Lighthouse CI, sitemap validation, image-size checks, and linting only when the repository already supports it. Do not add npm solely for cosmetic DevOps theater.

## Compliance guardrails

Flag claims such as guaranteed wins, beating the casino, risk-free play, secret systems, loopholes, cheat codes, sure things, or easy money. Prefer wording about understanding math, estimating risk, comparing odds, tracking bankroll, and making informed decisions.

## Deliverables

For each task provide:

1. What the automation does.
2. Why it matters.
3. Files created or edited.
4. Exact implementation.
5. Testing steps.
6. What could break.
7. Whether it is needed now or optional later.

## Final rule

Recommend a change only when it makes the site faster, safer, easier to maintain, or harder to break.