#!/usr/bin/env node
/**
 * Statistics Generator
 * Generates comprehensive statistics about the bibliography
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts detailed information from a BibTeX file
 * @param {string} filePath - Path to the BibTeX file
 * @returns {object} File statistics
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  const stats = {
    fileName,
    entryCount: 0,
    types: {},
    years: [],
    authors: new Set(),
    keywords: new Set()
  };
  
  // Extract entries
  const entryRegex = /@(\w+)\{([^,\s]+),([\s\S]*?)\n\}/g;
  let match;
  
  while ((match = entryRegex.exec(content)) !== null) {
    const type = match[1].toLowerCase();
    const body = match[3];
    
    stats.entryCount++;
    stats.types[type] = (stats.types[type] || 0) + 1;
    
    // Extract year
    const yearMatch = body.match(/year\s*=\s*\{?(\d{4})\}?/);
    if (yearMatch) {
      stats.years.push(parseInt(yearMatch[1], 10));
    }
    
    // Extract authors
    const authorMatch = body.match(/author\s*=\s*\{([^}]+)\}/);
    if (authorMatch) {
      const authors = authorMatch[1].split(' and ');
      authors.forEach(author => stats.authors.add(author.trim()));
    }
    
    // Extract keywords
    const keywordMatch = body.match(/keywords\s*=\s*\{([^}]+)\}/);
    if (keywordMatch) {
      const keywords = keywordMatch[1].split(',');
      keywords.forEach(keyword => stats.keywords.add(keyword.trim()));
    }
  }
  
  return stats;
}

/**
 * Main statistics generation function
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
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         HUMMBL Bibliography Statistics Report              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Analyze all files
  const fileStats = bibFiles.map(file => analyzeFile(file));
  
  // Aggregate statistics
  const totalEntries = fileStats.reduce((sum, stat) => sum + stat.entryCount, 0);
  const allTypes = {};
  const allYears = [];
  const allAuthors = new Set();
  const allKeywords = new Set();
  
  fileStats.forEach(stat => {
    Object.entries(stat.types).forEach(([type, count]) => {
      allTypes[type] = (allTypes[type] || 0) + count;
    });
    allYears.push(...stat.years);
    stat.authors.forEach(author => allAuthors.add(author));
    stat.keywords.forEach(keyword => allKeywords.add(keyword));
  });
  
  // Display per-tier statistics
  console.log('📊 Per-Tier Statistics\n');
  fileStats.forEach(stat => {
    console.log(`  ${stat.fileName}`);
    console.log(`    Entries: ${stat.entryCount}`);
    console.log(`    Authors: ${stat.authors.size}`);
    console.log(`    Keywords: ${stat.keywords.size}`);
    if (stat.years.length > 0) {
      const minYear = Math.min(...stat.years);
      const maxYear = Math.max(...stat.years);
      console.log(`    Year range: ${minYear}-${maxYear}`);
    }
    console.log('');
  });
  
  // Display aggregate statistics
  console.log('📈 Aggregate Statistics\n');
  console.log(`  Total entries: ${totalEntries}`);
  console.log(`  Total files: ${bibFiles.length}`);
  console.log(`  Unique authors: ${allAuthors.size}`);
  console.log(`  Unique keywords: ${allKeywords.size}`);
  
  if (allYears.length > 0) {
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    const avgYear = Math.round(allYears.reduce((a, b) => a + b, 0) / allYears.length);
    console.log(`  Year range: ${minYear}-${maxYear}`);
    console.log(`  Average year: ${avgYear}`);
  }
  
  console.log('\n📚 Entry Types\n');
  Object.entries(allTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / totalEntries) * 100).toFixed(1);
      console.log(`  @${type}: ${count} (${percentage}%)`);
    });
  
  console.log('\n🏷️  Top Keywords\n');
  const keywordCounts = new Map();
  fileStats.forEach(stat => {
    stat.keywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });
  });
  
  Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([keyword, count]) => {
      console.log(`  ${keyword}: ${count}`);
    });
  
  console.log('\n✓ Statistics generation complete\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile };
