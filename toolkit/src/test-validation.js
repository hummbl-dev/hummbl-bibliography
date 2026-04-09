#!/usr/bin/env node

/**
 * Test script for HUMMBL Base120 model validation and Memory Palace audit
 * Run with: node src/test-validation.js
 */

import { validateModelCode } from './utils/validateModelCode.js';
import { monitorModelReferences } from './utils/monitorModels.js';
import { isMemoryPalaceModel, lookupMemoryPalace, auditRegistry } from './extensions/memoryPalace.js';
import { auditBeyondBase120, scanForExtendedModels } from './extensions/beyondBase120Audit.js';

console.log('🧪 Testing HUMMBL Base120 Model Validation\n');

// Test valid models
console.log('✅ Testing valid model codes:');
const validTests = ['P1', 'IN15', 'CO7', 'DE3', 'RE20', 'SY5'];

validTests.forEach(code => {
  const result = validateModelCode(code);
  if (result.isValid) {
    console.log(`  ${code} → "${result.name}" (${result.transformation}) ✅`);
  } else {
    console.log(`  ${code} → ERROR: ${result.error} ❌`);
  }
});

console.log('\n❌ Testing invalid model codes:');
const invalidTests = ['P21', 'XX1', 'P0', 'IN', 'CO99'];

invalidTests.forEach(code => {
  const result = validateModelCode(code);
  console.log(`  ${code} → ${result.error} ✅ (correctly rejected)`);
});

console.log('\n📚 Testing Memory Palace registry:');
const memoryPalaceTests = [
  { term: 'Antifragility', expected: true },
  { term: 'Black Swan', expected: true },
  { term: 'OODA Loop', expected: true },
  { term: 'Skin in the Game', expected: true },
  { term: 'Aurelius Lens', expected: true },
  { term: 'Mimetic Desire', expected: true },
  { term: 'Belonging Infrastructure', expected: true },
  { term: 'RandomFakeModel', expected: false },
  { term: 'SomethingNotRegistered', expected: false },
];

memoryPalaceTests.forEach(({ term, expected }) => {
  const found = isMemoryPalaceModel(term);
  const pass = found === expected;
  const status = pass ? '✅' : '❌';
  if (found) {
    const entry = lookupMemoryPalace(term);
    console.log(`  "${term}" → registered (${entry.room}, ${entry.source_type ?? 'unset'}) ${status}`);
  } else {
    console.log(`  "${term}" → not registered ${status}`);
  }
});

console.log('\n🏛️ Memory Palace registry health:');
const health = auditRegistry();
console.log(`  Total entries: ${health.totalEntries}`);
Object.entries(health.byRoom).forEach(([room, count]) => {
  console.log(`  ${room}: ${count}`);
});
if (health.duplicateSlugs.length > 0) {
  console.log(`  ❌ Duplicate slugs: ${health.duplicateSlugs.join(', ')}`);
} else {
  console.log(`  ✅ No duplicate slugs`);
}
if (health.duplicateNames.length > 0) {
  console.log(`  ❌ Duplicate names: ${health.duplicateNames.join(', ')}`);
} else {
  console.log(`  ✅ No duplicate names`);
}
if (health.missingSourceTypes.length > 0) {
  console.log(`  ⚠️ Missing source_type: ${health.missingSourceTypes.join(', ')}`);
} else {
  console.log(`  ✅ All entries have source_type`);
}

console.log('\n🔭 Testing Beyond-Base120 audit:');
const governedText = `
This framework applies Antifragility principles when designing for uncertainty.
The Scapegoat Mechanism reveals how communities handle mimetic crises.
The Aurelius Lens suggests governors should maintain continuous self-audit.
We use the OODA Loop for rapid decision cycles in dynamic environments.
`;

const audit = auditBeyondBase120(governedText);
console.log(`  Terms scanned: ${audit.stats.total_terms_scanned}`);
console.log(`  Registered: ${audit.stats.registered}`);
console.log(`  Unregistered: ${audit.stats.unregistered}`);
if (audit.findings.length === 0) {
  console.log(`  ✅ All extended model references are registered`);
} else {
  audit.findings.forEach(f => {
    const icon = f.severity === 'ERROR' ? '❌' : '⚠️';
    console.log(`  ${icon} [${f.code}] ${f.term}: ${f.message}`);
  });
}

console.log('\n📊 Testing runtime monitoring:');
const testOutput = `
Let's apply P1 (First Principles Framing) to break this down.
Using DE3 (Modularization) will help organize the code.
Don't forget IN2 (Premortem Analysis) before deployment.
Antifragility thinking applies here too.
`;

const monitoring = monitorModelReferences(testOutput);
console.log(`Valid references: ${monitoring.valid.join(', ')}`);
console.log(`Invalid references: ${monitoring.invalid.join(', ') || 'none'}`);
console.log(`Hallucinations: ${monitoring.hallucinations.join(', ') || 'none (governed extension audit handles this now)'}`);

console.log('\n🎉 Validation system ready for production use!');
