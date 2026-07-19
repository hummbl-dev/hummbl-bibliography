// lib.mjs — Harness utility functions for overnight bibliography expansion
// v2: adds pre-flight duplicate detection, dry-run mode, stats, rollback
import fs from 'fs';
import { execSync } from 'child_process';

const REPO = 'C:\\Users\\Owner\\PROJECTS\\hummbl-bibliography';
const LOG_FILE = `${REPO}\\harness\\overnight-log.md`;

export function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ============================================================
// PRE-FLIGHT DUPLICATE DETECTION
// Checks new entries against existing bibliography before appending
// ============================================================

function loadExistingKeys() {
  const bibDir = `${REPO}\\bibliography`;
  const files = fs.readdirSync(bibDir).filter(f => f.endsWith('.bib'));
  const keys = new Set();
  const titles = new Map(); // lowercase title -> key
  const dois = new Map();   // doi -> key
  const isbns = new Map();  // isbn -> key

  for (const file of files) {
    const content = fs.readFileSync(`${bibDir}\\${file}`, 'utf8');
    // Match entry keys
    const entryRegex = /@(\w+)\{([^,]+),/g;
    let match;
    while ((match = entryRegex.exec(content)) !== null) {
      keys.add(match[2].trim());
    }
    // Match titles
    const titleRegex = /title\s*=\s*\{([^}]+)\}/g;
    while ((match = titleRegex.exec(content)) !== null) {
      const title = match[1].trim().toLowerCase().replace(/[{}]/g, '');
      titles.set(title, file);
    }
    // Match DOIs
    const doiRegex = /doi\s*=\s*\{([^}]+)\}/g;
    while ((match = doiRegex.exec(content)) !== null) {
      dois.set(match[1].trim().toLowerCase(), file);
    }
    // Match ISBNs
    const isbnRegex = /isbn\s*=\s*\{([^}]+)\}/g;
    while ((match = isbnRegex.exec(content)) !== null) {
      isbns.set(match[1].trim().replace(/[-\s]/g, ''), file);
    }
  }
  return { keys, titles, dois, isbns };
}

export function preflightCheck(entries) {
  const existing = loadExistingKeys();
  const conflicts = [];

  for (const e of entries) {
    // Check citation key
    if (existing.keys.has(e.key)) {
      conflicts.push({ key: e.key, type: 'CITATION_KEY', detail: `Key "${e.key}" already exists` });
    }
    // Check title (case-insensitive)
    const titleLower = (typeof e.title === 'string' ? e.title : e.title.raw || '').toLowerCase().replace(/[{}]/g, '');
    if (titleLower && existing.titles.has(titleLower)) {
      conflicts.push({ key: e.key, type: 'TITLE', detail: `Title matches existing entry in ${existing.titles.get(titleLower)}` });
    }
    // Check DOI
    if (e.doi) {
      const doiLower = e.doi.toLowerCase();
      if (existing.dois.has(doiLower)) {
        conflicts.push({ key: e.key, type: 'DOI', detail: `DOI "${e.doi}" matches existing entry in ${existing.dois.get(doiLower)}` });
      }
    }
    // Check ISBN
    if (e.isbn) {
      const isbnClean = e.isbn.replace(/[-\s]/g, '');
      if (existing.isbns.has(isbnClean)) {
        conflicts.push({ key: e.key, type: 'ISBN', detail: `ISBN "${e.isbn}" matches existing entry in ${existing.isbns.get(isbnClean)}` });
      }
    }
  }

  // Also check for intra-batch duplicates
  const batchKeys = new Set();
  const batchTitles = new Set();
  const batchDois = new Set();
  for (const e of entries) {
    if (batchKeys.has(e.key)) {
      conflicts.push({ key: e.key, type: 'BATCH_KEY', detail: `Key "${e.key}" duplicated within batch` });
    }
    batchKeys.add(e.key);

    const titleLower = (typeof e.title === 'string' ? e.title : e.title.raw || '').toLowerCase().replace(/[{}]/g, '');
    if (titleLower && batchTitles.has(titleLower)) {
      conflicts.push({ key: e.key, type: 'BATCH_TITLE', detail: `Title duplicated within batch` });
    }
    batchTitles.add(titleLower);

    if (e.doi) {
      const doiLower = e.doi.toLowerCase();
      if (batchDois.has(doiLower)) {
        conflicts.push({ key: e.key, type: 'BATCH_DOI', detail: `DOI duplicated within batch` });
      }
      batchDois.add(doiLower);
    }
  }

  return conflicts;
}

// ============================================================
// ENTRY APPENDING
// ============================================================

export function appendEntries(entries) {
  for (const e of entries) {
    const filepath = `${REPO}\\bibliography\\${e.file}`;
    let content = fs.readFileSync(filepath, 'utf8');
    let bib = `\n@${e.type}{${e.key},\n`;
    bib += `  title     = {${e.title}},\n`;
    bib += `  author    = {${e.author}},\n`;
    bib += `  year      = {${e.year}},\n`;
    if (e.journal) bib += `  journal   = {${e.journal}},\n`;
    if (e.volume) bib += `  volume    = {${e.volume}},\n`;
    if (e.number) bib += `  number    = {${e.number}},\n`;
    if (e.pages) bib += `  pages     = {${e.pages}},\n`;
    if (e.publisher) bib += `  publisher = {${e.publisher}},\n`;
    if (e.address) bib += `  address   = {${e.address}},\n`;
    if (e.edition) bib += `  edition   = {${e.edition}},\n`;
    if (e.booktitle) bib += `  booktitle = {${e.booktitle}},\n`;
    if (e.howpublished) bib += `  howpublished = {${e.howpublished}},\n`;
    if (e.url) bib += `  url       = {${e.url}},\n`;
    if (e.doi) {
      bib += `  doi       = {${e.doi}},\n`;
    } else if (e.doi_unavailable) {
      bib += `  doi-unavailable = {${e.doi_unavailable}},\n`;
    }
    if (e.isbn) bib += `  isbn      = {${e.isbn}},\n`;
    if (e.isbn_unavailable) bib += `  isbn-unavailable = {${e.isbn_unavailable}},\n`;
    bib += `  abstract  = {${e.abstract}},\n`;
    bib += `  keywords  = {${e.keywords}},\n`;
    if (e.nist_functions) bib += `  nist_functions     = {${e.nist_functions}},\n`;
    if (e.eu_ai_act_articles) bib += `  eu_ai_act_articles = {${e.eu_ai_act_articles}},\n`;
    bib += `}\n`;
    content = content.trimEnd() + '\n' + bib;
    fs.writeFileSync(filepath, content, 'utf8');
    log(`  Appended ${e.key} to ${e.file}`);
  }
}

// ============================================================
// ROLLBACK — revert uncommitted bibliography changes
// ============================================================

export function rollback() {
  try {
    execSync('git checkout -- bibliography/ dist/', { cwd: REPO, encoding: 'utf8', timeout: 10000 });
    log('  Rolled back uncommitted changes');
    return true;
  } catch (err) {
    log(`  Rollback FAILED: ${err.message}`);
    return false;
  }
}

// ============================================================
// VALIDATION
// ============================================================

export function runValidate() {
  try {
    const out = execSync('npm run validate 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 60000 });
    const errors = (out.match(/Errors:\s*(\d+)/i) || [])[1] || '?';
    const warnings = (out.match(/Warnings:\s*(\d+)/i) || [])[1] || '?';
    log(`  Validation: ${errors} errors, ${warnings} warnings`);
    return { errors: parseInt(errors), warnings: parseInt(warnings), output: out };
  } catch (err) {
    log(`  Validation FAILED: ${err.message}`);
    return { errors: -1, warnings: -1, output: err.stdout || err.message };
  }
}

export function runCheckDups() {
  try {
    const out = execSync('npm run check-dups 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 30000 });
    const hasDups = /duplicate/i.test(out) && !/no duplicate/i.test(out);
    log(`  Duplicates: ${hasDups ? 'FOUND' : 'none'}`);
    return !hasDups;
  } catch (err) {
    log(`  Dup check FAILED: ${err.message}`);
    return false;
  }
}

// ============================================================
// DIST REGENERATION
// ============================================================

export function regenerateDist() {
  try {
    execSync('npm run generate-unified 2>&1', { cwd: `${REPO}\\toolkit`, encoding: 'utf8', timeout: 30000 });
    execSync('npm run grounding:build 2>&1', { cwd: `${REPO}\\toolkit`, encoding: 'utf8', timeout: 30000 });
    log('  Dist regenerated');
    return true;
  } catch (err) {
    log(`  Dist regen FAILED: ${err.message}`);
    return false;
  }
}

// ============================================================
// TESTS
// ============================================================

export function runTests() {
  try {
    const out = execSync('npm --prefix toolkit test 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    const pass = (out.match(/# pass\s*(\d+)/) || [])[1] || '?';
    const fail = (out.match(/# fail\s*(\d+)/) || [])[1] || '?';
    log(`  Tests: ${pass} pass, ${fail} fail`);
    return parseInt(fail) === 0;
  } catch (err) {
    const out = err.stdout || err.message;
    const fail = (out.match(/# fail\s*(\d+)/) || [])[1] || '?';
    log(`  Tests FAILED: ${fail} failures`);
    return false;
  }
}

// ============================================================
// STATS — generate tier counts after batch
// ============================================================

export function generateStats() {
  const bibDir = `${REPO}\\bibliography`;
  const files = fs.readdirSync(bibDir).filter(f => f.endsWith('.bib')).sort();
  let total = 0;
  const stats = [];
  for (const file of files) {
    const content = fs.readFileSync(`${bibDir}\\${file}`, 'utf8');
    const count = (content.match(/@\w+\{/g) || []).length;
    total += count;
    const below = count < 20 ? ' <<<' : '';
    stats.push(`  ${file}: ${count}${below}`);
  }
  stats.push(`  TOTAL: ${total}`);
  return stats.join('\n');
}

// ============================================================
// GIT OPERATIONS
// ============================================================

export function gitCommit(msg) {
  try {
    execSync('git add bibliography/ dist/', { cwd: REPO, encoding: 'utf8', timeout: 10000 });
    execSync(`git commit -m "${msg.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { cwd: REPO, encoding: 'utf8', timeout: 15000 });
    log('  Committed');
    return true;
  } catch (err) {
    log(`  Commit FAILED: ${err.message}`);
    return false;
  }
}

export function gitPush() {
  try {
    // Pre-push hook runs full npm test suite — needs generous timeout (3 min)
    const out = execSync('git push origin main 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 180000 });
    if (/rejected/i.test(out)) {
      log('  Push rejected, pulling rebase...');
      execSync('git pull --rebase origin main 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 120000, env: { ...process.env, GIT_EDITOR: 'true' } });
      // Re-validate after rebase
      const v = runValidate();
      if (v.errors > 0) {
        log('  Rebase introduced validation errors, aborting push');
        return false;
      }
      const out2 = execSync('git push origin main 2>&1', { cwd: REPO, encoding: 'utf8', timeout: 180000 });
      log('  Pushed after rebase');
      return true;
    }
    log('  Pushed');
    return true;
  } catch (err) {
    log(`  Push FAILED: ${err.message}`);
    // Per AGENTS.md: do not bypass with --no-verify
    const out = err.stdout || err.message;
    if (/pre-push/i.test(out) || /tests failed/i.test(out)) {
      log('  Pre-push tests failed. NOT bypassing per AGENTS.md policy.');
      log('  Batch will be logged as push-failed. Entries are committed locally.');
    }
    return false;
  }
}

// ============================================================
// BATCH PROCESSING — with pre-flight, rollback, and stats
// ============================================================

export function processBatch(batch, options = {}) {
  const { dryRun = false } = options;
  log(`\n=== BATCH: ${batch.id} — ${batch.description} ===`);

  // PRE-FLIGHT: check for duplicates before modifying any files
  log('  Pre-flight: checking for duplicates...');
  const conflicts = preflightCheck(batch.entries);
  if (conflicts.length > 0) {
    log(`  PRE-FLIGHT FAILED: ${conflicts.length} conflict(s) found:`);
    for (const c of conflicts) {
      log(`    [${c.type}] ${c.key}: ${c.detail}`);
    }
    log(`  SKIPPING batch ${batch.id}: pre-flight conflicts`);
    return { success: false, reason: 'preflight', conflicts };
  }
  log('  Pre-flight: no conflicts found');

  if (dryRun) {
    log('  [DRY RUN] Would append entries and validate. Not modifying files.');
    return { success: true, reason: 'dryrun', conflicts: [] };
  }

  // Append entries
  appendEntries(batch.entries);

  // Validate
  const val = runValidate();
  if (val.errors > 0) {
    log(`  SKIPPING batch ${batch.id}: ${val.errors} validation errors`);
    if (val.output) {
      const errorLines = val.output.split('\n').filter(l => /error/i.test(l)).slice(0, 10);
      errorLines.forEach(l => log(`    ${l.trim()}`));
    }
    rollback();
    return { success: false, reason: 'validation', conflicts: [] };
  }

  // Check duplicates (belt and suspenders — pre-flight should have caught these)
  if (!runCheckDups()) {
    log(`  SKIPPING batch ${batch.id}: duplicates found by check-dups`);
    rollback();
    return { success: false, reason: 'duplicates', conflicts: [] };
  }

  // Regenerate dist
  if (!regenerateDist()) {
    log(`  SKIPPING batch ${batch.id}: dist regeneration failed`);
    rollback();
    return { success: false, reason: 'dist', conflicts: [] };
  }

  // Run tests
  if (!runTests()) {
    log(`  SKIPPING batch ${batch.id}: test failures`);
    rollback();
    return { success: false, reason: 'tests', conflicts: [] };
  }

  // Commit
  if (!gitCommit(batch.commit_msg)) {
    log(`  SKIPPING batch ${batch.id}: commit failed`);
    return { success: false, reason: 'commit', conflicts: [] };
  }

  // Push
  if (!gitPush()) {
    log(`  WARNING: batch ${batch.id} committed but not pushed`);
    return { success: false, reason: 'push', conflicts: [] };
  }

  // Stats
  log('  Post-batch tier stats:');
  log(generateStats());

  log(`  BATCH ${batch.id} COMPLETE: ${batch.entries.length} entries added`);
  return { success: true, reason: 'ok', conflicts: [] };
}
