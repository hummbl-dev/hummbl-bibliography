#!/usr/bin/env node
/**
 * Format Exporter
 * Exports bibliography to different formats (JSON, Markdown, etc.)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parses a BibTeX file into structured data
 * @param {string} filePath - Path to the BibTeX file
 * @returns {array} Array of parsed entries
 */
function parseBibTeXFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = [];
  const entryRegex = /@(\w+)\{([^,\s]+),([\s\S]*?)\n\}/g;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1];
    const key = match[2];
    const body = match[3];
    
    const entry = {
      type,
      key,
      fields: {}
    };
    
    // Extract fields
    const fieldRegex = /(\w+)\s*=\s*\{([^}]+)\}/g;
    let fieldMatch;
    
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldValue = fieldMatch[2];
      entry.fields[fieldName] = fieldValue;
    }
    
    entries.push(entry);
  }
  
  return entries;
}

/**
 * Exports bibliography to JSON format
 * @param {array} entries - Parsed bibliography entries
 * @param {string} outputPath - Output file path
 */
function exportToJSON(entries, outputPath) {
  const json = JSON.stringify(entries, null, 2);
  fs.writeFileSync(outputPath, json);
  console.log(`✓ Exported to JSON: ${outputPath}`);
}

/**
 * Exports bibliography to Markdown format
 * @param {array} entries - Parsed bibliography entries
 * @param {string} outputPath - Output file path
 */
function exportToMarkdown(entries, outputPath) {
  let markdown = '# HUMMBL Bibliography\n\n';
  
  const groupedByTier = {
    'tier1-core': [],
    'tier2-applied': [],
    'tier3-emerging': []
  };
  
  entries.forEach(entry => {
    const tier = entry.source ? entry.source.replace('.bib', '') : 'other';
    if (groupedByTier[tier]) {
      groupedByTier[tier].push(entry);
    }
  });
  
  const tierTitles = {
    'tier1-core': '## Tier 1: Core References',
    'tier2-applied': '## Tier 2: Applied References',
    'tier3-emerging': '## Tier 3: Emerging References'
  };
  
  Object.entries(groupedByTier).forEach(([tier, tierEntries]) => {
    if (tierEntries.length > 0) {
      markdown += `${tierTitles[tier]}\n\n`;
      
      tierEntries.forEach(entry => {
        const fields = entry.fields;
        markdown += `### ${fields.title || 'Untitled'}\n\n`;
        
        if (fields.author) {
          markdown += `**Authors:** ${fields.author}\n\n`;
        }
        
        if (fields.year) {
          markdown += `**Year:** ${fields.year}\n\n`;
        }
        
        if (fields.journal || fields.booktitle || fields.publisher) {
          markdown += `**Published in:** ${fields.journal || fields.booktitle || fields.publisher}\n\n`;
        }
        
        if (fields.keywords) {
          markdown += `**Keywords:** ${fields.keywords}\n\n`;
        }
        
        markdown += `**Citation key:** \`${entry.key}\`\n\n`;
        markdown += '---\n\n';
      });
    }
  });
  
  fs.writeFileSync(outputPath, markdown);
  console.log(`✓ Exported to Markdown: ${outputPath}`);
}

/**
 * Main export function
 */
function main() {
  const bibliographyDir = path.join(__dirname, '..', 'bibliography');
  const outputDir = path.join(__dirname, '..', 'docs');
  
  if (!fs.existsSync(bibliographyDir)) {
    console.error('Error: bibliography directory not found');
    process.exit(1);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const bibFiles = fs.readdirSync(bibliographyDir)
    .filter(file => file.endsWith('.bib'))
    .map(file => path.join(bibliographyDir, file));
  
  if (bibFiles.length === 0) {
    console.error('Error: No .bib files found in bibliography directory');
    process.exit(1);
  }
  
  console.log('Exporting bibliography to various formats...\n');
  
  // Parse all entries
  const allEntries = [];
  bibFiles.forEach(file => {
    const entries = parseBibTeXFile(file);
    const tierName = path.basename(file).replace('.bib', '');
    entries.forEach(entry => {
      entry.source = path.basename(file);
      entry.tier = tierName;
    });
    allEntries.push(...entries);
  });
  
  console.log(`Total entries parsed: ${allEntries.length}\n`);
  
  // Export to different formats
  const jsonPath = path.join(outputDir, 'bibliography.json');
  const markdownPath = path.join(outputDir, 'BIBLIOGRAPHY.md');
  
  exportToJSON(allEntries, jsonPath);
  exportToMarkdown(allEntries, markdownPath);
  
  console.log('\n✓ Export complete\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { parseBibTeXFile, exportToJSON, exportToMarkdown };
