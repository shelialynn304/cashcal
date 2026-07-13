#!/usr/bin/env bash
set -euo pipefail

PORT=8080
PIDFILE="/tmp/cashcal-preview-server.pid"

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "Preview server already running on port ${PORT} (pid $(cat "$PIDFILE"))."
  exit 0
fi

echo "Starting Edge Over Luck static preview server on port ${PORT}..."

# Zero-dependency static file server using only Node's built-in http/fs
# modules, consistent with this repo's "no unnecessary dependencies" rule.
nohup node -e "
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const port = ${PORT};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

// '.well-known' is the one dotted path this repo intentionally serves
// publicly (agent-discovery metadata) -- everything else dotted, plus
// .git/.devcontainer/.vscode/.github/.agents, stays off the preview.
const ALLOWED_DOT_SEGMENTS = new Set(['.well-known']);

function isPathSafe(filePath) {
  const relPath = path.relative(root, filePath);
  if (relPath === '' || relPath === '..' || relPath.startsWith('..' + path.sep) || path.isAbsolute(relPath)) {
    return false;
  }
  return relPath.split(path.sep).every((segment) => {
    return !segment.startsWith('.') || ALLOWED_DOT_SEGMENTS.has(segment);
  });
}

http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  const filePath = path.normalize(path.join(root, reqPath));

  if (!isPathSafe(filePath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => {
  console.log('Edge Over Luck preview server listening on http://localhost:' + port);
});
" > /tmp/cashcal-preview-server.log 2>&1 &

echo $! > "$PIDFILE"
echo "Preview server started (pid $(cat "$PIDFILE")). Logs: /tmp/cashcal-preview-server.log"
echo "Open http://localhost:${PORT}/index.html"
