/**
 * Regression coverage for maintenance CLIs (duplication and DOI helpers).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  DOIFinder,
  isDoiCandidateType,
  extractPublicationYear,
  getPrimaryAuthor,
} from '../src/find-missing-dois.js';
import {
  getTierFromFilename,
  shouldKeepExistingForDuplicate,
} from '../src/fix-duplicates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLKIT_ROOT = join(__dirname, '..');
const FIX_DUPLICATES = join(TOOLKIT_ROOT, 'src', 'fix-duplicates.js');
const MERGE_ENTRIES = join(TOOLKIT_ROOT, 'src', 'merge-entries.js');

function runNodeScript(scriptPath, args = []) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: TOOLKIT_ROOT,
    encoding: 'utf8',
  });
}

describe('find-missing-dois helpers', () => {
  it('accepts only citation-js article-journal and paper-conference types', () => {
    assert.equal(isDoiCandidateType('article-journal'), true);
    assert.equal(isDoiCandidateType('paper-conference'), true);
    assert.equal(isDoiCandidateType('article'), false);
    assert.equal(isDoiCandidateType(''), false);
  });

  it('extracts publication year from CSL issued date parts', () => {
    assert.equal(
      extractPublicationYear({
        issued: {
          'date-parts': [[2024, 3, 8]],
        },
      }),
      '2024'
    );
  });

  it('falls back to entry year when CSL date parts are absent', () => {
    assert.equal(extractPublicationYear({ year: 2022 }), '2022');
  });

  it('passes extracted year into CrossRef query path', async () => {
    class StubFinder extends DOIFinder {
      constructor(bibDir) {
        super(bibDir);
        this.queriedYears = [];
      }

      async searchCrossRef(title, author, year) {
        this.queriedYears.push({ title, author, year });
        return {
          doi: '10.5555/12345678',
          score: 99,
          title: 'stub-title',
          confidence: 'high',
        };
      }
    }

    const finder = new StubFinder('unused');
    await finder.processEntry(
      {
        id: 'test2024',
        title: 'Example Paper',
        type: 'article-journal',
        author: [{ family: 'Doe' }],
        issued: { 'date-parts': [[2024]] },
      },
      'T1_canonical.bib'
    );

    assert.equal(finder.foundDOIs.length, 1);
    assert.equal(finder.queriedYears.length, 1);
    assert.equal(finder.queriedYears[0].year, '2024');
  });

  it('extracts author from array and scalar forms', () => {
    assert.equal(getPrimaryAuthor({ author: [{ family: 'Doe', literal: 'Ignored' }] }), 'Doe');
    assert.equal(getPrimaryAuthor({ author: 'Jane Doe' }), 'Jane Doe');
    assert.equal(getPrimaryAuthor({}), '');
  });
});

describe('fix-duplicates helpers', () => {
  it('parses numeric tiers without substring false positives', () => {
    assert.equal(getTierFromFilename('T1_canonical.bib'), 1);
    assert.equal(getTierFromFilename('T10_architecture.bib'), 10);
    assert.equal(getTierFromFilename('T11_collaboration.bib'), 11);
    assert.equal(getTierFromFilename('misc.bib'), Number.POSITIVE_INFINITY);
  });

  it('keeps lower numeric tier on duplicate keys', () => {
    assert.equal(shouldKeepExistingForDuplicate('T10_core.bib', 'T2_core.bib'), false);
    assert.equal(shouldKeepExistingForDuplicate('T2_core.bib', 'T10_core.bib'), true);
    assert.equal(shouldKeepExistingForDuplicate('T10_core.bib', 'T11_core.bib'), true);
    assert.equal(shouldKeepExistingForDuplicate('misc.bib', 'T2_core.bib'), false);
  });
});

describe('maintenance CLIs', () => {
  it('runs merge-entries as ESM with exit code 0', () => {
    const result = runNodeScript(MERGE_ENTRIES);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /HUMMBL Bibliography Entry Merger/);
  });

  it('supports dry run and does not write .backup files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hummbl-maint-'));
    try {
      const bibA = join(dir, 'T10_core.bib');
      const bibB = join(dir, 'T2_core.bib');
      const entry = `@article{Dup2024,\n  title = {Duplicate Title},\n  author = {A. Smith},\n  year = {2024},\n  journal = {Journal of Tests},\n}\n`;

      writeFileSync(bibA, entry, 'utf8');
      writeFileSync(bibB, entry, 'utf8');

      const result = runNodeScript(FIX_DUPLICATES, ['--dry-run', dir]);
      assert.equal(result.status, 0);
      assert.match(result.stdout, /DRY RUN MODE/);
      assert.equal(readdirSync(dir).includes('T10_core.bib'), true);
      assert.equal(readdirSync(dir).includes('T2_core.bib'), true);
      assert.equal(readFileSync(bibA, 'utf8').includes('Dup2024'), true);
      assert.equal(readFileSync(bibB, 'utf8').includes('Dup2024'), true);
      assert.equal(readdirSync(dir).some((name) => name.endsWith('.backup')), false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
