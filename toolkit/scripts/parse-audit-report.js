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
//
// Schema rules (strict — no permissive coercion):
//   - auditReportVersion must be a supported positive integer (currently: 2)
//   - metadata.vulnerabilities must be an object
//   - Each count field (info, low, moderate, high, critical, total) must be:
//       a finite, non-negative integer (type number, not string)
//   - Missing count fields default to 0 (npm audit omits zero counts in some versions)
//   - total must equal the sum of the five severity counts
//   - Any schema violation → audit_valid=false, exit 1

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';

const SUPPORTED_AUDIT_VERSIONS = new Set([2]);
const SEVERITY_LEVELS = ['info', 'low', 'moderate', 'high', 'critical'];

class SchemaError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

function fail(reason) {
  console.log('audit_valid=false');
  console.log('vulnerability_count=0');
  console.log('error=' + reason);
  exit(1);
}

const reportPath = process.argv[2];

if (!reportPath) {
  fail('missing-path');
}

let raw;
try {
  raw = readFileSync(reportPath, 'utf8');
} catch (e) {
  fail('file-not-found');
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  fail('malformed-json');
}

try {
  // Validate auditReportVersion — must be a supported version
  if (typeof parsed.auditReportVersion !== 'number' ||
      !Number.isInteger(parsed.auditReportVersion) ||
      !SUPPORTED_AUDIT_VERSIONS.has(parsed.auditReportVersion)) {
    throw new SchemaError('unsupported-audit-version');
  }

  // Validate metadata.vulnerabilities exists and is an object
  const vulnMeta = parsed.metadata?.vulnerabilities;
  if (typeof vulnMeta !== 'object' || vulnMeta === null || Array.isArray(vulnMeta)) {
    throw new SchemaError('missing-vulnerability-metadata');
  }

  // Strict count validation: must be a finite, non-negative integer of type number.
  // Strings, objects, arrays, booleans, null, NaN, Infinity, negatives, and
  // fractions are all rejected. Missing fields default to 0.
  function strictCount(v, field) {
    if (v === undefined) return 0;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
      throw new SchemaError('invalid-count:' + field);
    }
    return v;
  }

  const counts = {};
  for (const level of SEVERITY_LEVELS) {
    counts[level] = strictCount(vulnMeta[level], level);
  }

  // Validate total: must be a strict count, and must equal the sum of severity counts
  const totalRaw = vulnMeta.total;
  if (totalRaw !== undefined) {
    const total = strictCount(totalRaw, 'total');
    const severitySum = SEVERITY_LEVELS.reduce((sum, l) => sum + counts[l], 0);
    if (total !== severitySum) {
      throw new SchemaError('total-mismatch');
    }
    counts.total = total;
  } else {
    // If total is missing, compute it from severity counts
    counts.total = SEVERITY_LEVELS.reduce((sum, l) => sum + counts[l], 0);
  }

  console.log('audit_valid=true');
  console.log('vulnerability_count=' + counts.total);
  for (const level of SEVERITY_LEVELS) {
    console.log('vuln_' + level + '=' + counts[level]);
  }
  exit(0);
} catch (e) {
  if (e instanceof SchemaError) {
    fail(e.reason);
  }
  throw e;
}
