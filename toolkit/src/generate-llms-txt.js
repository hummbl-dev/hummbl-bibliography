#!/usr/bin/env node

/**
 * generate-llms-txt.js — Build llms.txt and llms-full.txt from canonical bibliography data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { main as generateUnifiedBibliography } from './generate-unified-bibliography.js';
import { THEMATIC_TIERS } from './build-scientific-grounding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const bibDir = path.join(rootDir, 'bibliography');
const distPath = path.join(rootDir, 'dist', 'unified-bibliography.json');
const outputTextPath = path.join(rootDir, 'llms.txt');
const outputFullPath = path.join(rootDir, 'llms-full.txt');

const KNOWN_HUMMBL_TAGS = new Set(['P', 'IN', 'CO', 'DE', 'RE', 'SY']);
const TIER_NAMES_BY_CODE = Object.fromEntries(
  Object.entries(THEMATIC_TIERS).map(([code, info]) => [code.toUpperCase(), info.name]),
);

export function resolveBibDir(baseDir = rootDir) {
  return path.resolve(baseDir, 'bibliography');
}

export function resolveTierLabel(tier, fallback = 'Unknown') {
  const normalized = String(tier || '').trim().toUpperCase();
  return TIER_NAMES_BY_CODE[normalized] || fallback;
}

function normalizeDoi(value) {
  if (!value) {
    return '';
  }
  return String(value).trim();
}

function formatAuthor(author) {
  if (!author) {
    return 'Unknown';
  }

  const firstAuthor = String(author).split(/ and /i)[0].trim();
  if (!firstAuthor) {
    return 'Unknown';
  }

  if (firstAuthor.includes(',')) {
    return firstAuthor.split(',')[0].trim();
  }

  const parts = firstAuthor.split(/\s+/);
  return parts[parts.length - 1];
}

function parseTransformations(entry) {
  const input = Array.isArray(entry.transformations) ? entry.transformations : [];
  const normalized = new Set();
  for (const raw of input) {
    const tag = String(raw).trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (KNOWN_HUMMBL_TAGS.has(tag)) {
      normalized.add(tag);
    }
  }
  return [...normalized].sort();
}

function buildTierIndex(entries) {
  const buckets = {};
  for (const entry of entries) {
    const tier = entry.tier || 'Unknown';
    if (!buckets[tier]) {
      buckets[tier] = [];
    }
    buckets[tier].push(entry);
  }
  return buckets;
}

function toTierNumber(value) {
  const match = /^T(\d+)/i.exec(String(value || ''));
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function sortTierCodes(a, b) {
  return toTierNumber(a) - toTierNumber(b);
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDistStale() {
  if (!fs.existsSync(distPath)) {
    return true;
  }

  if (!fs.existsSync(bibDir)) {
    throw new Error(`Bibliography directory not found: ${bibDir}`);
  }

  const distStat = fs.statSync(distPath);
  const bibFiles = fs.readdirSync(bibDir)
    .filter((name) => name.endsWith('.bib'))
    .map((name) => path.join(bibDir, name));

  if (bibFiles.length === 0) {
    return false;
  }

  const newestBibMs = Math.max(...bibFiles.map((file) => fs.statSync(file).mtimeMs));
  return newestBibMs > distStat.mtimeMs;
}

function loadUnified() {
  if (isDistStale()) {
    generateUnifiedBibliography();
  }

  const raw = fs.readFileSync(distPath, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data.entries)) {
    throw new Error('Invalid unified bibliography output: entries array missing.');
  }

  return data;
}

export function buildLlmsTextPayload(data) {
  const entries = [...data.entries].sort((a, b) => {
    if (a.tier !== b.tier) {
      return sortTierCodes(a.tier, b.tier);
    }
    return String(a.id).localeCompare(String(b.id));
  });

  const byTier = buildTierIndex(entries);
  const tiers = Object.keys(byTier).sort((a, b) => sortTierCodes(a, b));
  const now = new Date().toISOString().slice(0, 10);

  const lines = [];
  lines.push('# HUMMBL Bibliography — llms.txt');
  lines.push('# AI-readable index of the HUMMBL research bibliography.');
  lines.push(`# ${entries.length} entries across ${tiers.length} tiers. Last updated: ${now}.`);
  lines.push('#');
  lines.push('# Query API: node toolkit/src/query.js --keyword HUMMBL:P --format json');
  lines.push('# Direct DOI access: https://doi.org/{doi}');
  lines.push('#');
  lines.push('# HUMMBL keyword legend:');
  lines.push('#   HUMBL:P  Perspective / Identity');
  lines.push('#   HUMBL:IN Inversion');
  lines.push('#   HUMBL:CO Coordination / Composition');
  lines.push('#   HUMBL:DE Decomposition');
  lines.push('#   HUMBL:RE Recursion');
  lines.push('#   HUMBL:SY Synthesis / Systems');
  lines.push('');

  for (const tier of tiers) {
    const tierEntries = byTier[tier].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const tierLabel = resolveTierLabel(tier);
    lines.push(`## ${tier}: ${tierLabel} (${tierEntries.length} entries)`);
    lines.push('');

    for (const entry of tierEntries) {
      const author = formatAuthor(entry.author);
      const year = entry.year || '?';
      const doi = normalizeDoi(entry.doi);
      const identifier = doi ? `doi:${doi}` : 'no-doi';
      const title = normalizeText(entry.title || '');
      const tags = parseTransformations(entry).map((tag) => `HUMBL:${tag}`).join(' ') || 'none';

      lines.push(`- **${entry.id}** (${author}, ${year}) ${identifier}`);
      if (title) {
        lines.push(`  ${title}`);
      }
      lines.push(`  Keywords: ${tags}`);
      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}

export function buildLlmsFullPayload(data) {
  const entries = data.entries
    .map((entry) => ({
      id: entry.id,
      title: normalizeText(entry.title),
      author: normalizeText(entry.author),
      year: entry.year || '',
      tier: entry.tier || 'Unknown',
      tier_name: entry.tier_name || resolveTierLabel(entry.tier),
      doi: normalizeDoi(entry.doi) || null,
      abstract: normalizeText(entry.abstract),
      keywords: Array.isArray(entry.keywords) ? entry.keywords.map(normalizeText) : [],
      transformations: parseTransformations(entry),
      url: normalizeText(entry.url) || null,
    }))
    .sort((a, b) => {
      if (a.tier !== b.tier) {
        return sortTierCodes(a.tier, b.tier);
      }
      return a.id.localeCompare(b.id);
    });

  return {
    generated: new Date().toISOString(),
    entries,
  };
}

export function generateLlmsFiles(data) {
  return {
    txt: buildLlmsTextPayload(data),
    full: buildLlmsFullPayload(data),
  };
}

export default function main() {
  const data = loadUnified();
  const generated = generateLlmsFiles(data);
  fs.writeFileSync(outputTextPath, generated.txt, 'utf8');
  fs.writeFileSync(outputFullPath, `${JSON.stringify(generated.full, null, 2)}\n`, 'utf8');
}

if (process.argv[1] === __filename) {
  try {
    main();
    console.log('Generated llms.txt and llms-full.txt');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
