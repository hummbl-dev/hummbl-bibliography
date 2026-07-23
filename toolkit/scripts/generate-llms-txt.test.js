import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  resolveBibDir,
  resolveTierLabel,
  generateLlmsFiles,
  buildLlmsTextPayload,
  buildLlmsFullPayload,
} from '../src/generate-llms-txt.js';

describe('generate-llms-txt helpers', () => {
  it('resolves bibliography path from a base directory', () => {
    const pathFromTmp = resolveBibDir('tmp/hummbl-bibliography');
    assert.equal(pathFromTmp.replace(/\\+/g, '/'), path.resolve('tmp/hummbl-bibliography/bibliography').replace(/\\+/g, '/'));
  });

  it('maps T14-T19 tier codes to names from grounding metadata', () => {
    assert.equal(resolveTierLabel('T14'), 'Provenance');
    assert.equal(resolveTierLabel('t19'), 'Incident Response');
  });

  it('builds llms payloads with deterministic tier labels', () => {
    const data = {
      entries: [
        {
          id: 'Demo',
          title: 'Demo Entry',
          author: 'Alice Example',
          year: '2026',
          tier: 'T14',
          abstract: 'A short abstract used only for fixture serialization.',
          keywords: ['HUMMBL:DE'],
          transformations: ['DE'],
          url: 'https://example.com',
        },
      ],
    };

    const files = generateLlmsFiles(data);
    const text = buildLlmsTextPayload(data);
    const full = buildLlmsFullPayload(data);
    const byLine = text.split('\n').find((line) => line.includes('## T14:'));
    assert.ok(byLine.includes('Provenance'));
    assert.equal(files.txt.includes('no-doi'), true);
    assert.equal(full.entries.length, 1);
    assert.equal(full.entries[0].tier_name, 'Provenance');
    assert.equal(full.entries[0].id, 'Demo');
  });
});
