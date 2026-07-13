import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(new URL('.', import.meta.url)));

// Try multiple candidate paths — the workflow file is at the repo root,
// but the test runs from toolkit/ and import.meta.url resolution varies
const candidates = [
  join(__dirname, '..', '..', '.github', 'workflows', 'security-audit.yml'),
  join(process.cwd(), '..', '.github', 'workflows', 'security-audit.yml'),
  join(process.cwd(), '.github', 'workflows', 'security-audit.yml'),
];

let yaml = '';
for (const p of candidates) {
  if (existsSync(p)) {
    yaml = readFileSync(p, 'utf8');
    break;
  }
}

const hasWorkflow = yaml.length > 0;

// Static assertions on the security-audit workflow YAML.
// These verify condition logic, permissions, and step routing
// without executing the workflow.

test('security-audit workflow: no security-events permission', { skip: !hasWorkflow }, () => {
  // security-events: write was removed as unused
  assert(!yaml.includes('security-events'), 'security-events: write must not be present anywhere');
  assert(yaml.includes('contents: read'), 'contents: read must be present');
  assert(yaml.includes('pull-requests: write'), 'pull-requests: write must be present');
});

test('security-audit workflow: valid audit uploads as audit-report', { skip: !hasWorkflow }, () => {
  const uploadIdx = yaml.indexOf('name: Upload audit report');
  assert(uploadIdx !== -1, 'Upload audit report step found');
  const uploadSection = yaml.slice(uploadIdx, uploadIdx + 500);
  assert(uploadSection.includes("audit_valid == 'true'"), 'valid audit condition present');
  assert(uploadSection.includes('if-no-files-found: error'), 'error on missing file for valid audit');
});

test('security-audit workflow: invalid audit uploads as diagnostic', { skip: !hasWorkflow }, () => {
  const diagStep = yaml.match(/name: Upload raw diagnostic[\s\S]*?if-no-files-found: \w+/);
  assert.ok(diagStep, 'diagnostic upload step found');
  assert(diagStep[0].includes("audit_valid != 'true'"), 'invalid audit condition present');
  assert(diagStep[0].includes('if-no-files-found: warn'), 'warn on missing file for diagnostic');
  assert(diagStep[0].includes('INVALID-diagnostic'), 'artifact name labeled as INVALID');
});

test('security-audit workflow: surface findings step fires for all valid nonzero audits', { skip: !hasWorkflow }, () => {
  const surfaceStep = yaml.match(/name: Surface vulnerability findings[\s\S]*?if: [^\n]+/);
  assert.ok(surfaceStep, 'Surface vulnerability findings step found');
  const condition = surfaceStep[0];
  assert(condition.includes("audit_valid == 'true'"), 'requires audit_valid');
  assert(condition.includes('vulnerability_count > 0'), 'requires nonzero vulnerabilities');
  assert(condition.includes('always()'), 'runs regardless of prior step failures');
  // Must NOT have fork guard — findings must be visible for fork PRs too
  assert(!condition.includes('head.repo.full_name'), 'surface step must not have fork guard');
});

test('security-audit workflow: PR comment step has fork guard', { skip: !hasWorkflow }, () => {
  const commentStep = yaml.match(/name: Comment on PR[\s\S]*?if: [^\n]+/);
  assert.ok(commentStep, 'Comment on PR step found');
  const condition = commentStep[0];
  assert(condition.includes('github.event_name == \'pull_request\''), 'PR event guard');
  assert(condition.includes('head.repo.full_name == github.repository'), 'fork guard present');
  assert(condition.includes("audit_valid == 'true'"), 'requires valid audit');
  assert(condition.includes('vulnerability_count > 0'), 'requires nonzero vulnerabilities');
});

test('security-audit workflow: surface step writes to GITHUB_STEP_SUMMARY', { skip: !hasWorkflow }, () => {
  const surfaceStep = yaml.match(/name: Surface vulnerability findings[\s\S]*?(?=\n      - name:)/);
  assert.ok(surfaceStep, 'Surface step found');
  assert(surfaceStep[0].includes('GITHUB_STEP_SUMMARY'), 'writes to step summary');
  assert(surfaceStep[0].includes('::warning::'), 'emits workflow warning');
});

test('security-audit workflow: infrastructure failure step exists', { skip: !hasWorkflow }, () => {
  const infraStep = yaml.match(/name: Report infrastructure failure[\s\S]*?if: [^\n]+/);
  assert.ok(infraStep, 'Report infrastructure failure step found');
  assert(infraStep[0].includes('failure()'), 'fires on failure');
  assert(infraStep[0].includes("steps.audit.outcome == 'failure'"), 'checks audit outcome');
});

test('security-audit workflow: no pull_request_target trigger', { skip: !hasWorkflow }, () => {
  assert(!yaml.includes('pull_request_target'), 'must not use pull_request_target');
});

test('security-audit workflow: no continue-on-error on audit step', { skip: !hasWorkflow }, () => {
  // The audit step must not have continue-on-error: true
  const auditStep = yaml.match(/name: Run npm audit[\s\S]*?run:/);
  assert.ok(auditStep, 'Run npm audit step found');
  assert(!auditStep[0].includes('continue-on-error'), 'audit step must not have continue-on-error');
});
