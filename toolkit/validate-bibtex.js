#!/usr/bin/env node
/**
 * BibTeX Validation Script
 * Validates the syntax and structure of BibTeX files
 */

const fs = require('fs');
const path = require('path');

/**
 * Validates a single BibTeX file
 * @param {string} filePath - Path to the BibTeX file
 * @returns {object} Validation result
 */
function validateBibTeXFile(filePath) {
  const errors = [];
  const warnings = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check if file is empty
    if (content.trim().length === 0) {
      errors.push(`${fileName}: File is empty`);
      return { valid: false, errors, warnings };
    }
    
    // Count entries
    const entryMatches = content.match(/@\w+\{/g);
    const entryCount = entryMatches ? entryMatches.length : 0;
    
    if (entryCount === 0) {
      warnings.push(`${fileName}: No BibTeX entries found`);
    }
    
    // Check for balanced braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push(`${fileName}: Unbalanced braces (${openBraces} opening, ${closeBraces} closing)`);
    }
    
    // Check for required fields in entries
    const entries = content.match(/@(\w+)\{([^,]+),[\s\S]*?\n\}/g) || [];
    entries.forEach((entry, index) => {
      const typeMatch = entry.match(/@(\w+)\{/);
      const type = typeMatch ? typeMatch[1].toLowerCase() : '';
      
      // Check for common required fields
      const hasAuthor = /author\s*=/.test(entry);
      const hasTitle = /title\s*=/.test(entry);
      const hasYear = /year\s*=/.test(entry);
      
      if (!hasAuthor && type !== 'misc') {
        warnings.push(`${fileName}: Entry ${index + 1} (@${type}) missing 'author' field`);
      }
      if (!hasTitle) {
        warnings.push(`${fileName}: Entry ${index + 1} (@${type}) missing 'title' field`);
      }
      if (!hasYear) {
        warnings.push(`${fileName}: Entry ${index + 1} (@${type}) missing 'year' field`);
      }
    });
    
    const valid = errors.length === 0;
    return { valid, errors, warnings, entryCount };
  } catch (error) {
    errors.push(`${filePath}: ${error.message}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * Main validation function
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
  
  console.log('Validating BibTeX files...\n');
  
  let allValid = true;
  let totalEntries = 0;
  
  bibFiles.forEach(file => {
    const result = validateBibTeXFile(file);
    const fileName = path.basename(file);
    
    console.log(`📄 ${fileName}`);
    
    if (result.entryCount !== undefined) {
      console.log(`   Entries: ${result.entryCount}`);
      totalEntries += result.entryCount;
    }
    
    if (result.valid) {
      console.log(`   ✓ Valid`);
    } else {
      console.log(`   ✗ Invalid`);
      allValid = false;
    }
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`   ERROR: ${error}`));
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => console.log(`   WARNING: ${warning}`));
    }
    
    console.log('');
  });
  
  console.log(`Total entries across all files: ${totalEntries}`);
  
  if (allValid) {
    console.log('\n✓ All BibTeX files are valid');
    process.exit(0);
  } else {
    console.log('\n✗ Some BibTeX files have errors');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateBibTeXFile };
