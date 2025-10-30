#!/usr/bin/env node
/**
 * Tier Structure Validator
 * Validates the three-tier structure of the bibliography
 */

const fs = require('fs');
const path = require('path');

/**
 * Main tier checking function
 */
function main() {
  const bibliographyDir = path.join(__dirname, '..', 'bibliography');
  
  if (!fs.existsSync(bibliographyDir)) {
    console.error('Error: bibliography directory not found');
    process.exit(1);
  }
  
  console.log('Validating three-tier structure...\n');
  
  const requiredTiers = [
    { name: 'tier1-core.bib', description: 'Core References' },
    { name: 'tier2-applied.bib', description: 'Applied References' },
    { name: 'tier3-emerging.bib', description: 'Emerging References' }
  ];
  
  let allValid = true;
  const tierInfo = [];
  
  requiredTiers.forEach(tier => {
    const tierPath = path.join(bibliographyDir, tier.name);
    const exists = fs.existsSync(tierPath);
    
    console.log(`Tier: ${tier.name} (${tier.description})`);
    
    if (exists) {
      const content = fs.readFileSync(tierPath, 'utf8');
      const entryMatches = content.match(/@\w+\{/g);
      const entryCount = entryMatches ? entryMatches.length : 0;
      
      console.log(`  ✓ File exists`);
      console.log(`  Entries: ${entryCount}`);
      
      tierInfo.push({ name: tier.name, exists: true, entryCount });
    } else {
      console.log(`  ✗ File not found`);
      allValid = false;
      tierInfo.push({ name: tier.name, exists: false, entryCount: 0 });
    }
    
    console.log('');
  });
  
  // Check for unexpected files
  const allFiles = fs.readdirSync(bibliographyDir);
  const bibFiles = allFiles.filter(file => file.endsWith('.bib'));
  const expectedFiles = requiredTiers.map(t => t.name);
  const unexpectedFiles = bibFiles.filter(file => !expectedFiles.includes(file));
  
  if (unexpectedFiles.length > 0) {
    console.log('⚠ Unexpected .bib files found:');
    unexpectedFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('');
  }
  
  // Summary
  const totalEntries = tierInfo.reduce((sum, tier) => sum + tier.entryCount, 0);
  console.log(`Total entries across all tiers: ${totalEntries}`);
  
  if (allValid) {
    console.log('\n✓ Three-tier structure is valid');
    process.exit(0);
  } else {
    console.log('\n✗ Three-tier structure is incomplete');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
