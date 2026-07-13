import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const GENERATEDOC_SCRIPT = fileURLToPath(new URL('../scripts/generate-docs.js', import.meta.url));

describe('generate-docs', () => {
  it('generates quick reference markdown from source model data', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'hummbl-docs-'));
    try {
      const result = spawnSync(process.execPath, [GENERATEDOC_SCRIPT, 'quick', outDir], {
        encoding: 'utf8',
      });

      assert.equal(result.status, 0);
      const quickRef = readFileSync(join(outDir, 'quick-reference.md'), 'utf8');
      assert.ok(quickRef.includes('HUMBL Base120 Quick Reference'));
      assert.ok(quickRef.includes('**P1**'));
      assert.ok(quickRef.includes('Worldview Articulation'));
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});
