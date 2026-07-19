/**
 * Tests for validate.js -- doi-unavailable / isbn-unavailable field suppression
 *
 * The validator suppresses the "Missing DOI" warning when an entry has a
 * non-empty `doi-unavailable` BibTeX field, and suppresses "Missing ISBN"
 * when an entry has a non-empty `isbn-unavailable` field. This lets pre-DOI
 * publications, technical reports, and whitepapers attests that no
 * persistent identifier exists, with evidence recorded in
 * reports/no-doi-evidence.md (convention, not enforced by code).
 *
 * Run via: node --test toolkit/scripts/validate-doi-unavailable.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { BibValidator } from '../src/validate.js';

/**
 * Write a .bib file to a temp dir and run the validator against it.
 * Returns the validator instance with populated errors/warnings arrays.
 */
async function runValidator(bibContent) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bib-test-'));
  try {
    const bibPath = path.join(tmpDir, 'test.bib');
    fs.writeFileSync(bibPath, bibContent, 'utf8');
    const validator = new BibValidator(tmpDir, true);
    // Prevent validate() from calling process.exit() during tests.
    validator.exitAfterValidate = false;
    await validator.validate();
    return validator;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const ARTICLE_WITH_DOI = `@article{WithDoi2024,
  author = {Jane Doe},
  title = {Article With DOI},
  journal = {Journal of Testing},
  year = {2024},
  doi = {10.1234/test.2024.001},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

const ARTICLE_NO_DOI_NO_FIELD = `@article{NoDoiNoField2024,
  author = {Jane Doe},
  title = {Article Without DOI and Without doi-unavailable Field},
  journal = {Journal of Testing},
  year = {2024},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

const ARTICLE_NO_DOI_WITH_FIELD = `@article{NoDoiWithField2024,
  author = {Jane Doe},
  title = {Article Without DOI But With doi-unavailable Field},
  journal = {Journal of Testing},
  year = {2024},
  doi-unavailable = {Pre-DOI publication; CrossRef search 2026-07-18 returned no match},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

const ARTICLE_NO_DOI_EMPTY_FIELD = `@article{NoDoiEmptyField2024,
  author = {Jane Doe},
  title = {Article With Empty doi-unavailable Field Should Still Warn},
  journal = {Journal of Testing},
  year = {2024},
  doi-unavailable = {},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

const BOOK_NO_ISBN_WITH_FIELD = `@book{NoIsbnWithField2024,
  author = {Carol White},
  title = {Book Without ISBN But With isbn-unavailable Field},
  publisher = {Test Press},
  year = {2024},
  isbn-unavailable = {Pre-ISBN era publication; no ISBN assigned by publisher},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

const BOOK_NO_ISBN_NO_FIELD = `@book{NoIsbnNoField2024,
  author = {Carol White},
  title = {Book Without ISBN and Without isbn-unavailable Field},
  publisher = {Test Press},
  year = {2024},
  abstract = {This is a sufficiently long abstract for validation testing purposes here.},
  keywords = {HUMMBL: P, IN},
}`;

describe('doi-unavailable field suppression', () => {
  it('does not warn when article has a DOI', async () => {
    const v = await runValidator(ARTICLE_WITH_DOI);
    const doiWarnings = v.warnings.filter(w => w.message === 'Missing DOI');
    assert.equal(doiWarnings.length, 0, 'should not warn when DOI is present');
    assert.equal(v.errors.length, 0, 'should have no errors');
  });

  it('warns Missing DOI when no DOI and no doi-unavailable field', async () => {
    const v = await runValidator(ARTICLE_NO_DOI_NO_FIELD);
    const doiWarnings = v.warnings.filter(w => w.message === 'Missing DOI');
    assert.equal(doiWarnings.length, 1, 'should warn Missing DOI');
    assert.equal(doiWarnings[0].key, 'NoDoiNoField2024');
  });

  it('suppresses Missing DOI warning when doi-unavailable field is present and non-empty', async () => {
    const v = await runValidator(ARTICLE_NO_DOI_WITH_FIELD);
    const doiWarnings = v.warnings.filter(w => w.message === 'Missing DOI');
    assert.equal(doiWarnings.length, 0, 'should NOT warn when doi-unavailable attests no DOI exists');
    assert.equal(v.errors.length, 0, 'should have no errors');
  });

  it('still warns when doi-unavailable field is present but empty', async () => {
    const v = await runValidator(ARTICLE_NO_DOI_EMPTY_FIELD);
    const doiWarnings = v.warnings.filter(w => w.message === 'Missing DOI');
    assert.equal(doiWarnings.length, 1, 'empty doi-unavailable should not suppress warning');
    assert.equal(doiWarnings[0].key, 'NoDoiEmptyField2024');
  });
});

describe('isbn-unavailable field suppression', () => {
  it('suppresses Missing ISBN warning when isbn-unavailable field is present and non-empty', async () => {
    const v = await runValidator(BOOK_NO_ISBN_WITH_FIELD);
    const isbnWarnings = v.warnings.filter(w => w.message === 'Missing ISBN');
    assert.equal(isbnWarnings.length, 0, 'should NOT warn when isbn-unavailable attests no ISBN exists');
    assert.equal(v.errors.length, 0, 'should have no errors');
  });

  it('warns Missing ISBN when no ISBN and no isbn-unavailable field', async () => {
    const v = await runValidator(BOOK_NO_ISBN_NO_FIELD);
    const isbnWarnings = v.warnings.filter(w => w.message === 'Missing ISBN');
    assert.equal(isbnWarnings.length, 1, 'should warn Missing ISBN');
    assert.equal(isbnWarnings[0].key, 'NoIsbnNoField2024');
  });
});
