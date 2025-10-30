#!/usr/bin/env node
/**
 * Keyword Validator
 * Validates that entries have appropriate keywords and checks keyword consistency
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts entries with their keywords from a BibTeX file
 * @param {string} filePath - Path to the BibTeX file
 * @returns {array} Array of entries with keywords
 */
function extractKeywords(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  const entryRegex = /@(\w+)\{([^,\s]+),([\s\S]*?)\n\}/g;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1];
    const key = match[2];
    const body = match[3];
    
    const keywordMatch = body.match(/keywords\s*=\s*\{([^}]+)\}/);
    const keywords = keywordMatch ? keywordMatch[1].split(',').map(k => k.trim()) : [];
    
    entries.push({ type, key, keywords, file: path.basename(filePath) });
  }
  
  return entries;
}

/**
 * Main keyword validation function
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
  
  console.log('Validating keywords...\n');
  
  // Collect all entries with keywords
  const allEntries = [];
  bibFiles.forEach(file => {
    const entries = extractKeywords(file);
    allEntries.push(...entries);
  });
  
  // Check for entries without keywords
  const entriesWithoutKeywords = allEntries.filter(entry => entry.keywords.length === 0);
  
  // Collect all unique keywords
  const allKeywords = new Set();
  allEntries.forEach(entry => {
    entry.keywords.forEach(keyword => allKeywords.add(keyword));
  });
  
  console.log(`Total entries: ${allEntries.length}`);
  console.log(`Unique keywords: ${allKeywords.size}`);
  console.log(`\nKeywords found: ${Array.from(allKeywords).sort().join(', ')}`);
  console.log('');
  
  if (entriesWithoutKeywords.length > 0) {
    console.log('⚠ Entries without keywords:');
    entriesWithoutKeywords.forEach(entry => {
      console.log(`  - ${entry.key} in ${entry.file}`);
    });
    console.log('');
  }
  
  // Check keyword distribution by tier
  const tierKeywords = new Map();
  bibFiles.forEach(file => {
    const fileName = path.basename(file);
    const entries = extractKeywords(file);
    const keywords = new Set();
    entries.forEach(entry => {
      entry.keywords.forEach(k => keywords.add(k));
    });
    tierKeywords.set(fileName, keywords);
  });
  
  console.log('Keyword distribution by tier:');
  tierKeywords.forEach((keywords, file) => {
    console.log(`  ${file}: ${keywords.size} unique keywords`);
  });
  
  if (entriesWithoutKeywords.length > 0) {
    console.log('\n⚠ Some entries are missing keywords (recommended but not required)');
  } else {
    console.log('\n✓ All entries have keywords');
  }
  
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { extractKeywords };
