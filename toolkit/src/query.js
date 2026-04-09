#!/usr/bin/env node
/**
 * query.js — Programmatic query interface for the HUMMBL Bibliography
 *
 * Usage:
 *   node src/query.js [options]
 *
 * Options:
 *   --tier <T1|T2|...>        Filter by tier (repeatable)
 *   --keyword <HUMMBL:SY>     Filter by HUMMBL transformation keyword (repeatable)
 *   --search <text>           Full-text search over title + abstract
 *   --nist-function <GOVERN>  Filter by NIST AI RMF function tag
 *   --eu-ai-act <12>          Filter by EU AI Act article number
 *   --format <table|json|jsonl|markdown>  Output format (default: table)
 *   --limit <N>               Limit results (default: all)
 *   --count                   Print count only
 *
 * Examples:
 *   node src/query.js --tier T7 --format json
 *   node src/query.js --keyword HUMMBL:SY --format jsonl
 *   node src/query.js --search "governance receipt"
 *   node src/query.js --tier T4 --tier T11 --format markdown
 *   node src/query.js --count --keyword HUMMBL:BKI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Argument parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    bibDir: path.resolve(__dirname, '../../bibliography'),
    tiers: [],
    keywords: [],
    search: null,
    nistFunction: null,
    euAiAct: null,
    format: 'table',
    limit: null,
    count: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--tier') opts.tiers.push(args[++i]);
    else if (a === '--keyword') opts.keywords.push(args[++i]);
    else if (a === '--search') opts.search = args[++i];
    else if (a === '--nist-function') opts.nistFunction = args[++i];
    else if (a === '--eu-ai-act') opts.euAiAct = args[++i];
    else if (a === '--format') opts.format = args[++i];
    else if (a === '--limit') opts.limit = parseInt(args[++i], 10);
    else if (a === '--count') opts.count = true;
    else if (a === '--bib-dir') opts.bibDir = path.resolve(args[++i]);
    else if (!a.startsWith('-') && opts.tiers.length === 0 && !opts.search) {
      // Positional: treat as bib dir if it looks like a path
      if (fs.existsSync(a)) opts.bibDir = path.resolve(a);
    }
  }

  return opts;
}

// ── BibTeX parser (raw, no external deps) ────────────────────────────────────

function parseBibTeXFile(filePath, tier) {
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = [];

  // Match complete BibTeX entries
  const entryRegex = /@(\w+)\{([^,]+),([\s\S]*?)(?=\n@|\n*$)/g;
  let match;

  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1].toLowerCase();
    const key = match[2].trim();
    const body = match[3];

    if (type === 'comment' || type === 'string' || type === 'preamble') continue;

    const entry = { _key: key, _type: type, _tier: tier, _file: path.basename(filePath) };

    // Extract % No DOI available comments
    const noDoiMatch = body.match(/% No DOI available[^\n]*/);
    if (noDoiMatch) entry._no_doi_reason = noDoiMatch[0].replace('% No DOI available', '').replace(/^[\s\-–]+/, '').trim();

    // Extract fields: field = {value}, or field = "value"
    const fieldRegex = /^\s*(\w+)\s*=\s*\{([\s\S]*?)\}\s*,?\s*$/gm;
    let fm;
    while ((fm = fieldRegex.exec(body)) !== null) {
      const fieldName = fm[1].toLowerCase();
      const fieldValue = fm[2].trim();
      entry[fieldName] = fieldValue;
    }

    // Multi-line abstract cleanup
    if (entry.abstract) {
      entry.abstract = entry.abstract.replace(/\s+/g, ' ').trim();
    }

    entries.push(entry);
  }

  return entries;
}

function loadBibliography(bibDir) {
  const bibFiles = fs.readdirSync(bibDir)
    .filter(f => f.endsWith('.bib'))
    .sort();

  const allEntries = [];

  for (const file of bibFiles) {
    // Derive tier from filename: T1_canonical.bib → T1
    const tierMatch = file.match(/^(T\d+)/);
    const tier = tierMatch ? tierMatch[1] : 'Unknown';
    const entries = parseBibTeXFile(path.join(bibDir, file), tier);
    allEntries.push(...entries);
  }

  return allEntries;
}

// ── Filtering ─────────────────────────────────────────────────────────────────

function applyFilters(entries, opts) {
  let results = entries;

  if (opts.tiers.length > 0) {
    results = results.filter(e => opts.tiers.includes(e._tier));
  }

  if (opts.keywords.length > 0) {
    results = results.filter(e => {
      const kw = (e.keywords || '').toLowerCase();
      return opts.keywords.every(k => kw.includes(k.toLowerCase()));
    });
  }

  if (opts.search) {
    const terms = opts.search.toLowerCase().split(/\s+/);
    results = results.filter(e => {
      const haystack = [
        e.title || '',
        e.abstract || '',
        e.keywords || '',
        e.author || '',
        e._key || '',
      ].join(' ').toLowerCase();
      return terms.every(t => haystack.includes(t));
    });
  }

  if (opts.nistFunction) {
    results = results.filter(e => {
      const nf = (e.nist_functions || '').toUpperCase();
      return nf.includes(opts.nistFunction.toUpperCase());
    });
  }

  if (opts.euAiAct) {
    results = results.filter(e => {
      const eua = e.eu_ai_act_articles || '';
      return eua.includes(String(opts.euAiAct));
    });
  }

  if (opts.limit) {
    results = results.slice(0, opts.limit);
  }

  return results;
}

// ── Output formatters ─────────────────────────────────────────────────────────

function formatTable(entries) {
  if (entries.length === 0) {
    console.log('No results.');
    return;
  }

  const cols = ['_key', '_tier', 'title', 'author', 'year'];
  const widths = { _key: 30, _tier: 4, title: 55, author: 25, year: 4 };

  const pad = (s, n) => String(s || '').slice(0, n).padEnd(n);
  const header = cols.map(c => pad(c === '_key' ? 'KEY' : c === '_tier' ? 'TIER' : c.toUpperCase(), widths[c])).join('  ');
  const sep = cols.map(c => '-'.repeat(widths[c])).join('  ');

  console.log(header);
  console.log(sep);
  for (const e of entries) {
    console.log(cols.map(c => pad(e[c], widths[c])).join('  '));
  }
  console.log(`\n${entries.length} result${entries.length !== 1 ? 's' : ''}`);
}

function formatJson(entries) {
  const out = entries.map(e => ({
    key: e._key,
    tier: e._tier,
    type: e._type,
    title: e.title,
    author: e.author,
    year: e.year,
    doi: e.doi || null,
    isbn: e.isbn || null,
    url: e.url || null,
    abstract: e.abstract,
    keywords: e.keywords,
    nist_functions: e.nist_functions || null,
    eu_ai_act_articles: e.eu_ai_act_articles || null,
  }));
  console.log(JSON.stringify(out, null, 2));
}

function formatJsonl(entries) {
  for (const e of entries) {
    console.log(JSON.stringify({
      key: e._key,
      tier: e._tier,
      type: e._type,
      title: e.title,
      author: e.author,
      year: e.year,
      doi: e.doi || null,
      abstract: e.abstract,
      keywords: e.keywords,
    }));
  }
}

function formatMarkdown(entries) {
  if (entries.length === 0) {
    console.log('*No results.*');
    return;
  }

  console.log(`| Key | Tier | Title | Year | DOI |`);
  console.log(`|-----|------|-------|------|-----|`);
  for (const e of entries) {
    const doi = e.doi ? `[↗](https://doi.org/${e.doi})` : '—';
    const title = (e.title || '').slice(0, 60).replace(/\|/g, '\\|');
    console.log(`| \`${e._key}\` | ${e._tier} | ${title} | ${e.year || '?'} | ${doi} |`);
  }
  console.log(`\n*${entries.length} result${entries.length !== 1 ? 's' : ''}*`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv);

  if (!fs.existsSync(opts.bibDir)) {
    console.error(`Bibliography directory not found: ${opts.bibDir}`);
    process.exit(1);
  }

  const all = loadBibliography(opts.bibDir);
  const results = applyFilters(all, opts);

  if (opts.count) {
    console.log(results.length);
    return;
  }

  switch (opts.format) {
    case 'json':      formatJson(results);     break;
    case 'jsonl':     formatJsonl(results);    break;
    case 'markdown':  formatMarkdown(results); break;
    default:          formatTable(results);    break;
  }
}

main();
