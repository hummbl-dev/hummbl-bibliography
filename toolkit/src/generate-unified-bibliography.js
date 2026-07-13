#!/usr/bin/env node

/**
 * generate-unified-bibliography.js — Build dist/unified-bibliography.json
 *
 * Parses all BibTeX sources in bibliography/ and emits a single normalized
 * JSON export with tier metadata, HUMMBL transformation tags, and keyword
 * separation.  This is the canonical regeneration path for the unified
 * bibliography consumed by build-scientific-grounding.js.
 *
 * Uses the same BibTeX parser and normalization helpers as
 * build-scientific-grounding.js to guarantee parity with the grounding
 * validation gate.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

import {
  parseBibEntriesFromFile,
  normalizeAuthor,
  normalizeYear,
  normalizeKeywordTags,
  normalizeTransformationTags,
  normalizeKeywordList,
  tierFromFile,
  asString,
  pickField,
  THEMATIC_TIERS,
  BIBLIOGRAPHY_DIR,
} from './build-scientific-grounding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..', '..');
const outputPath = path.join(rootDir, 'dist', 'unified-bibliography.json');

const TRANSFORMATION_FAMILIES = {
  P: 'Perspective / Identity',
  IN: 'Inversion',
  CO: 'Composition',
  DE: 'Decomposition',
  RE: 'Recursion',
  SY: 'Meta-Systems',
};

const OPTIONAL_FIELDS = [
  'journal', 'booktitle', 'publisher', 'editor',
  'volume', 'number', 'pages', 'doi', 'isbn', 'url', 'note', 'address',
];

function buildUnifiedEntry(parsedEntry, tier, tierName) {
  const fields = parsedEntry.fields;
  const keywordValue = pickField(fields, ['keywords', 'keyword', 'keyw']);
  const keywords = normalizeKeywordTags(keywordValue);
  const transformations = normalizeTransformationTags(keywordValue, pickField(fields, ['transformations']));

  const entry = {
    id: parsedEntry.id,
    type: asString(parsedEntry.type).toLowerCase(),
    tier,
    tier_name: tierName,
    title: asString(pickField(fields, ['title'])),
    author: normalizeAuthor(pickField(fields, ['author'])),
    year: normalizeYear(pickField(fields, ['year']), fields),
    abstract: asString(pickField(fields, ['abstract'])),
    keywords,
    transformations,
  };

  for (const field of OPTIONAL_FIELDS) {
    const val = asString(pickField(fields, [field]));
    if (val) entry[field] = val;
  }

  return entry;
}

function main() {
  if (!fs.existsSync(BIBLIOGRAPHY_DIR)) {
    console.error(`Bibliography directory not found: ${BIBLIOGRAPHY_DIR}`);
    process.exit(1);
  }

  const bibFiles = fs.readdirSync(BIBLIOGRAPHY_DIR).filter(f => f.endsWith('.bib')).sort();

  if (bibFiles.length === 0) {
    console.error(`No .bib files found in ${BIBLIOGRAPHY_DIR}`);
    process.exit(1);
  }

  const entries = [];
  const seenIds = new Set();

  for (const file of bibFiles) {
    const filePath = path.join(BIBLIOGRAPHY_DIR, file);
    const tier = tierFromFile(file);
    const tierName = (THEMATIC_TIERS[tier] && THEMATIC_TIERS[tier].name) || 'Unknown';

    const parsed = parseBibEntriesFromFile(filePath);

    for (const parsedEntry of parsed) {
      const entry = buildUnifiedEntry(parsedEntry, tier, tierName);
      if (!entry.id) {
        console.error(`Entry without id in ${file}`);
        process.exit(1);
      }
      if (seenIds.has(entry.id)) {
        console.error(`Duplicate citation key ${entry.id} found in ${file}`);
        process.exit(1);
      }
      seenIds.add(entry.id);
      entries.push(entry);
    }
  }

  entries.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier.localeCompare(b.tier);
    return a.id.localeCompare(b.id);
  });

  const tiersMap = {};
  for (const [code, info] of Object.entries(THEMATIC_TIERS)) {
    tiersMap[code] = info.name;
  }

  const output = {
    version: '1.0.0',
    tiers: tiersMap,
    transformation_families: { ...TRANSFORMATION_FAMILIES },
    entries,
  };

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
  console.log(`  ${entries.length} entries across ${bibFiles.length} tiers`);
}

const isScript = process.argv[1] === __filename;
if (isScript) {
  main();
}

export { main, buildUnifiedEntry };
