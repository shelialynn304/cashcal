#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://edgeoverluck.com';
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');

const IGNORE_HTML_PATTERNS = [
  /^google[a-z0-9_-]+\.html$/i,
];

const OPTIONAL_SITEMAP_HTML = new Set([
  // noindex private page — intentionally excluded from sitemap
  'member-downloads.html',
]);

const IGNORE_LOCAL_REF_PATTERNS = [
  /^#/,
];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function isRootHtmlFile(fileName) {
  return fileName.toLowerCase().endsWith('.html');
}

function isIgnoredHtmlFile(fileName) {
  return IGNORE_HTML_PATTERNS.some((pattern) => pattern.test(fileName));
}

function listRootHtmlFiles() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isRootHtmlFile(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function listRequiredHtmlFiles() {
  return listRootHtmlFiles().filter((file) => !isIgnoredHtmlFile(file));
}

function extractAttr(tag, attr) {
  const regex = new RegExp(`\\b${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(regex);
  return match ? match[2].trim() : '';
}

function hasMetaName(html, name) {
  const regex = new RegExp(`<meta\\b[^>]*\\bname\\s*=\\s*(["'])${name}\\1[^>]*>`, 'i');
  return regex.test(html);
}

function getCanonicalHref(html) {
  const match = html.match(/<link\b[^>]*\brel\s*=\s*(["'])canonical\1[^>]*>/i);
  return match ? extractAttr(match[0], 'href') : '';
}

function publicPathForHtmlFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.replace(/\/index\.html$/i, '/')}`;
  return `/${file}`;
}

function canonicalInvalidReason(url, file) {
  if (!url) return 'missing canonical URL';
  if (url.startsWith('http://')) return 'must not use http://';
  if (url.includes('www.edgeoverluck.com')) return 'must not contain www.edgeoverluck.com';
  if (!url.startsWith(`${SITE_ORIGIN}/`)) return `must start with ${SITE_ORIGIN}/`;

  const expectedPath = publicPathForHtmlFile(file);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return 'is not a valid URL';
  }

  if (parsed.hostname === 'github.io' || parsed.hostname.endsWith('.github.io')) {
    return 'must not contain github.io';
  }
  if (parsed.origin !== SITE_ORIGIN) return `must use ${SITE_ORIGIN}`;
  if (parsed.pathname !== expectedPath) {
    return `path should be ${expectedPath}, found ${parsed.pathname}`;
  }
  if (parsed.search || parsed.hash) return 'must not include query string or hash';

  return '';
}

function isExternalOrSpecialRef(ref) {
  if (!ref) return true;
  const value = ref.trim();

  return (
    value === '' ||
    value.startsWith('#') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('javascript:') ||
    value.startsWith('vbscript:') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    /^https?:\/\//i.test(value) ||
    value.startsWith('//')
  );
}

function normalizeLocalRef(raw) {
  return raw.split('#')[0].split('?')[0].trim();
}

function resolveLocalPath(htmlFile, localRef) {
  const normalized = normalizeLocalRef(localRef);
  if (!normalized) return '';

  let pathname;
  try {
    const baseUrl = new URL(`${SITE_ORIGIN}/${htmlFile}`);
    const resolved = new URL(normalized, baseUrl);
    if (resolved.origin !== SITE_ORIGIN) return '';
    pathname = resolved.pathname;
  } catch {
    return '';
  }

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }

  const relative = decoded.replace(/^\/+/, '');
  const clean = path.normalize(relative);

  if (clean.startsWith('..') || path.isAbsolute(clean)) return '';
  return clean;
}

function isSafeSitemapHtmlPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }

  const relative = decoded.replace(/^\/+/, '');
  if (!relative || relative.includes('\\')) return false;

  const segments = relative.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return false;

  const firstSegment = segments[0].toLowerCase();
  if (['assets', 'css', 'js', 'member', 'members', 'member-only'].includes(firstSegment)) return false;

  const normalized = path.posix.normalize(relative);
  if (normalized !== relative || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) return false;

  return true;
}

function rawUrlPathHasUnsafeSegments(url) {
  const match = String(url).match(/^[a-z][a-z\d+.-]*:\/\/[^/?#]*(\/[^?#]*)?/i);
  const rawPath = match && match[1] ? match[1] : '/';

  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return true;
  }

  return decoded.split('/').some((segment) => segment === '.' || segment === '..');
}

function htmlFilesFromSiteUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return [];
  }

  if (parsed.origin !== SITE_ORIGIN) return [];
  if (rawUrlPathHasUnsafeSegments(url)) return [];
  if (parsed.search || parsed.hash) return [];

  if (parsed.pathname === '/' || parsed.pathname === '') return ['index.html'];

  const pathname = parsed.pathname.replace(/^\/+/, '');

  if (pathname.endsWith('/')) {
    const cleanPath = pathname.replace(/\/+$/, '');
    if (!cleanPath) return ['index.html'];
    if (!isSafeSitemapHtmlPath(`${cleanPath}/index.html`)) return [];

    return [`${cleanPath}/index.html`];
  }

  if (!pathname.endsWith('.html')) return [];
  if (!isSafeSitemapHtmlPath(pathname)) return [];

  return [pathname];
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

function findLocalRefs(html) {
  const refs = [];
  const refRegex = /<(a|link|script|img|source|audio|video)\b[^>]*\b(href|src)\s*=\s*(["'])(.*?)\3[^>]*>/gi;
  let match;

  while ((match = refRegex.exec(html))) {
    const tag = match[1].toLowerCase();
    const attr = match[2].toLowerCase();
    const ref = match[4].trim();

    if (tag === 'link') {
      const tagText = match[0];
      const rel = extractAttr(tagText, 'rel').toLowerCase();
      if (rel === 'canonical') continue;
    }

    if (isExternalOrSpecialRef(ref)) continue;

    refs.push({ tag, attr, ref });
  }

  return refs;
}

function auditJsonLd(file, html, issues) {
  const ldRegex = /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = ldRegex.exec(html))) {
    const block = match[2].trim();

    if (!block) {
      issues.push(`${file}: empty JSON-LD block`);
      continue;
    }

    try {
      JSON.parse(block);
    } catch (err) {
      issues.push(`${file}: invalid JSON-LD (${err.message})`);
    }
  }
}

function audit() {
  const metadataIssues = [];
  const canonicalIssues = [];
  const sitemapIssues = [];
  const missingRefs = [];
  const jsonLdIssues = [];

  const rootHtmlFiles = listRequiredHtmlFiles();
  const htmlSet = new Set(rootHtmlFiles);
  const sitemapMappedFiles = new Set();

  if (fs.existsSync(SITEMAP_PATH)) {
    const sitemap = readText(SITEMAP_PATH);
    const sitemapUrls = parseSitemapUrls(sitemap);

    for (const url of sitemapUrls) {
      const sitemapHtmlFiles = htmlFilesFromSiteUrl(url);

      if (sitemapHtmlFiles.length === 0) {
        sitemapIssues.push(`sitemap URL is not a valid EdgeOverLuck HTML URL: ${url}`);
        continue;
      }

      const htmlFile = sitemapHtmlFiles.find((file) => fileExists(file));

      if (!htmlFile) {
        sitemapIssues.push(`sitemap URL does not map to a real HTML file: ${url}`);
        continue;
      }

      if (isIgnoredHtmlFile(htmlFile)) continue;

      const html = readText(path.join(ROOT, htmlFile));
      const canonicalHref = getCanonicalHref(html);
      if (canonicalHref !== url) {
        sitemapIssues.push(`${htmlFile}: sitemap URL ${url} does not match canonical ${canonicalHref || '(missing)'}`);
        continue;
      }

      sitemapMappedFiles.add(htmlFile);
      htmlSet.add(htmlFile);
    }
  }

  const htmlFiles = [...htmlSet].sort();

  for (const file of htmlFiles) {
    const html = readText(path.join(ROOT, file));

    if (!/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) {
      metadataIssues.push(`${file}: missing <title>`);
    }

    if (!hasMetaName(html, 'description')) {
      metadataIssues.push(`${file}: missing meta name="description"`);
    }

    if (!hasMetaName(html, 'robots')) {
      metadataIssues.push(`${file}: missing meta name="robots"`);
    }

    if (!/<h1\b[^>]*>/i.test(html)) {
      metadataIssues.push(`${file}: missing <h1>`);
    }

    const canonicalHref = getCanonicalHref(html);
    const canonicalReason = canonicalInvalidReason(canonicalHref, file);
    if (canonicalReason) {
      canonicalIssues.push(`${file}: ${canonicalReason}${canonicalHref ? ` (${canonicalHref})` : ''}`);
    }

    for (const item of findLocalRefs(html)) {
      const localPath = resolveLocalPath(file, item.ref);
      if (!localPath) continue;

      if (!fileExists(localPath)) {
        missingRefs.push(`${file}: missing ${item.tag}[${item.attr}] target "${item.ref}" -> ${localPath}`);
      }
    }

    auditJsonLd(file, html, jsonLdIssues);
  }

  if (!fs.existsSync(SITEMAP_PATH)) {
    sitemapIssues.push('sitemap.xml is missing');
  } else {
    for (const file of htmlFiles) {
      if (OPTIONAL_SITEMAP_HTML.has(file)) continue;

      if (!sitemapMappedFiles.has(file)) {
        sitemapIssues.push(`HTML page missing from sitemap.xml: ${file}`);
      }
    }
  }

  return {
    metadataIssues,
    canonicalIssues,
    sitemapIssues,
    missingRefs,
    jsonLdIssues,
  };
}

function printGroup(title, issues) {
  console.log(`\n${title}`);

  if (issues.length === 0) {
    console.log('  - none');
    return;
  }

  for (const issue of issues) {
    console.log(`  - ${issue}`);
  }
}

const result = audit();

printGroup('Metadata issues', result.metadataIssues);
printGroup('Canonical issues', result.canonicalIssues);
printGroup('Sitemap issues', result.sitemapIssues);
printGroup('Missing local references', result.missingRefs);
printGroup('JSON-LD issues', result.jsonLdIssues);

const failureCount =
  result.metadataIssues.length +
  result.canonicalIssues.length +
  result.sitemapIssues.length +
  result.missingRefs.length +
  result.jsonLdIssues.length;

if (failureCount > 0) {
  console.error(`\nSite audit failed with ${failureCount} issue(s).`);
  process.exit(1);
}

console.log('\nSite audit passed.');
