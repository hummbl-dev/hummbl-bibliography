const fs = require('fs');
const path = require('path');
const contractsDir = path.join('..', 'hummbl-research', '_grounding-contracts');
const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md'));

// The issue is the lookahead matching table separator rows (---)
// Let's test a better regex that doesn't stop at table separators
for (const file of files) {
  if (file === 'Wave4B_ARCANA_Grounding_Contract.md') continue;
  
  const content = fs.readFileSync(path.join(contractsDir, file), 'utf8');
  
  // Try without --- in lookahead, or with a more specific pattern
  const bibSectionMatch = content.match(/### New Bibliography Keys \([0-9]+ entries\)([\s\S]*?)(?=### Suggested Model Grounding|### [A-Z]|---$|```)/);
  console.log('File:', file);
  console.log('  bibSectionMatch length:', bibSectionMatch ? bibSectionMatch[1].length : 'NOT FOUND');
  if (bibSectionMatch) {
    console.log('  First 200 chars:', bibSectionMatch[1].substring(0, 200));
  }
  
  const modelSectionMatch = content.match(/### Suggested Model Grounding \([0-9]+ models?\)([\s\S]*?)(?=###|---$|```)/);
  console.log('  modelSectionMatch length:', modelSectionMatch ? modelSectionMatch[1].length : 'NOT FOUND');
  if (modelSectionMatch) {
    console.log('  First 200 chars:', modelSectionMatch[1].substring(0, 200));
  }
}