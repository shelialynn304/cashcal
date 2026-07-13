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
const fsp = require('node:fs/promises');
const path = require('node:path');

const root = fs.realpathSync(process.cwd());
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

function isWithinRoot(candidatePath) {
  const relPath = path.relative(root, candidatePath);
  if (relPath === '' || relPath === '..' || relPath.startsWith('..' + path.sep) || path.isAbsolute(relPath)) {
    return false;
  }
  return relPath.split(path.sep).every((segment) => {
    return !segment.startsWith('.') || ALLOWED_DOT_SEGMENTS.has(segment);
  });
}

http.createServer(async (req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath.endsWith('/')) reqPath += 'index.html';
    const filePath = path.normalize(path.join(root, reqPath));

    // Lexical check first (cheap, catches obvious traversal/dotfile
    // requests without touching the filesystem).
    if (!isWithinRoot(filePath)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // A lexical check alone can be bypassed by an in-repo symlink that
    // points outside root (or at a blocked dotted path). Resolve the
    // real, symlink-free path and re-apply the same policy to it before
    // ever reading file contents.
    let realFilePath;
    try {
      realFilePath = await fsp.realpath(filePath);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + reqPath);
      return;
    }

    if (!isWithinRoot(realFilePath)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const data = await fsp.readFile(realFilePath);
    const ext = path.extname(realFilePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(port, () => {
  console.log('Edge Over Luck preview server listening on http://localhost:' + port);
});
" > /tmp/cashcal-preview-server.log 2>&1 &

echo $! > "$PIDFILE"
echo "Preview server started (pid $(cat "$PIDFILE")). Logs: /tmp/cashcal-preview-server.log"
echo "Open http://localhost:${PORT}/index.html"
