#!/usr/bin/env node

/**
 * watch.js — File watcher for bibliography validation
 * Runs validate.js on any .bib file change using Node stdlib fs.watch
 * No third-party dependencies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const bibDir = path.resolve(args[0] || '../bibliography');
const validateScript = path.resolve(__dirname, 'validate.js');

const DEBOUNCE_MS = 300;

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function log(msg) {
  console.log(`[watch ${timestamp()}] ${msg}`);
}

function validateFile(filePath) {
  const rel = path.relative(bibDir, filePath);
  log(`${rel} changed — validating...`);
  const result = spawnSync('node', [validateScript, bibDir], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status === 0) {
    const lines = (result.stdout || '').trim().split('\n');
    const summary = lines.filter(l => l.trim()).pop() || '';
    log(`✓ ${rel} — ${summary}`);
  } else {
    const output = (result.stdout || '') + (result.stderr || '');
    const lines = output.trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`  ${line}`);
    });
    log(`✗ ${rel} — validation failed (see errors above)`);
  }
}

// Debounce map: filePath -> timeout handle
const debounceMap = new Map();

function debounced(filePath) {
  if (debounceMap.has(filePath)) {
    clearTimeout(debounceMap.get(filePath));
  }
  debounceMap.set(filePath, setTimeout(() => {
    debounceMap.delete(filePath);
    validateFile(filePath);
  }, DEBOUNCE_MS));
}

// Check bibDir exists
if (!fs.existsSync(bibDir)) {
  console.error(`[watch] Bibliography directory not found: ${bibDir}`);
  process.exit(1);
}

log(`Watching ${bibDir}`);
log(`Press Ctrl+C to stop\n`);

// Run initial validation
spawnSync('node', [validateScript, bibDir], { stdio: 'inherit' });

// Watch all .bib files
const bibFiles = fs.readdirSync(bibDir).filter(f => f.endsWith('.bib'));
bibFiles.forEach(file => {
  const fullPath = path.join(bibDir, file);
  fs.watch(fullPath, (eventType) => {
    if (eventType === 'change') debounced(fullPath);
  });
});

// Also watch dir for new .bib files
fs.watch(bibDir, (eventType, filename) => {
  if (filename && filename.endsWith('.bib')) {
    const fullPath = path.join(bibDir, filename);
    if (fs.existsSync(fullPath)) {
      debounced(fullPath);
    }
  }
});

// Keep process alive
process.on('SIGINT', () => {
  log('Stopping watcher.');
  process.exit(0);
});
