/**
 * Runtime monitoring for HUMMBL Base120 model references
 * Prevents hallucination by monitoring agent outputs in real-time
 */

import { validateModelCode, isLikelyHallucination, ModelCode } from './validateModelCode.js';

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

/**
 * Monitors agent output for mental model references and hallucinations
 */
export function monitorModelReferences(output: string): {
  valid: ModelCode[];
  invalid: string[];
  hallucinations: string[];
} {
  const modelPattern = /(P|IN|CO|DE|RE|SY)(\d+)/g;
  const matches = [...output.matchAll(modelPattern)];

  const valid: ModelCode[] = [];
  const invalid: string[] = [];

  matches.forEach(([fullMatch, transformation, num]) => {
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
  const modelPattern = /(P|IN|CO|DE|RE|SY)(\d+)/g;
  const matches = [...text.matchAll(modelPattern)];

  return matches.map((match, index) => {
    const code = `${match[1]}${match[2]}`;
    const result = validateModelCode(code);

    return {
      code,
      name: result.name,
      isValid: result.isValid,
      position: match.index || 0
    };
  });
}

/**
 * Detect hallucinated mental model references
 */
function detectHallucinations(text: string): string[] {
  const forbidden = [
    'OODA Loop', 'Hanlon\'s Razor', 'Occam\'s Razor',
    'Antifragility', 'Black Swan', 'Survivorship Bias',
    'Circle of Competence', 'Map vs Territory'
  ];

  return forbidden.filter(term =>
    text.toLowerCase().includes(term.toLowerCase())
  );
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
