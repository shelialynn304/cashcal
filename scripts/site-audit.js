#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const REQUIRED_PAGE_IGNORE_PATTERNS = [
  /^google[a-z0-9]+\.html$/i,
];

function isRequiredPage(fileName) {
  return !REQUIRED_PAGE_IGNORE_PATTERNS.some((pattern) => pattern.test(fileName));
}
function listRootHtmlFiles() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
}

function extractAttr(tag, attr) {
  const regex = new RegExp(`\\b${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(regex);
  return match ? match[2].trim() : '';
}

function isIgnoredRef(ref) {
  if (!ref) return true;
  const value = ref.trim();
  return (
    value.startsWith('#') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('javascript:') ||
    /^https?:\/\//i.test(value) ||
    value.startsWith('//')
  );
}

function normalizeLocalRef(raw) {
  const withoutHash = raw.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0].trim();
  if (!withoutQuery) return '';
  return withoutQuery;
}

function resolveLocalPath(htmlFile, localRef) {
  const pageUrl = new URL(`https://edgeoverluck.com/${htmlFile}`);
  const resolvedUrl = new URL(localRef, pageUrl);
  const pathname = decodeURIComponent(resolvedUrl.pathname);
  return path.normalize(pathname.replace(/^\//, ''));
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>([\s\S]*?)<\/loc>/gi;
  let match;
  while ((match = re.exec(xml))) {
    urls.push(match[1].trim());
  }
  return urls;
}

function canonicalInvalidReason(url) {
  if (!url) return 'missing canonical URL';
  if (!url.startsWith('https://edgeoverluck.com/')) return 'must start with https://edgeoverluck.com/';
  if (url.includes('www.edgeoverluck.com')) return 'must not contain www.edgeoverluck.com';
  if (url.includes('github.io')) return 'must not contain github.io';
  if (url.startsWith('http://')) return 'must not use http://';
  return '';
}

function toRootHtmlFromUrl(url) {
  if (!url.startsWith('https://edgeoverluck.com/')) return null;
  const u = new URL(url);
  let p = u.pathname;
  if (p === '/' || p === '') return 'index.html';
  p = p.replace(/^\//, '');
  if (!p.endsWith('.html')) return null;
  if (p.includes('/')) return null;
  return p;
}

function audit() {
  const metadataIssues = [];
  const canonicalIssues = [];
  const sitemapIssues = [];
  const missingRefs = [];
  const jsonLdIssues = [];

  const htmlFiles = listRootHtmlFiles();
  const requiredHtmlFiles = htmlFiles.filter(isRequiredPage);
  const requiredHtmlSet = new Set(requiredHtmlFiles);

  for (const file of requiredHtmlFiles) {
    const fullPath = path.join(ROOT, file);
    const html = fs.readFileSync(fullPath, 'utf8');

    const titleMatch = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/i);
    if (!titleMatch) metadataIssues.push(`${file}: missing <title>`);

    const descMatch = html.match(/<meta\b[^>]*name\s*=\s*(["'])description\1[^>]*>/i);
    if (!descMatch) metadataIssues.push(`${file}: missing meta name="description"`);

    const robotsMatch = html.match(/<meta\b[^>]*name\s*=\s*(["'])robots\1[^>]*>/i);
    if (!robotsMatch) metadataIssues.push(`${file}: missing meta name="robots"`);

    const canonicalTag = html.match(/<link\b[^>]*rel\s*=\s*(["'])canonical\1[^>]*>/i);
    if (!canonicalTag) {
      metadataIssues.push(`${file}: missing link rel="canonical"`);
    } else {
      const href = extractAttr(canonicalTag[0], 'href');
      const reason = canonicalInvalidReason(href);
      if (reason) canonicalIssues.push(`${file}: ${reason} (${href || 'empty'})`);
    }

    const h1Match = html.match(/<h1\b[^>]*>/i);
    if (!h1Match) metadataIssues.push(`${file}: missing <h1>`);

    const refRegex = /<(a|link|script|img|source)\b[^>]*\b(href|src)\s*=\s*(["'])(.*?)\3[^>]*>/gi;
    let refMatch;
    while ((refMatch = refRegex.exec(html))) {
      const rawRef = refMatch[4].trim();
      if (isIgnoredRef(rawRef)) continue;
      const localRef = normalizeLocalRef(rawRef);
      if (!localRef) continue;
      const resolved = resolveLocalPath(file, localRef);
      const absPath = path.join(ROOT, resolved);
      if (!fs.existsSync(absPath)) {
        missingRefs.push(`${file}: missing local ${refMatch[2]}="${rawRef}"`);
      }
    }

    const ldRegex = /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
    let ldMatch;
    while ((ldMatch = ldRegex.exec(html))) {
      const block = ldMatch[2].trim();
      if (!block) {
        jsonLdIssues.push(`${file}: empty JSON-LD block`);
        continue;
      }
      try {
        JSON.parse(block);
      } catch (err) {
        jsonLdIssues.push(`${file}: invalid JSON-LD (${err.message})`);
      }
    }
  }

  let sitemapUrls = [];
  if (!fs.existsSync(SITEMAP_PATH)) {
    sitemapIssues.push('sitemap.xml is missing');
  } else {
    const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
    sitemapUrls = parseSitemapUrls(sitemap);
    const mapped = new Set();

    for (const url of sitemapUrls) {
      const rootHtml = toRootHtmlFromUrl(url);
      if (!rootHtml || !requiredHtmlSet.has(rootHtml)) {
        if (rootHtml && !isRequiredPage(rootHtml)) {
          continue;
        }
        sitemapIssues.push(`sitemap URL does not map to a real required root HTML file: ${url}`);
      } else {
        mapped.add(rootHtml);
      }
    }

    for (const file of requiredHtmlFiles) {
      if (!mapped.has(file)) {
        sitemapIssues.push(`root HTML page missing from sitemap.xml: ${file}`);
      }
    }
  }

  return { metadataIssues, canonicalIssues, sitemapIssues, missingRefs, jsonLdIssues };
}

function printGroup(title, issues) {
  console.log(`\n${title}`);
  if (issues.length === 0) {
    console.log('  - none');
    return;
  }
  for (const issue of issues) console.log(`  - ${issue}`);
}

const result = audit();
printGroup('Metadata issues', result.metadataIssues);
printGroup('Canonical issues', result.canonicalIssues);
printGroup('Sitemap issues', result.sitemapIssues);
printGroup('Missing local references', result.missingRefs);
printGroup('JSON-LD issues', result.jsonLdIssues);

const criticalCount =
  result.metadataIssues.length +
  result.canonicalIssues.length +
  result.sitemapIssues.length +
  result.missingRefs.length +
  result.jsonLdIssues.length;

if (criticalCount > 0) {
  console.error(`\nSite audit failed with ${criticalCount} issue(s).`);
  process.exit(1);
}

console.log('\nSite audit passed with no issues.');
process.exit(0);
