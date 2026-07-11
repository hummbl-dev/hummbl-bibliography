import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SCRIPT = join(__dirname, 'parse-audit-report.js');
const TMP = join(__dirname, '_tmp_audit_fixtures');

mkdirSync(TMP, { recursive: true });

function runScript(reportPath) {
  try {
    const stdout = execFileSync('node', [SCRIPT, reportPath], {
      encoding: 'utf8',
      timeout: 5000,
    });
    return { stdout, exitCode: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', exitCode: e.status || 1 };
  }
}

function parseOutputs(stdout) {
  const outputs = {};
  for (const line of stdout.trim().split('\n')) {
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    outputs[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return outputs;
}

// --- Valid audit: zero vulnerabilities ---
test('parse-audit-report: zero vulnerabilities', () => {
  const fixture = join(TMP, 'zero-vulns.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      dependencies: { prod: 82, dev: 129, optional: 21, peer: 2, total: 210 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 0);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'true');
  assert.equal(outputs.vulnerability_count, '0');
  assert.equal(outputs.vuln_critical, '0');
  assert.equal(outputs.vuln_high, '0');
});

// --- Valid audit: nonzero vulnerabilities ---
test('parse-audit-report: nonzero vulnerabilities', () => {
  const fixture = join(TMP, 'nonzero-vulns.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {
      'lodash': { severity: 'high' },
      'express': { severity: 'moderate' }
    },
    metadata: {
      vulnerabilities: { info: 0, low: 1, moderate: 2, high: 1, critical: 0, total: 4 },
      dependencies: { prod: 82, dev: 129, optional: 21, peer: 2, total: 210 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 0);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'true');
  assert.equal(outputs.vulnerability_count, '4');
  assert.equal(outputs.vuln_high, '1');
  assert.equal(outputs.vuln_low, '1');
  assert.equal(outputs.vuln_moderate, '2');
});

// --- Malformed JSON ---
test('parse-audit-report: malformed JSON', () => {
  const fixture = join(TMP, 'malformed.json');
  writeFileSync(fixture, '{ this is not valid json');
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'malformed-json');
  assert.equal(outputs.vulnerability_count, '0');
});

// --- npm/network failure: empty file (npm crashed without writing stdout) ---
test('parse-audit-report: npm/network failure (empty output)', () => {
  const fixture = join(TMP, 'empty.json');
  writeFileSync(fixture, '');
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'malformed-json');
});

// --- npm error object (registry/auth failure produces JSON without auditReportVersion) ---
test('parse-audit-report: npm error object (not an audit report)', () => {
  const fixture = join(TMP, 'npm-error.json');
  writeFileSync(fixture, JSON.stringify({
    error: {
      code: 'ECONNREFUSED',
      summary: 'Could not connect to registry',
      detail: 'network error'
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'unsupported-audit-version');
});

// --- Missing file ---
test('parse-audit-report: missing file', () => {
  const { stdout, exitCode } = runScript(join(TMP, 'nonexistent.json'));
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'file-not-found');
});

// --- Missing path argument ---
test('parse-audit-report: missing path argument', () => {
  try {
    const stdout = execFileSync('node', [SCRIPT], {
      encoding: 'utf8',
      timeout: 5000,
    });
    const outputs = parseOutputs(stdout);
    assert.equal(outputs.audit_valid, 'false');
    assert.equal(outputs.error, 'missing-path');
  } catch (e) {
    const outputs = parseOutputs(e.stdout || '');
    assert.equal(outputs.audit_valid, 'false');
    assert.equal(outputs.error, 'missing-path');
  }
});

// --- Strict schema validation: non-integer and non-number counts are rejected ---
test('parse-audit-report: string count rejected (not coerced)', () => {
  const fixture = join(TMP, 'string-count.json');
  mkdirSync(TMP, { recursive: true });
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: '4' },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:total');
});

test('parse-audit-report: injection string rejected as invalid count', () => {
  const fixture = join(TMP, 'injection.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: '42; rm -rf /' },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:total');
});

test('parse-audit-report: negative count rejected', () => {
  const fixture = join(TMP, 'negative.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: -1, critical: 0, total: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:high');
});

test('parse-audit-report: fractional count rejected', () => {
  const fixture = join(TMP, 'fractional.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 3.7, total: 4 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:critical');
});

test('parse-audit-report: null count rejected', () => {
  const fixture = join(TMP, 'null-count.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: null, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:info');
});

test('parse-audit-report: object count rejected', () => {
  const fixture = join(TMP, 'object-count.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: { injected: true }, moderate: 0, high: 0, critical: 0, total: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'invalid-count:low');
});

test('parse-audit-report: total mismatch rejected', () => {
  const fixture = join(TMP, 'total-mismatch.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 1, moderate: 2, high: 1, critical: 0, total: 99 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'total-mismatch');
});

test('parse-audit-report: unsupported audit version rejected', () => {
  const fixture = join(TMP, 'bad-version.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 99,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'unsupported-audit-version');
});

test('parse-audit-report: missing vulnerability metadata rejected', () => {
  const fixture = join(TMP, 'no-vuln-meta.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {}
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 1);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'false');
  assert.equal(outputs.error, 'missing-vulnerability-metadata');
});

test('parse-audit-report: missing count fields default to 0', () => {
  const fixture = join(TMP, 'missing-fields.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { total: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 0);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'true');
  assert.equal(outputs.vulnerability_count, '0');
  assert.equal(outputs.vuln_info, '0');
  assert.equal(outputs.vuln_low, '0');
  assert.equal(outputs.vuln_moderate, '0');
  assert.equal(outputs.vuln_high, '0');
  assert.equal(outputs.vuln_critical, '0');
});

test('parse-audit-report: missing total computed from severity counts', () => {
  const fixture = join(TMP, 'missing-total.json');
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 1, moderate: 2, high: 1, critical: 0 },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 0);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'true');
  assert.equal(outputs.vulnerability_count, '4');
});

// --- Cleanup ---
test('parse-audit-report: cleanup fixtures', () => {
  rmSync(TMP, { recursive: true, force: true });
});
