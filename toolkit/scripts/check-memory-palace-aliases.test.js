/**
 * Tests for check-memory-palace-aliases.js
 *
 * Tests the parsing and collision-detection logic in isolation.
 * Run via: node --test toolkit/scripts/check-memory-palace-aliases.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Inline the testable helpers (copy-paste the pure functions so we can test
// without importing the script's main() side effects)
// ---------------------------------------------------------------------------

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

function extractAliasesFromInner(inner) {
  const aliases = [];
  const stringRe = /'([^']*)'|"([^"]*)"/g;
  let m;
  while ((m = stringRe.exec(inner)) !== null) {
    aliases.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return aliases;
}

function detectCollisions(entries) {
  const map = new Map();
  const collisions = [];
  for (const entry of entries) {
    const allNames = [
      { field: 'canonical_name', value: entry.canonical_name },
      ...entry.aliases.map(a => ({ field: 'alias', value: a })),
    ];
    for (const { field, value } of allNames) {
      const key = value.toLowerCase();
      if (map.has(key)) {
        collisions.push({ key, first: map.get(key), second: { slug: entry.slug, field, value } });
      } else {
        map.set(key, { slug: entry.slug, field, value });
      }
    }
  }
  return collisions;
}

// ---------------------------------------------------------------------------
// extractStringValue
// ---------------------------------------------------------------------------

describe('extractStringValue', () => {
  it('extracts single-quoted value', () => {
    assert.equal(extractStringValue("'hello world'"), 'hello world');
  });

  it('extracts double-quoted value', () => {
    assert.equal(extractStringValue('"hello world"'), 'hello world');
  });

  it("extracts double-quoted string with apostrophe", () => {
    assert.equal(extractStringValue('"Occam\'s razor"'), "Occam's razor");
  });

  it('returns null for unquoted value', () => {
    assert.equal(extractStringValue('someIdentifier'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(extractStringValue(''), null);
  });

  it('trims surrounding whitespace before checking', () => {
    assert.equal(extractStringValue("  'value'  "), 'value');
  });
});

// ---------------------------------------------------------------------------
// extractAliasesFromInner
// ---------------------------------------------------------------------------

describe('extractAliasesFromInner', () => {
  it('extracts single-quoted aliases', () => {
    assert.deepEqual(
      extractAliasesFromInner("'anti-fragility', 'antifragile'"),
      ['anti-fragility', 'antifragile']
    );
  });

  it('extracts double-quoted aliases with apostrophes', () => {
    assert.deepEqual(
      extractAliasesFromInner('"Occam\'s razor", "Ockham\'s razor"'),
      ["Occam's razor", "Ockham's razor"]
    );
  });

  it('handles mixed quote styles', () => {
    assert.deepEqual(
      extractAliasesFromInner("'OODA', \"ooda loop\""),
      ['OODA', 'ooda loop']
    );
  });

  it('returns empty array for empty inner', () => {
    assert.deepEqual(extractAliasesFromInner(''), []);
  });

  it('ignores bare identifiers (no quotes)', () => {
    assert.deepEqual(extractAliasesFromInner('OODA'), []);
  });
});

// ---------------------------------------------------------------------------
// detectCollisions
// ---------------------------------------------------------------------------

describe('detectCollisions', () => {
  it('returns empty array when no collisions', () => {
    const entries = [
      { slug: 'a', canonical_name: 'Alpha', aliases: ['beta'] },
      { slug: 'b', canonical_name: 'Gamma', aliases: ['delta'] },
    ];
    assert.deepEqual(detectCollisions(entries), []);
  });

  it('detects canonical_name vs alias collision (same entry)', () => {
    // "Via Negativa" canonical collides with alias "via negativa"
    const entries = [
      { slug: 'via-negativa', canonical_name: 'Via Negativa', aliases: ['via negativa'] },
    ];
    const result = detectCollisions(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'via negativa');
    assert.equal(result[0].first.field, 'canonical_name');
    assert.equal(result[0].second.field, 'alias');
  });

  it('detects collision across two different entries', () => {
    const entries = [
      { slug: 'a', canonical_name: 'Black Swan', aliases: [] },
      { slug: 'b', canonical_name: 'Black Swan Event', aliases: ['black swan'] },
    ];
    const result = detectCollisions(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'black swan');
  });

  it('detects alias vs alias collision across entries', () => {
    const entries = [
      { slug: 'a', canonical_name: 'Alpha', aliases: ['shared alias'] },
      { slug: 'b', canonical_name: 'Beta', aliases: ['Shared Alias'] },
    ];
    const result = detectCollisions(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, 'shared alias');
  });

  it('detects apostrophe alias collision (Occam double-quote case)', () => {
    const entries = [
      {
        slug: 'occams-razor',
        canonical_name: "Occam's Razor",
        aliases: ["Occam's razor", 'parsimony principle'],
      },
    ];
    // "Occam's razor" lowercase collides with canonical_name lowercase
    const result = detectCollisions(entries);
    assert.equal(result.length, 1);
    assert.equal(result[0].key, "occam's razor");
  });

  it('reports multiple collisions', () => {
    const entries = [
      { slug: 'a', canonical_name: 'Alpha', aliases: ['alpha'] },         // self-collision
      { slug: 'b', canonical_name: 'Beta', aliases: ['beta'] },           // self-collision
    ];
    const result = detectCollisions(entries);
    assert.equal(result.length, 2);
  });
});
