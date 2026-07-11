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
  assert.equal(outputs.error, 'not-audit-report');
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

// --- Non-numeric values in JSON (defense-in-depth for shell injection) ---
test('parse-audit-report: non-numeric vulnerability counts coerced to 0', () => {
  const fixture = join(TMP, 'non-numeric.json');
  mkdirSync(TMP, { recursive: true });
  writeFileSync(fixture, JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {},
    metadata: {
      vulnerabilities: {
        info: 'malicious-string',
        low: { injected: true },
        moderate: null,
        high: -1,
        critical: 3.7,
        total: '42; rm -rf /'
      },
      dependencies: { prod: 1, dev: 0, optional: 0, peer: 0, total: 1 }
    }
  }));
  const { stdout, exitCode } = runScript(fixture);
  assert.equal(exitCode, 0);
  const outputs = parseOutputs(stdout);
  assert.equal(outputs.audit_valid, 'true');
  // All non-numeric/non-finite/negative values must be coerced to 0
  assert.equal(outputs.vulnerability_count, '0', 'string total coerced to 0');
  assert.equal(outputs.vuln_info, '0', 'string info coerced to 0');
  assert.equal(outputs.vuln_low, '0', 'object low coerced to 0');
  assert.equal(outputs.vuln_moderate, '0', 'null moderate coerced to 0');
  assert.equal(outputs.vuln_high, '0', 'negative high coerced to 0');
  assert.equal(outputs.vuln_critical, '3', 'float critical truncated to 3');
});

// --- Cleanup ---
test('parse-audit-report: cleanup fixtures', () => {
  rmSync(TMP, { recursive: true, force: true });
});
