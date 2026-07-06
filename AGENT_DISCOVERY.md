# Agent Discovery Header Rules

EdgeOverLuck.com is deployed with GitHub Pages behind Cloudflare. GitHub Pages does not process `_headers`, so production HTTP response headers for agent discovery must be added with Cloudflare Snippets.

Do not add repo-local `_headers` files for production behavior on the current deployment.

## Homepage rule

Expression:

```txt
(http.host eq "edgeoverluck.com" and http.request.uri.path in {"/" "/index.html"})
```

Header:

```txt
Link: </.well-known/api-catalog>; rel="api-catalog", </api/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </tools/>; rel="service-doc", </contact.html>; rel="help", </privacy-policy.html>; rel="privacy-policy", </terms.html>; rel="terms-of-service"
```

## API catalog content-type rule

Expression:

```txt
(http.host eq "edgeoverluck.com" and http.request.uri.path eq "/.well-known/api-catalog")
```

Headers:

```txt
Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"
Link: </.well-known/api-catalog>; rel="api-catalog"
```
