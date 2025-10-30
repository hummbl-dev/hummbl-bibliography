#!/usr/bin/env node
/**
 * Duplicate Entry Checker
 * Checks for duplicate citation keys across all BibTeX files
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts citation keys from a BibTeX file
 * @param {string} filePath - Path to the BibTeX file
 * @returns {array} Array of citation keys
 */
function extractCitationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  const keyRegex = /@\w+\{([^,\s]+),/g;
  
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    keys.push({ key: match[1], file: path.basename(filePath) });
  }
  
  return keys;
}

/**
 * Main duplicate checking function
 */
function main() {
  const bibliographyDir = path.join(__dirname, '..', 'bibliography');
  
  if (!fs.existsSync(bibliographyDir)) {
    console.error('Error: bibliography directory not found');
    process.exit(1);
  }
  
  const bibFiles = fs.readdirSync(bibliographyDir)
    .filter(file => file.endsWith('.bib'))
    .map(file => path.join(bibliographyDir, file));
  
  if (bibFiles.length === 0) {
    console.error('Error: No .bib files found in bibliography directory');
    process.exit(1);
  }
  
  console.log('Checking for duplicate citation keys...\n');
  
  // Collect all citation keys
  const allKeys = [];
  bibFiles.forEach(file => {
    const keys = extractCitationKeys(file);
    allKeys.push(...keys);
  });
  
  // Find duplicates
  const keyMap = new Map();
  allKeys.forEach(({ key, file }) => {
    if (!keyMap.has(key)) {
      keyMap.set(key, []);
    }
    keyMap.get(key).push(file);
  });
  
  const duplicates = [];
  keyMap.forEach((files, key) => {
    if (files.length > 1) {
      duplicates.push({ key, files });
    }
  });
  
  if (duplicates.length === 0) {
    console.log('✓ No duplicate citation keys found');
    console.log(`Total unique keys: ${keyMap.size}`);
    process.exit(0);
  } else {
    console.log('✗ Duplicate citation keys found:\n');
    duplicates.forEach(({ key, files }) => {
      console.log(`  Key: "${key}"`);
      console.log(`  Found in: ${files.join(', ')}`);
      console.log('');
    });
    console.log(`Total duplicates: ${duplicates.length}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractCitationKeys };
