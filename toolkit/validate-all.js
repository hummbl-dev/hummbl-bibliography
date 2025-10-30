#!/usr/bin/env node
/**
 * Comprehensive Validator
 * Runs all validation scripts in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Runs a validation script
 * @param {string} scriptName - Name of the script to run
 * @returns {object} Result of the validation
 */
function runValidator(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${scriptName}`);
    console.log('='.repeat(60));
    
    const output = execSync(`node "${scriptPath}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(output);
    return { success: true, script: scriptName };
  } catch (error) {
    console.log(error.stdout || error.message);
    return { success: false, script: scriptName, error: error.message };
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        HUMMBL Bibliography - Comprehensive Validation      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const validators = [
    'check-tiers.js',
    'validate-bibtex.js',
    'check-duplicates.js',
    'validate-keywords.js',
    'generate-stats.js'
  ];
  
  const results = [];
  
  validators.forEach(validator => {
    const result = runValidator(validator);
    results.push(result);
  });
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal validators: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    console.log(`  ${status} ${result.script}`);
  });
  
  if (failed === 0) {
    console.log('\n✓ All validations passed!\n');
    process.exit(0);
  } else {
    console.log('\n✗ Some validations failed\n');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runValidator };
