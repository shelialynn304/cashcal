#!/usr/bin/env node
'use strict';

/**
 * fix-analytics-load.js
 *
 * One-time migration. Removes the duplicate Amplitude initialisation and stops
 * the remaining one from blocking the parser.
 *
 * Before: every page initialised Amplitude TWICE --
 *   1. an inline <script type="module"> importing @amplitude/unified from
 *      jsdelivr, calling initAll(... sessionReplay sampleRate 1 ...)
 *   2. js/amplitude-init.js (parser-blocking) loading cdn.amplitude.com and
 *      calling init(...) + sessionReplay.plugin({ sampleRate: 1 })
 *
 * The `if (window.amplitude) return;` guard in (2) never fires, because a
 * module script is deferred and (2) runs during parsing -- so both SDKs load
 * and both record 100% of sessions.
 *
 * After: the inline module is gone, amplitude-init.js is deferred, and replay
 * is sampled.
 *
 * Usage:  node scripts/fix-analytics-load.js [--check]
 *         --check  report what would change, write nothing (exit 1 if dirty)
 */

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

// Fraction of sessions to record with Amplitude Session Replay.
//
// Measured on throttled mobile once the duplicate SDK above was removed:
// sampleRate 1 -> 4295ms load, sampleRate 0 -> 4029ms. The recorder costs
// ~250ms and no extra requests, so this value is a DATA/QUOTA decision, not a
// performance one. Keep it at 1 while actively watching calculator sessions;
// lower it when the replay quota starts to matter.
//
// Set to '1' to leave js/amplitude-init.js untouched.
const SESSION_REPLAY_SAMPLE_RATE = '1';

const SKIP_DIRS = new Set(['.git', 'node_modules', 'vendor', '.devcontainer']);

function htmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

// Matches the inline Amplitude module block, including a leading HTML comment
// line and surrounding blank lines, without touching other module scripts.
const MODULE_BLOCK = /[ \t]*(?:<!--[^\n]*Amplitude[^\n]*-->\s*\n)?[ \t]*<script\s+type="module"\s*>(?:(?!<\/script>)[\s\S])*?@amplitude\/unified(?:(?!<\/script>)[\s\S])*?<\/script>\s*\n/i;

// Matches the parser-blocking init tag (no defer/async on it today).
// Captures the src so a page in a subdirectory keeps its own relative path.
const INIT_TAG = /<script\s+src="((?:\.\.?\/)*js\/amplitude-init\.js)"\s*>\s*<\/script>/i;

let changedHtml = 0;
const skipped = [];

for (const file of htmlFiles(REPO_ROOT)) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;
  const rel = path.relative(REPO_ROOT, file);

  if (MODULE_BLOCK.test(next)) next = next.replace(MODULE_BLOCK, '');

  if (INIT_TAG.test(next)) {
    next = next.replace(INIT_TAG, (_m, src) => `<script src="${src}" defer></script>`);
  } else if (/amplitude-init\.js/.test(next) && !/amplitude-init\.js"\s+defer/.test(next)) {
    skipped.push(rel); // unexpected shape -- do not guess, report it
  }

  if (next !== original) {
    changedHtml++;
    if (!CHECK_ONLY) fs.writeFileSync(file, next);
    console.log(`${CHECK_ONLY ? 'would patch' : 'patched'}  ${rel}`);
  }
}

// Sample the replay plugin in the one remaining initialiser.
const initPath = path.join(REPO_ROOT, 'js', 'amplitude-init.js');
let changedJs = false;
if (fs.existsSync(initPath)) {
  const original = fs.readFileSync(initPath, 'utf8');
  const next = original.replace(
    /sessionReplay\.plugin\(\{\s*sampleRate:\s*[\d.]+\s*\}\)/,
    `sessionReplay.plugin({ sampleRate: ${SESSION_REPLAY_SAMPLE_RATE} })`
  );
  if (next !== original) {
    changedJs = true;
    if (!CHECK_ONLY) fs.writeFileSync(initPath, next);
    console.log(`${CHECK_ONLY ? 'would patch' : 'patched'}  js/amplitude-init.js  (sampleRate -> ${SESSION_REPLAY_SAMPLE_RATE})`);
  }
} else {
  console.error('WARNING: js/amplitude-init.js not found -- sampleRate unchanged.');
}

if (skipped.length) {
  console.error(`\n${skipped.length} file(s) reference amplitude-init.js in an unexpected form; left alone:`);
  for (const s of skipped) console.error(`  ${s}`);
}

console.log(`\n${CHECK_ONLY ? 'Would change' : 'Changed'} ${changedHtml} HTML file(s)${changedJs ? ' + js/amplitude-init.js' : ''}.`);

if (CHECK_ONLY && (changedHtml || changedJs)) process.exit(1);
if (skipped.length) process.exit(1);
