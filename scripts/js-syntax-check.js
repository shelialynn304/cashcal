#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build']);
const jsFiles = [];

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        continue;
      }
      walkDirectory(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      jsFiles.push(fullPath);
    }
  }
}

function checkSyntax(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    encoding: 'utf8'
  });

  return {
    ok: result.status === 0,
    stderr: result.stderr ? result.stderr.trim() : '',
    stdout: result.stdout ? result.stdout.trim() : ''
  };
}

walkDirectory(repoRoot);
jsFiles.sort();

console.log(`Found ${jsFiles.length} JavaScript files to check.`);

const failures = [];

for (const filePath of jsFiles) {
  const relativePath = path.relative(repoRoot, filePath);
  console.log(`Checking: ${relativePath}`);

  const result = checkSyntax(filePath);
  if (!result.ok) {
    failures.push({ file: relativePath, error: result.stderr || result.stdout || 'Unknown syntax error.' });
  }
}

if (failures.length > 0) {
  console.error('\nSyntax check failed for the following files:');
  for (const failure of failures) {
    console.error(`- ${failure.file}`);
    console.error(failure.error);
    console.error('');
  }
  process.exit(1);
}

console.log('\nAll JavaScript files passed syntax check.');
process.exit(0);
