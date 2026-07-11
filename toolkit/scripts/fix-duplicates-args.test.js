/**
 * Tests for fix-duplicates.js — argument parsing regression
 *
 * The fix-duplicates.js script accepts a positional bibDir argument and
 * a --dry-run flag. The original code used:
 *   const bibDir = args[0] || '../bibliography';
 * which would mistake '--dry-run' for the bibDir if the flag appeared
 * before any positional argument. The fix filters flags first:
 *   const positionalArgs = args.filter(a => !a.startsWith('--'));
 *   const bibDir = positionalArgs[0] || '../bibliography';
 *
 * This test verifies that --dry-run as the first argument does not
 * break bibDir resolution, and that the script runs correctly with
 * flags in any position.
 *
 * Run via: node --test toolkit/scripts/fix-duplicates-args.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'src', 'fix-duplicates.js');
const BIB_DIR = join(__dirname, '..', '..', 'bibliography');
const TOOLKIT_ROOT = join(__dirname, '..');

// Helper: run fix-duplicates.js with given args, return result
function runFixer(args) {
  const result = spawnSync(
    process.execPath,
    [SCRIPT, ...args],
    { encoding: 'utf8', timeout: 30000, cwd: TOOLKIT_ROOT }
  );
  return {
    code: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe('fix-duplicates.js argument parsing', () => {
  it('runs successfully with --dry-run as the only argument (uses default bibDir)', () => {
    // OLD BUG: args[0] would be '--dry-run', so bibDir = '--dry-run'
    //   path.resolve('--dry-run') -> <cwd>/--dry-run (non-existent)
    //   fs.readdirSync would throw ENOENT
    // FIX: flags are filtered, bibDir defaults to '../bibliography'
    const { code, stdout, stderr } = runFixer(['--dry-run']);
    assert.equal(code, 0,
      'should exit 0 when --dry-run is the only arg; stderr: ' + stderr);
    assert.match(stdout, /DRY RUN MODE/, 'should show dry run banner');
    assert.match(stdout, /Loading bibliography files/, 'should load default bibDir');
    assert.match(stdout, /No duplicates to fix/, 'should complete successfully');
  });

  it('runs successfully with bibDir then --dry-run', () => {
    const { code, stdout } = runFixer([BIB_DIR, '--dry-run']);
    assert.equal(code, 0);
    assert.match(stdout, /DRY RUN MODE/);
    assert.match(stdout, /No duplicates to fix/);
  });

  it('runs successfully with --dry-run then bibDir (flag before positional)', () => {
    // This is the key regression case: flag before positional arg.
    // OLD CODE: bibDir = args[0] = '--dry-run' (BUG)
    // NEW CODE: bibDir = positionalArgs[0] = BIB_DIR (CORRECT)
    const { code, stdout, stderr } = runFixer(['--dry-run', BIB_DIR]);
    assert.equal(code, 0,
      'should exit 0 when --dry-run precedes bibDir; stderr: ' + stderr);
    assert.match(stdout, /DRY RUN MODE/);
    assert.match(stdout, /Loading bibliography files/);
    assert.match(stdout, /No duplicates to fix/);
  });

  it('does not treat --dry-run as a directory path', () => {
    // If the old bug were present, the script would try to read
    // a directory named '--dry-run' and fail with ENOENT or EISDIR.
    const { code, stderr } = runFixer(['--dry-run']);
    assert.equal(code, 0);
    assert.doesNotMatch(stderr, /ENOENT/, 'should not get ENOENT from treating --dry-run as a path');
    assert.doesNotMatch(stderr, /EISDIR/, 'should not get EISDIR from treating --dry-run as a path');
  });

  it('loads all 13 bibliography tiers with --dry-run as first arg', () => {
    const { code, stdout } = runFixer(['--dry-run']);
    assert.equal(code, 0);
    // Count the number of .bib files loaded
    const bibMatches = stdout.match(/\.bib:/g) || [];
    assert.ok(bibMatches.length >= 13,
      'should load at least 13 .bib files; got ' + bibMatches.length);
  });
});
