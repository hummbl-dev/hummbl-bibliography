import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  parseBibFile,
  parseCli,
} from '../src/citation-graph.js';

describe('citation-graph parser', () => {
  it('parses entries with nested braces and @ in values', () => {
    const fixture = `@article{PaperA,\n  title = {An {example} with @ and {nested {braces}}},\n  author = {Alice and Bob},\n  year = {2024},\n  crossref = {PaperB},\n  keywords = {HUMBL:P1, HUMBL:DE2, OTHER:skip}\n}\n@inproceedings{PaperB,\n  title = "Another Title",\n  author = "Carol and Dana",\n  keywords = {HUMBL:SY3}\n}\n`;

    const entries = parseBibFile(fixture);
    assert.equal(entries.length, 2);

    const paperA = entries[0];
    assert.equal(paperA.key, 'PaperA');
    assert.equal(paperA.fields.title, 'An {example} with @ and {nested {braces}}');
    assert.equal(paperA.fields.crossref, 'PaperB');
    assert.equal(paperA.fields.author, 'Alice and Bob');
    assert.equal(paperA.fields.keywords, 'HUMBL:P1, HUMBL:DE2, OTHER:skip');
  });

  it('extracts multiple values from a HUMBL keyword field', () => {
    const fixture = `@article{PaperC,\n  keywords = {HUMBL:P1, HUMBL:SY9, HUMBL:DE2, NONTAG}\n}`;
    const entries = parseBibFile(fixture);
    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0].fields, {
      keywords: 'HUMBL:P1, HUMBL:SY9, HUMBL:DE2, NONTAG',
    });
  });

  it('validates supported and unknown CLI arguments', () => {
    const defaultArgs = parseCli([]);
    assert.equal(path.basename(defaultArgs.bibDir), 'bibliography');

    assert.throws(() => parseCli(['--bad']), /Unknown option: --bad/);
    assert.throws(() => parseCli(['one', 'two']), /at most one positional argument/);
  });
});

describe('citation-graph source hygiene', () => {
  it('does not rely on innerHTML in script source', () => {
    const source = readFileSync(fileURLToPath(new URL('../src/citation-graph.js', import.meta.url)), 'utf8');
    assert.equal(source.includes('.innerHTML'), false);
  });

  it('does not include a CDN fallback for D3', () => {
    const source = readFileSync(fileURLToPath(new URL('../src/citation-graph.js', import.meta.url)), 'utf8');
    assert.equal(source.includes('cdn.jsdelivr.net'), false);
  });
});
