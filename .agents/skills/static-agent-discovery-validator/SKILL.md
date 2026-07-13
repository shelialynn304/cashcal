# Static Agent Discovery Validator

Use this skill when editing Edge Over Luck agent discovery, API catalog, OpenAPI, robots.txt, `.well-known`, Cloudflare documentation, or static metadata files.

## Mission

Make the static site more discoverable to crawlers and agents without adding fake infrastructure.

## Hard rules

- Do not add OAuth/OIDC unless real authentication exists.
- Do not add MCP server cards unless a real MCP server exists.
- Do not add WebMCP unless browser tools are actually implemented.
- Do not add auth.md unless real agent registration exists.
- Do not claim DNS-AID is complete from repo files.
- Do not rely on `_headers` for GitHub Pages.
- Do not use top-level `$defs` in OpenAPI.
- Do not invent URLs.

## Required files

Check or create:

- `.nojekyll`
- `.well-known/api-catalog`
- `.well-known/agent-index.json`
- `.well-known/agent-card.json`
- `api/tools.json`
- `api/status.json`
- `api/openapi.json`
- `robots.txt`
- `AGENT_DISCOVERY.md`
- `DNS_AID.md`

## OpenAPI rules

- Use OpenAPI 3.1.0.
- Put reusable schemas under `components.schemas`.
- Use `$ref` values like `#/components/schemas/Tool`.
- Do not use top-level `$defs`.
- Only document real static JSON endpoints.

## API catalog rules

The API catalog must point to actual public API/member endpoints.

Good:
- `/api/tools.json`
- `/api/status.json`
- `/api/openapi.json`

Bad:
- pretending `/contact.html` is an API
- pretending `/tools/` is an API endpoint
- advertising fake protected resources

## Validation checklist

Before final response:

1. Parse all JSON files.
2. Confirm OpenAPI has no top-level `$defs`.
3. Confirm all `$ref` values resolve to `components.schemas`.
4. Confirm all tool URLs exist.
5. Confirm `.well-known/api-catalog` has no `.json` extension.
6. Confirm `.nojekyll` exists.
7. Confirm no fake auth/MCP/WebMCP files were created.
8. Confirm documentation says Cloudflare handles real response headers.
