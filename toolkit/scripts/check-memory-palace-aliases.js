#!/usr/bin/env node
/**
 * check-memory-palace-aliases.js
 *
 * Pre-commit guard for toolkit/src/extensions/memoryPalace.ts.
 * Detects lowercase key collisions between canonical_name and aliases
 * WITHOUT requiring a TypeScript build step.
 *
 * The TypeScript runtime (`buildLookupMap`) throws on collision but only
 * fires at import time — i.e. only after `npm run build`. This script
 * catches the same class of error from raw source text, enabling a fast
 * pre-commit check.
 *
 * Exit codes:
 *   0  — no collisions found
 *   1  — one or more collisions detected (printed to stderr)
 *   2  — memoryPalace.ts not found or unreadable
 *
 * Usage:
 *   node toolkit/scripts/check-memory-palace-aliases.js
 *   node toolkit/scripts/check-memory-palace-aliases.js --path path/to/memoryPalace.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveMemoryPalacePath(args) {
  const flagIdx = args.indexOf('--path');
  if (flagIdx !== -1 && args[flagIdx + 1]) {
    return path.resolve(args[flagIdx + 1]);
  }
  // Default: relative to this script's location (toolkit/scripts/ → toolkit/src/extensions/)
  return path.resolve(__dirname, '../src/extensions/memoryPalace.ts');
}

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract the value of a string literal (single or double quoted).
 * Returns the unescaped content between quotes, or null if not a string literal.
 */
function extractStringValue(raw) {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return null;
}

/**
 * Parse memoryPalace.ts source and return an array of entry descriptors:
 *   { slug, canonical_name, aliases }
 *
 * Strategy: scan for `canonical_name:` and `aliases:` fields inside each
 * object literal. Uses line-by-line parsing rather than a full AST to
 * avoid a build-time dependency on a TS parser.
 */
function parseEntries(source) {
  const lines = source.split('\n');
  const entries = [];
  let currentEntry = null;
  let inAliasesArray = false;
  let aliasBuffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of a new entry object (slug field is always first)
    const slugMatch = line.match(/^\s+slug:\s*(['"])(.*?)\1/);
    if (slugMatch) {
      // Save previous entry if complete
      if (currentEntry && currentEntry.canonical_name) {
        entries.push(currentEntry);
      }
      currentEntry = { slug: slugMatch[2], canonical_name: null, aliases: [] };
      inAliasesArray = false;
      aliasBuffer = '';
      continue;
    }

    if (!currentEntry) continue;

    // Detect canonical_name field
    const canonMatch = line.match(/^\s+canonical_name:\s*(.+)/);
    if (canonMatch) {
      const val = extractStringValue(canonMatch[1].replace(/,$/, '').trim());
      if (val !== null) currentEntry.canonical_name = val;
      continue;
    }

    // Detect start of aliases array (may be multiline)
    const aliasesStartMatch = line.match(/^\s+aliases:\s*\[(.*)$/);
    if (aliasesStartMatch) {
      const rest = aliasesStartMatch[1];
      if (rest.includes(']')) {
        // Single-line aliases: [...]
        const inner = rest.slice(0, rest.indexOf(']'));
        currentEntry.aliases = extractAliasesFromInner(inner);
      } else {
        // Multiline: accumulate until closing ]
        inAliasesArray = true;
        aliasBuffer = rest;
      }
      continue;
    }

    // Continuation of multiline aliases array
    if (inAliasesArray) {
      if (line.includes(']')) {
        aliasBuffer += line.slice(0, line.indexOf(']'));
        currentEntry.aliases = extractAliasesFromInner(aliasBuffer);
        inAliasesArray = false;
        aliasBuffer = '';
      } else {
        aliasBuffer += line;
      }
    }
  }

  // Flush last entry
  if (currentEntry && currentEntry.canonical_name) {
    entries.push(currentEntry);
  }

  return entries;
}

/**
 * Given the inner content of an aliases array (between [ and ]), extract all
 * string values. Handles both 'single' and "double" quoted strings, including
 * strings containing apostrophes like "Occam's razor".
 */
function extractAliasesFromInner(inner) {
  const aliases = [];
  // Match both 'single quoted' and "double quoted" strings
  // Use a regex that handles apostrophes inside double-quoted strings
  const stringRe = /'([^']*)'|"([^"]*)"/g;
  let m;
  while ((m = stringRe.exec(inner)) !== null) {
    aliases.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return aliases;
}

// ---------------------------------------------------------------------------
// Collision detection
// ---------------------------------------------------------------------------

/**
 * Build a lowercase lookup map and detect collisions.
 * Returns an array of collision descriptors:
 *   { key, first: {slug, field, value}, second: {slug, field, value} }
 */
function detectCollisions(entries) {
  const map = new Map(); // lowercase key → {slug, field, value}
  const collisions = [];

  for (const entry of entries) {
    const allNames = [
      { field: 'canonical_name', value: entry.canonical_name },
      ...entry.aliases.map(a => ({ field: 'alias', value: a })),
    ];

    for (const { field, value } of allNames) {
      const key = value.toLowerCase();
      if (map.has(key)) {
        collisions.push({
          key,
          first: map.get(key),
          second: { slug: entry.slug, field, value },
        });
      } else {
        map.set(key, { slug: entry.slug, field, value });
      }
    }
  }

  return collisions;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const filePath = resolveMemoryPalacePath(args);

  if (!fs.existsSync(filePath)) {
    process.stderr.write(`ERROR: memoryPalace.ts not found at: ${filePath}\n`);
    process.exit(2);
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const entries = parseEntries(source);
  const collisions = detectCollisions(entries);

  if (collisions.length === 0) {
    process.stdout.write(`✓ Memory Palace: ${entries.length} entries, no alias collisions\n`);
    process.exit(0);
  }

  process.stderr.write(`✗ Memory Palace alias collision(s) detected:\n\n`);
  for (const c of collisions) {
    process.stderr.write(
      `  Key: "${c.key}"\n` +
      `    → ${c.first.field} "${c.first.value}" (slug: ${c.first.slug})\n` +
      `    → ${c.second.field} "${c.second.value}" (slug: ${c.second.slug})\n\n`
    );
  }
  process.stderr.write(
    `Fix: remove the redundant alias or rename the canonical_name.\n` +
    `See: toolkit/src/extensions/memoryPalace.ts\n`
  );
  process.exit(1);
}

main();
