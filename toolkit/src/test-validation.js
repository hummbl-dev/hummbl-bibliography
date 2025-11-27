#!/usr/bin/env node

/**
 * Test script for HUMMBL Base120 model validation
 * Run with: node src/test-validation.js
 */

import { validateModelCode, isLikelyHallucination } from './utils/validateModelCode.js';
import { monitorModelReferences } from './utils/monitorModels.js';

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

console.log('\n🚨 Testing hallucination detection:');
const hallucinationTests = [
  'This uses OODA Loop for decision making',
  'According to Hanlon\'s Razor...',
  'Using Occam\'s Razor principle',
  'This is a clean implementation with no hallucinations'
];

hallucinationTests.forEach(text => {
  const isHallucination = isLikelyHallucination(text);
  const status = isHallucination ? '🚨 HALLUCINATION DETECTED' : '✅ Clean';
  console.log(`  "${text}" → ${status}`);
});

console.log('\n📊 Testing runtime monitoring:');
const testOutput = `
Let's apply P1 (First Principles Framing) to break this down.
We should avoid OODA Loop thinking here.
Using DE3 (Modularization) will help organize the code.
Don't forget IN2 (Premortem Analysis) before deployment.
`;

const monitoring = monitorModelReferences(testOutput);
console.log(`Valid references: ${monitoring.valid.join(', ')}`);
console.log(`Invalid references: ${monitoring.invalid.join(', ')}`);
console.log(`Hallucinations: ${monitoring.hallucinations.join(', ')}`);

console.log('\n🎉 Validation system ready for production use!');
