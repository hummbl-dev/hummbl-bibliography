const fs = require('fs');
const path = require('path');
const contractsDir = path.join('..', 'hummbl-research', '_grounding-contracts');
const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md') && !f.includes('Wave4B'));

for (const file of files) {
  const content = fs.readFileSync(path.join(contractsDir, file), 'utf8');
  
  // Test the regex
  const bibSectionMatch = content.match(/### New Bibliography Keys \([0-9]+ entries\)([\s\S]*?)(?=### Suggested Model Grounding|### [A-Z]|---$|```)/);
  console.log('File:', file);
  console.log('  bibSectionMatch:', bibSectionMatch ? 'FOUND (' + bibSectionMatch[1].length + ' chars)' : 'NOT FOUND');
  
  const modelSectionMatch = content.match(/### Suggested Model Grounding \([0-9]+ models?\)([\s\S]*?)(?=###|---$|```)/);
  console.log('  modelSectionMatch:', modelSectionMatch ? 'FOUND (' + modelSectionMatch[1].length + ' chars)' : 'NOT FOUND');
}