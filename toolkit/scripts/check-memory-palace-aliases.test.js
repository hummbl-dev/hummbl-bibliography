/**
 * Tests for check-memory-palace-aliases.js
 *
 * Tests the parsing and collision-detection logic in isolation.
 * Run via: node --test toolkit/scripts/check-memory-palace-aliases.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECKER = join(__dirname, 'check-memory-palace-aliases.js');

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

// ---------------------------------------------------------------------------
// End-to-end: script exit codes against synthetic files
// ---------------------------------------------------------------------------

describe('CLI exit codes', () => {
  // Helper: write a temp memoryPalace.ts, run the checker against it, return result
  function runChecker(source) {
    const dir = mkdtempSync(join(tmpdir(), 'mp-test-'));
    const filePath = join(dir, 'memoryPalace.ts');
    try {
      writeFileSync(filePath, source, 'utf8');
      const result = spawnSync(
        process.execPath,
        [CHECKER, '--path', filePath],
        { encoding: 'utf8' }
      );
      return { code: result.status, stdout: result.stdout, stderr: result.stderr };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('exits 0 for a clean registry', () => {
    const source = `
export const MEMORY_PALACE = [
  {
    slug: 'antifragility',
    room: 'TALEB',
    canonical_name: 'Antifragility',
    aliases: ['Anti-fragility', 'antifragile'],
    source: 'Taleb',
    description: 'Systems that gain from disorder',
    tags: ['risk'],
  },
];
`;
    const { code, stdout } = runChecker(source);
    assert.equal(code, 0);
    assert.match(stdout, /no alias collisions/);
  });

  it('exits 1 when canonical_name lowercases to same key as its own alias', () => {
    // Classic "Via Negativa" / "via negativa" bug
    const source = `
export const MEMORY_PALACE = [
  {
    slug: 'via-negativa',
    room: 'TALEB',
    canonical_name: 'Via Negativa',
    aliases: ['via negativa', 'subtraction principle'],
    source: 'Taleb',
    description: 'Improvement by removal',
    tags: ['risk'],
  },
];
`;
    const { code, stderr } = runChecker(source);
    assert.equal(code, 1);
    assert.match(stderr, /via negativa/);
  });

  it('exits 1 for a cross-entry alias collision', () => {
    const source = `
export const MEMORY_PALACE = [
  {
    slug: 'a',
    room: 'EPISTEMICS',
    canonical_name: 'Circle of Competence',
    aliases: ['competence circle'],
    source: 'Munger',
    description: 'Know what you know',
    tags: [],
  },
  {
    slug: 'b',
    room: 'EPISTEMICS',
    canonical_name: 'Competence Circle',
    aliases: [],
    source: 'Buffett',
    description: 'Variant',
    tags: [],
  },
];
`;
    const { code, stderr } = runChecker(source);
    assert.equal(code, 1);
    assert.match(stderr, /competence circle/);
  });

  it('exits 2 when the file does not exist', () => {
    const result = spawnSync(
      process.execPath,
      [CHECKER, '--path', '/nonexistent/memoryPalace.ts'],
      { encoding: 'utf8' }
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /not found/);
  });
});
