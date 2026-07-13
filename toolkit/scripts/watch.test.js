import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const WATCH_SCRIPT = fileURLToPath(new URL('../src/watch.js', import.meta.url));

describe('watch.js', () => {
  it('exits non-zero when initial validation fails', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hummbl-watch-fail-'));
    try {
      writeFileSync(
        join(dir, 'bad.bib'),
        '@article{Broken,\n  title = {Missing brace,\n  author = {Someone}\n'
      + '}\n',
        'utf8'
      );

      const result = spawnSync(process.execPath, [WATCH_SCRIPT, dir], {
        encoding: 'utf8',
        timeout: 10000,
      });

      assert.notEqual(result.status, 0);
      assert.match(result.stdout + result.stderr, /Initial validation failed/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
