#!/usr/bin/env node
// parse-audit-report.js — Validate npm audit JSON and emit GitHub Actions step outputs.
//
// Usage: node parse-audit-report.js <path-to-audit-report.json>
//
// Exit codes:
//   0 — valid audit report (zero or nonzero vulnerabilities)
//   1 — infrastructure/tooling failure (missing file, malformed JSON, not an audit report)
//
// Outputs (written to stdout, intended for >> "$GITHUB_OUTPUT"):
//   audit_valid=true|false
//   vulnerability_count=<number>
//   vuln_info=<number>
//   vuln_low=<number>
//   vuln_moderate=<number>
//   vuln_high=<number>
//   vuln_critical=<number>
//   error=<reason>           (only when audit_valid=false)

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';

const reportPath = process.argv[2];

if (!reportPath) {
  console.log('audit_valid=false');
  console.log('vulnerability_count=0');
  console.log('error=missing-path');
  exit(1);
}

let raw;
try {
  raw = readFileSync(reportPath, 'utf8');
} catch (e) {
  console.log('audit_valid=false');
  console.log('vulnerability_count=0');
  console.log('error=file-not-found');
  exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.log('audit_valid=false');
  console.log('vulnerability_count=0');
  console.log('error=malformed-json');
  exit(1);
}

// Validate this is an npm audit report, not arbitrary JSON or an npm error object
if (!parsed.auditReportVersion) {
  console.log('audit_valid=false');
  console.log('vulnerability_count=0');
  console.log('error=not-audit-report');
  exit(1);
}

const vulnMeta = parsed.metadata?.vulnerabilities || {};
const total = vulnMeta.total ?? 0;

console.log('audit_valid=true');
console.log('vulnerability_count=' + total);
for (const level of ['info', 'low', 'moderate', 'high', 'critical']) {
  console.log('vuln_' + level + '=' + (vulnMeta[level] ?? 0));
}
exit(0);
