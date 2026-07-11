/**
 * Tests for find-missing-dois.js -- citation-js CSL type mapping regression
 *
 * citation-js converts BibTeX types to CSL types:
 *   @article       -> article-journal
 *   @inproceedings -> paper-conference
 *
 * The type check in processEntry() must use CSL type names, not raw
 * BibTeX names. This test guards against regression to the old check
 * that used article / inproceedings (which would skip every entry).
 *
 * Run via: node --test toolkit/scripts/find-missing-dois.test.js
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import { isDoiCandidateType } from '../src/find-missing-dois.js';

const BIBTEX_FIXTURE = `@article{TestArticle2024,
  author = {Jane Doe and John Smith},
  title = {A Test Article on Cognitive Frameworks},
  journal = {Journal of Testing},
  year = {2024},
  volume = {42},
  pages = {1--10},
}
@inproceedings{TestConference2024,
  author = {Alice Brown and Bob Jones},
  title = {A Test Conference Paper on Synthesis},
  booktitle = {Proceedings of the Test Conference},
  year = {2024},
  pages = {100--110},
}
@book{TestBook2024,
  author = {Carol White},
  title = {A Test Book on Decomposition},
  publisher = {Test Press},
  year = {2024},
}
@misc{TestMisc2024,
  author = {Dan Black},
  title = {A Test Misc Entry},
  year = {2024},
  note = {Some notes},
}
@report{TestReport2024,
  author = {Eve Green},
  title = {A Test Report},
  institution = {Test Institute},
  year = {2024},
}
`;

describe(`citation-js CSL type mapping`, () => {
  let entries;
  before(() => {
    const citation = new Cite(BIBTEX_FIXTURE, { forceType: `@bibtex/text` });
    entries = citation.data;
    assert.ok(entries.length >= 5, `should parse at least 5 entries`);
  });
  it(`converts @article to article-journal`, () => {
    const a = entries.find(e => e.id === `TestArticle2024`);
    assert.ok(a);
    assert.equal(a.type, `article-journal`);
    assert.notEqual(a.type, `article`);
  });
  it(`converts @inproceedings to paper-conference`, () => {
    const c = entries.find(e => e.id === `TestConference2024`);
    assert.ok(c);
    assert.equal(c.type, `paper-conference`);
    assert.notEqual(c.type, `inproceedings`);
  });
  it(`converts @book to book`, () => {
    const b = entries.find(e => e.id === `TestBook2024`);
    assert.ok(b);
    assert.equal(b.type, `book`);
  });
  it(`does not produce raw BibTeX type names`, () => {
    const types = entries.map(e => e.type);
    assert.ok(!types.includes(`article`));
    assert.ok(!types.includes(`inproceedings`));
  });
});

describe(`processEntry type-check filter`, () => {
  let entries;
  before(() => {
    const citation = new Cite(BIBTEX_FIXTURE, { forceType: `@bibtex/text` });
    entries = citation.data;
  });
  it(`includes article-journal entries`, () => {
    const a = entries.find(e => e.id === `TestArticle2024`);
    assert.ok(isDoiCandidateType(a.type));
  });
  it(`includes paper-conference entries`, () => {
    const c = entries.find(e => e.id === `TestConference2024`);
    assert.ok(isDoiCandidateType(c.type));
  });
  it(`excludes book entries`, () => {
    const b = entries.find(e => e.id === `TestBook2024`);
    assert.ok(!isDoiCandidateType(b.type));
  });
  it(`excludes report entries`, () => {
    const r = entries.find(e => e.id === `TestReport2024`);
    assert.ok(!isDoiCandidateType(r.type));
  });
  it(`excludes misc entries`, () => {
    const m = entries.find(e => e.id === `TestMisc2024`);
    assert.ok(!isDoiCandidateType(m.type));
  });
  it(`would skip all entries if old BibTeX type names were used`, () => {
    const OLD_TYPES = new Set([`article`, `inproceedings`]);
    const matched = entries.filter(e => OLD_TYPES.has(e.type));
    assert.equal(matched.length, 0,
      `old type names should match zero entries -- this is the bug the fix addresses`);
  });
  it(`new CSL type names match article and conference entries`, () => {
    const matched = entries.filter(e => isDoiCandidateType(e.type));
    assert.ok(matched.length >= 2,
      `new type names should match at least 2 entries`);
  });
});
