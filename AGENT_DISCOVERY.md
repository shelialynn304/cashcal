# Agent Discovery Header Rules

EdgeOverLuck.com is currently deployed with GitHub Pages. GitHub Pages does not process `_headers`, so production HTTP response headers for agent discovery must be added at the CDN/proxy layer.

Use Cloudflare Response Header Transform Rules or a Cloudflare Worker if Edge Over Luck is routed through Cloudflare.

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
