import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const toolkit = path.resolve(import.meta.dirname, '..');
const duplicateChecker = path.join(toolkit, 'src', 'check-duplicates.js');
const requiredChecker = path.join(toolkit, 'src', 'check-required-fields.js');

function run(command, args) {
  try {
    execFileSync(process.execPath, [command, ...args], { cwd: toolkit, stdio: 'pipe' });
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

test('missing bibliography path fails both checks', () => {
  const missing = path.join(os.tmpdir(), `missing-bib-${Date.now()}`);
  assert.notEqual(run(duplicateChecker, ['--fail-on-duplicates', missing]), 0);
  assert.notEqual(run(requiredChecker, ['--fail-on-missing', missing]), 0);
});

test('empty and malformed bibliography inputs fail closed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bib-invalid-'));
  fs.writeFileSync(path.join(dir, 'empty.bib'), '');
  assert.notEqual(run(duplicateChecker, ['--fail-on-duplicates', dir]), 0);
  assert.notEqual(run(requiredChecker, ['--fail-on-missing', dir]), 0);
  fs.writeFileSync(path.join(dir, 'empty.bib'), '@article{broken, title = {unterminated');
  assert.notEqual(run(duplicateChecker, ['--fail-on-duplicates', dir]), 0);
  assert.notEqual(run(requiredChecker, ['--fail-on-missing', dir]), 0);
});

test('wrong top-level input shape fails closed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bib-shape-'));
  fs.writeFileSync(path.join(dir, 'wrong-shape.bib'), JSON.stringify({ entries: [] }));
  assert.notEqual(run(duplicateChecker, ['--fail-on-duplicates', dir]), 0);
  assert.notEqual(run(requiredChecker, ['--fail-on-missing', dir]), 0);
});
