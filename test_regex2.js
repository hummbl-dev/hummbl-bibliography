const fs = require('fs');
const path = require('path');
const contractsDir = path.join('..', 'hummbl-research', '_grounding-contracts');
const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(contractsDir, file), 'utf8');
  
  // Test the section extraction regex with different patterns
  const bibSectionMatch = content.match(/### New Bibliography Keys \([0-9]+ entries\)([\s\S]*?)(?=###|---|```)/);
  console.log('File:', file);
  console.log('  bibSectionMatch length:', bibSectionMatch ? bibSectionMatch[1].length : 'NOT FOUND');
  if (bibSectionMatch) {
    console.log('  First 200 chars:', bibSectionMatch[1].substring(0, 200));
  }
  
  const modelSectionMatch = content.match(/### Suggested Model Grounding \([0-9]+ models?\)([\s\S]*?)(?=###|---|```)/);
  console.log('  modelSectionMatch length:', modelSectionMatch ? modelSectionMatch[1].length : 'NOT FOUND');
  if (modelSectionMatch) {
    console.log('  First 200 chars:', modelSectionMatch[1].substring(0, 200));
  }
}