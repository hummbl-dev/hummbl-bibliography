/**
 * Beyond-Base120 Audit — Memory Palace drift, duplicate, and coverage detection.
 *
 * This is the second validation pass (after Base120 validation).
 * It answers: "are the extended mental models in this content registered
 * in the Memory Palace?"
 *
 * Responsibilities:
 * - DRIFT: finds model names in content that look like extended models but
 *   aren't in the Memory Palace registry
 * - DUPLICATES: detects registry entries that may overlap (reported by
 *   auditRegistry())
 * - UNREGISTERED: flags terms that appear to be mental model references
 *   but are neither Base120 codes nor Memory Palace entries
 * - COVERAGE: reports which rooms are represented and which are empty
 *
 * What this does NOT do:
 * - Hard-block any specific term (no blocklist)
 * - Flag Base120 codes (that's the Base120 validator's job)
 * - Assume any term is automatically valid or invalid
 */

import {
  lookupMemoryPalace,
  isMemoryPalaceModel,
  auditRegistry,
  getRoom,
  getAllCanonicalNames,
  MemoryPalaceRoom,
  SourceType,
} from './memoryPalace.js';

import { validateModelCode } from '../utils/validateModelCode.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BeyondAuditSeverity = 'ERROR' | 'WARN' | 'INFO';

export interface BeyondAuditFinding {
  term: string;
  severity: BeyondAuditSeverity;
  code: string;       // Finding code e.g. "DRIFT001"
  message: string;
  source_type?: SourceType;
}

export interface BeyondAuditReport {
  scanned_terms: string[];
  findings: BeyondAuditFinding[];
  registry_health: ReturnType<typeof auditRegistry>;
  stats: {
    total_terms_scanned: number;
    registered: number;
    unregistered: number;
    base120_codes_skipped: number;
  };
}

// ---------------------------------------------------------------------------
// Known extended-model patterns (heuristic scan, not a blocklist)
// These are patterns that suggest a term is a mental model reference.
// If matched but not in Memory Palace → DRIFT warning.
// ---------------------------------------------------------------------------

/**
 * Scan text for potential unregistered extended model references.
 *
 * Strategy: look for Title Case phrases (2-4 words) that appear in a
 * "model reference" context and are NOT Base120 codes. Check each against
 * the Memory Palace. Flag anything that looks like a model but isn't registered.
 *
 * This is intentionally conservative — false negatives are preferred over
 * false positives. The goal is drift detection, not a censorship blocklist.
 */
export function scanForExtendedModels(text: string): string[] {
  // Match Title Case phrases (2-4 words, possible apostrophe or hyphen)
  // that aren't pure code patterns like P1, IN15, etc.
  const titleCasePattern = /\b([A-Z][a-z']+(?:[\s-][A-Z][a-z']+){1,3})\b/g;
  const candidates = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = titleCasePattern.exec(text)) !== null) {
    const phrase = match[1];
    // Skip if it's a Base120 code pattern
    if (/^(P|IN|CO|DE|RE|SY)\d+$/.test(phrase)) continue;
    // Skip very common non-model phrases
    if (COMMON_NON_MODELS.has(phrase.toLowerCase())) continue;
    candidates.add(phrase);
  }

  return Array.from(candidates);
}

// Common title-case phrases that are not mental models
const COMMON_NON_MODELS = new Set([
  'the following', 'for example', 'this section', 'see also',
  'note that', 'in addition', 'as follows', 'such as',
  'first principles', 'second order', 'third party',
  'united states', 'new york', 'san francisco',
]);

// ---------------------------------------------------------------------------
// Main audit function
// ---------------------------------------------------------------------------

/**
 * Audit text for beyond-Base120 model compliance.
 *
 * @param text - Content to audit
 * @param strict - In strict mode, unregistered extended model candidates
 *                 are ERROR; in default mode, they are WARN
 */
export function auditBeyondBase120(
  text: string,
  strict: boolean = false,
): BeyondAuditReport {
  const candidates = scanForExtendedModels(text);
  const findings: BeyondAuditFinding[] = [];

  let registered = 0;
  let unregistered = 0;
  let base120Skipped = 0;

  for (const term of candidates) {
    // Check if it's a Base120 code (skip — that's the other validator's job)
    const base120Check = validateModelCode(term);
    if (base120Check.isValid) {
      base120Skipped++;
      continue;
    }

    // Check Memory Palace
    if (isMemoryPalaceModel(term)) {
      registered++;
    } else {
      unregistered++;
      findings.push({
        term,
        severity: strict ? 'ERROR' : 'WARN',
        code: 'DRIFT001',
        message: `"${term}" looks like a mental model reference but is not registered in the Memory Palace. ` +
          `Add it to toolkit/src/extensions/memoryPalace.ts or confirm it is not a model reference.`,
      });
    }
  }

  // Registry health check
  const registry_health = auditRegistry();

  // Flag registry duplicates as errors
  for (const dup of registry_health.duplicateSlugs) {
    findings.push({
      term: dup,
      severity: 'ERROR',
      code: 'DUP001',
      message: `Duplicate slug in Memory Palace registry: "${dup}"`,
    });
  }

  for (const dup of registry_health.duplicateNames) {
    findings.push({
      term: dup,
      severity: 'ERROR',
      code: 'DUP002',
      message: `Duplicate name/alias in Memory Palace registry: "${dup}"`,
    });
  }

  for (const { slug, fields } of registry_health.missingFields) {
    findings.push({
      term: slug,
      severity: 'ERROR',
      code: 'REG001',
      message: `Memory Palace entry "${slug}" is missing required fields: ${fields.join(', ')}`,
    });
  }

  for (const slug of registry_health.missingSourceTypes) {
    findings.push({
      term: slug,
      severity: 'WARN',
      code: 'REG002',
      message: `Memory Palace entry "${slug}" is missing optional source_type. Add it to improve citation hygiene and staleness review.`,
    });
  }

  return {
    scanned_terms: candidates,
    findings,
    registry_health,
    stats: {
      total_terms_scanned: candidates.length,
      registered,
      unregistered,
      base120_codes_skipped: base120Skipped,
    },
  };
}

/**
 * Quick check: does content pass beyond-base120 audit?
 */
export function passesBeyondBase120(text: string, strict: boolean = false): boolean {
  const report = auditBeyondBase120(text, strict);
  return !report.findings.some(f => f.severity === 'ERROR');
}

/**
 * Format a beyond-base120 audit report for console output.
 */
export function formatBeyondReport(report: BeyondAuditReport): string {
  const lines: string[] = ['BEYOND-BASE120 AUDIT REPORT', '='.repeat(40)];

  lines.push(`Memory Palace: ${report.registry_health.totalEntries} entries`);
  const roomSummary = Object.entries(report.registry_health.byRoom)
    .map(([room, count]) => `${room}:${count}`)
    .join(' | ');
  lines.push(`Rooms: ${roomSummary}`);
  lines.push('');
  lines.push(`Scanned ${report.stats.total_terms_scanned} candidate terms`);
  lines.push(`  Registered: ${report.stats.registered}`);
  lines.push(`  Unregistered: ${report.stats.unregistered}`);
  lines.push(`  Base120 codes skipped: ${report.stats.base120_codes_skipped}`);
  lines.push('');

  if (report.findings.length === 0) {
    lines.push('✅ No findings — all extended model references are registered');
  } else {
    lines.push(`Findings (${report.findings.length}):`);
    for (const f of report.findings) {
      const icon = f.severity === 'ERROR' ? '❌' : f.severity === 'WARN' ? '⚠️' : 'ℹ️';
      const sourceType = f.source_type ? ` (source_type=${f.source_type})` : '';
      lines.push(`  ${icon} [${f.code}] ${f.message}${sourceType}`);
    }
  }

  return lines.join('\n');
}
