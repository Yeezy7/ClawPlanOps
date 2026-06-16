#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACK_CACHE = '/private/tmp/claw-planops-npm-cache';

function run(label, command, args, options = {}) {
  process.stdout.write(`\n==> ${label}\n`);
  return execFileSync(command, args, {
    cwd: ROOT,
    stdio: options.capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function checkToolExports() {
  process.stdout.write('\n==> Check OpenClaw tool exports\n');
  const manifestPath = path.join(ROOT, 'openclaw.plugin.json');
  const distEntry = path.join(ROOT, 'dist', 'index.js');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const plugin = require(distEntry);

  const tools = manifest.contracts?.tools ?? [];
  const missing = tools.filter((name) => typeof plugin[name] !== 'function');

  assert(tools.length >= 6, `Expected at least 6 OpenClaw tools, got ${tools.length}`);
  assert(missing.length === 0, `Missing tool exports: ${missing.join(', ')}`);
  assert(plugin.default, 'Missing default plugin entry');
  assert(typeof plugin.register === 'function', 'Missing register() export');

  process.stdout.write(`OK: ${tools.length} tools exported\n`);
}

function checkPackContents() {
  process.stdout.write('\n==> Check package dry-run contents\n');
  const raw = run(
    'npm pack dry-run',
    'npm',
    ['pack', '--dry-run', '--json', '--cache', PACK_CACHE],
    { capture: true }
  );
  const packs = JSON.parse(raw);
  const files = new Set((packs[0]?.files ?? []).map((f) => f.path));

  const required = [
    'package.json',
    'README.md',
    'CHANGELOG.md',
    'DELIVERY.md',
    'LICENSE',
    'openclaw.plugin.json',
    'dist/index.js',
    'dist/cli.js',
    'skills/claw-planops/SKILL.md',
  ];
  const forbiddenPrefixes = ['src/', 'tests/', 'examples/', 'output/', 'node_modules/'];

  const missing = required.filter((file) => !files.has(file));
  const forbidden = [...files].filter((file) =>
    forbiddenPrefixes.some((prefix) => file.startsWith(prefix))
  );

  assert(missing.length === 0, `Package is missing files: ${missing.join(', ')}`);
  assert(forbidden.length === 0, `Package includes forbidden files: ${forbidden.join(', ')}`);

  process.stdout.write(`OK: ${files.size} package files checked\n`);
}

function main() {
  run('TypeScript typecheck', 'npm', ['run', 'typecheck']);
  run('Unit tests', 'npm', ['test']);
  run('Build dist', 'npm', ['run', 'build']);
  checkToolExports();
  checkPackContents();
  process.stdout.write('\nDelivery check passed.\n');
}

try {
  main();
} catch (err) {
  process.stderr.write(`\nDelivery check failed: ${err.message}\n`);
  process.exit(1);
}
