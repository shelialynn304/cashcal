#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs/promises');
const { spawn } = require('node:child_process');
const { chromium } = require('@playwright/test');

const ROOT_DIR = process.cwd();
const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'test-results', 'screenshots');

const PAGES = [
  'index.html',
  'roulette.html',
  'roulette-calculator.html',
  'roulette-strategy-simulator.html',
  'roulette-simulator.html',
  'blackjack-game.html',
  'slot-simulator.html',
  'horse-racing-guide.html',
];

const IGNORED_ERROR_PATTERNS = [
  'litlyx',
  'googletagmanager',
  'google-analytics',
  'google analytics',
  'jsdelivr',
  'chart.js',
  'favicon',
  'analytics',
  'failed to load resource',
  'net::err_',
];

function shouldIgnoreError(text) {
  const lower = text.toLowerCase();
  return IGNORED_ERROR_PATTERNS.some((pattern) => lower.includes(pattern));
}

function startStaticServer() {
  const serverProcess = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', HOST], {
    cwd: ROOT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return new Promise((resolve, reject) => {
    let settled = false;

    const onData = (chunk) => {
      const text = chunk.toString();
      if (!settled && text.includes(`Serving HTTP on ${HOST} port ${PORT}`)) {
        settled = true;
        resolve(serverProcess);
      }
    };

    serverProcess.stdout.on('data', onData);
    serverProcess.stderr.on('data', onData);

    serverProcess.on('exit', (code) => {
      if (!settled) {
        reject(new Error(`Static server exited before startup (code ${code}).`));
      }
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Timed out starting static server.'));
      }
    }, 10000);
  });
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.killed) return;

  await new Promise((resolve) => {
    serverProcess.once('exit', () => resolve());
    serverProcess.kill('SIGTERM');

    setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 3000);
  });
}

async function run() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  let serverProcess;
  let browser;
  const failures = [];

  try {
    serverProcess = await startStaticServer();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    for (const pagePath of PAGES) {
      const pageUrl = `${BASE_URL}/${pagePath}`;
      const page = await context.newPage();
      const pageErrors = [];

      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;

        const text = msg.text() || '';
        if (!shouldIgnoreError(text)) {
          pageErrors.push(`Console error: ${text}`);
        }
      });

      page.on('pageerror', (error) => {
        const text = error?.message || String(error);
        if (!shouldIgnoreError(text)) {
          pageErrors.push(`Page error: ${text}`);
        }
      });

      page.on('requestfailed', (request) => {
        const failureText = request.failure()?.errorText || 'Request failed';
        const message = `${failureText} ${request.url()}`;
        if (!shouldIgnoreError(message)) {
          pageErrors.push(`Request failed: ${message}`);
        }
      });

      try {
        const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!response || !response.ok()) {
          const status = response ? response.status() : 'no response';
          pageErrors.push(`Navigation failed with status: ${status}`);
        }

        await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });

        const hasMeaningfulText = await page.evaluate(() => {
          const text = document.body?.innerText || '';
          return text.replace(/\s+/g, ' ').trim().length >= 40;
        });

        if (!hasMeaningfulText) {
          pageErrors.push('Body text content is too short to be meaningful.');
        }
      } catch (error) {
        pageErrors.push(`Smoke check exception: ${error.message}`);
      }

      const screenshotName = pagePath.replace(/\.html$/, '').replace(/[^a-z0-9-_]/gi, '_');
      const screenshotPath = path.join(SCREENSHOT_DIR, `${screenshotName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      if (pageErrors.length > 0) {
        failures.push({ page: pagePath, errors: pageErrors });
      }

      await page.close();
    }

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopServer(serverProcess);
  }

  if (failures.length > 0) {
    console.error('Browser smoke test failures detected:\n');
    for (const failure of failures) {
      console.error(`- ${failure.page}`);
      for (const error of failure.errors) {
        console.error(`  • ${error}`);
      }
    }
    process.exit(1);
  }

  console.log(`Browser smoke test passed for ${PAGES.length} pages.`);
}

run().catch((error) => {
  console.error('Fatal browser smoke test error:', error);
  process.exit(1);
});
