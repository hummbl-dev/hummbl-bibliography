/**
 * Runtime monitoring for HUMMBL Base120 model references
 * Prevents hallucination by monitoring agent outputs in real-time
 */

import { validateModelCode, ModelCode } from './validateModelCode.js';

export interface AuditReport {
  references: ModelReference[];
  hallucinations: string[];
  validationErrors: string[];
}

export interface ModelReference {
  code: string;
  name?: string;
  isValid: boolean;
  position: number;
}

const MODEL_REFERENCE_PATTERN = /(^|[^A-Za-z0-9_])(P|IN|CO|DE|RE|SY)(\d+)(?![A-Za-z0-9_])/g;

/**
 * Monitors agent output for mental model references and hallucinations
 */
export function monitorModelReferences(output: string): {
  valid: ModelCode[];
  invalid: string[];
  hallucinations: string[];
} {
  const matches = [...output.matchAll(MODEL_REFERENCE_PATTERN)];

  const valid: ModelCode[] = [];
  const invalid: string[] = [];

  matches.forEach(([, , transformation, num]) => {
    const code = `${transformation}${num}`;
    const result = validateModelCode(code);

    if (result.isValid) {
      valid.push(code as ModelCode);
    } else {
      invalid.push(code);
    }
  });

  // Check for hallucinated terms
  const hallucinations = detectHallucinations(output);

  return { valid, invalid, hallucinations };
}

/**
 * Comprehensive audit of text for model compliance
 */
export function auditText(text: string): AuditReport {
  const references = extractReferences(text);
  const hallucinations = detectHallucinations(text);
  const validationErrors = findValidationErrors(text);

  return {
    references,
    hallucinations,
    validationErrors
  };
}

/**
 * Extract all model references from text
 */
function extractReferences(text: string): ModelReference[] {
  const matches = [...text.matchAll(MODEL_REFERENCE_PATTERN)];

  return matches.map((match, index) => {
    const prefix = match[1] ?? '';
    const transformation = match[2];
    const num = match[3];
    const code = `${transformation}${num}`;
    const result = validateModelCode(code);

    return {
      code,
      name: result.name,
      isValid: result.isValid,
      position: (match.index || 0) + prefix.length
    };
  });
}

/**
 * Detect hallucinated mental model references.
 * Governed ARCANA models and BaseN extensions are excluded from hallucination
 * detection — they are first-class governed models, not noise.
 */
/**
 * Hallucination detection removed — use beyondBase120Audit.ts (Memory Palace)
 * for extended model drift detection. No-op retained for interface compat.
 */
function detectHallucinations(_text: string): string[] {
  return [];
}

/**
 * Find validation errors in model references
 */
function findValidationErrors(text: string): string[] {
  const errors: string[] = [];
  const references = extractReferences(text);

  references.forEach(ref => {
    if (!ref.isValid) {
      errors.push(`Invalid model code: ${ref.code}`);
    }
  });

  return errors;
}

/**
 * Check if output passes model validation
 */
export function passesValidation(output: string): boolean {
  const { invalid, hallucinations } = monitorModelReferences(output);
  return invalid.length === 0 && hallucinations.length === 0;
}

/**
 * Generate validation report for logging
 */
export function generateValidationReport(output: string): string {
  const audit = auditText(output);
  const { valid, invalid, hallucinations } = monitorModelReferences(output);

  let report = 'MENTAL MODEL VALIDATION REPORT\n';
  report += '='.repeat(40) + '\n\n';

  report += `Valid references (${valid.length}): ${valid.join(', ') || 'None'}\n`;
  report += `Invalid references (${invalid.length}): ${invalid.join(', ') || 'None'}\n`;
  report += `Hallucinations detected (${hallucinations.length}): ${hallucinations.join(', ') || 'None'}\n\n`;

  if (audit.validationErrors.length > 0) {
    report += 'Validation Errors:\n';
    audit.validationErrors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  }

  const overallStatus = passesValidation(output) ? '✅ PASS' : '❌ FAIL';
  report += `Overall Status: ${overallStatus}\n`;

  return report;
}
