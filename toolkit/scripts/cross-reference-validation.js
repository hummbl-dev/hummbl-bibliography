#!/usr/bin/env node
/**
 * Wave 7A — Bibliography-to-Model Cross-Reference Validation
 * 
 * Validates:
 * 1. Every bibliography key in grounding contracts exists in .bib files
 * 2. Every model reference (IN03, SY05, etc.) corresponds to a valid model file
 * 3. Every ARCANA lens has >=1 primary bibliography reference (derrida/land = expected gaps)
 * 4. Outputs machine-checkable JSON report for CI integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const bibliographyDir = path.join(repoRoot, 'bibliography');
const hummblResearchRoot = path.resolve(repoRoot, '..', 'hummbl-research');
const modelsDir = path.join(hummblResearchRoot, 'models');
const contractsDir = path.join(hummblResearchRoot, '_grounding-contracts');
const arcanaMappingPath = path.join(repoRoot, 'mappings', 'arcana_citations.json');

// Read all .bib files and extract citation keys
function loadBibliographyKeys() {
  const keys = new Set();
  const files = fs.readdirSync(bibliographyDir).filter(f => f.endsWith('.bib'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(bibliographyDir, file), 'utf8');
    // Match @type{key, pattern - only at start of line or after whitespace
    const matches = content.match(/^@\w+\s*\{\s*([^,\s]+)/gm);
    if (matches) {
      for (const m of matches) {
        const key = m.replace(/^@\w+\s*\{\s*/, '').replace(/,$/, '').trim();
        if (key) keys.add(key);
      }
    }
  }
  return keys;
}

// Read all model files
function loadModelKeys() {
  const keys = new Set();
  const operators = ['IN', 'SY', 'RE', 'CO', 'DE', 'P'];
  
  for (const op of operators) {
    const opDir = path.join(modelsDir, op);
    if (fs.existsSync(opDir)) {
      const files = fs.readdirSync(opDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const modelKey = file.replace('.md', '').toUpperCase();
        keys.add(modelKey);
      }
    }
  }
  return keys;
}

// Parse grounding contract files for bibliography keys and model refs
function parseGroundingContracts() {
  const bibKeys = new Set();
  const modelRefs = new Set();
  const arcanaLenses = new Map();
  
  const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md') && !f.includes('Wave4B'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(contractsDir, file), 'utf8');
    
    // Parse ONLY the "New Bibliography Keys" table - extract section between that heading and next heading
    const bibSectionMatch = content.match(/### New Bibliography Keys \([0-9]+ entries[^)]*\)([\s\S]*?)(?=### Suggested Model Grounding|### [A-Z]|---$|```)/);
    if (bibSectionMatch) {
      const sectionContent = bibSectionMatch[1];
      // Match table rows: | Key | Author | Title | Transformations |
      const rowRegex = /\|\s*([A-Za-z][A-Za-z0-9_]*)\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|/g;
      let match;
      while ((match = rowRegex.exec(sectionContent)) !== null) {
        const key = match[1].trim();
        // Only add if it looks like a bibtex key (starts with letter, contains year/numbers)
        if (key && /^[A-Za-z]+[0-9]/.test(key) && !key.match(/^(Key|Author|Title|Transformations|Model|Operator|Rationale)$/i)) {
          bibKeys.add(key);
        }
      }
    }
    
    // Parse ONLY the "Suggested Model Grounding" table
    const modelSectionMatch = content.match(/### Suggested Model Grounding \([0-9]+ models?\)([\s\S]*?)(?=###|---$|```)/);
    if (modelSectionMatch) {
      const sectionContent = modelSectionMatch[1];
      // Match model rows: | MODEL | OPERATOR | REFS | RATIONALE |
      const modelRowRegex = /\|\s*([A-Z]{2}[0-9]{2})\s*\|\s*[A-Z]{2}\s*\|/g;
      let modelMatch;
      while ((modelMatch = modelRowRegex.exec(sectionContent)) !== null) {
        const model = modelMatch[1].trim();
        if (model && /^[A-Z]{2}[0-9]{2}$/.test(model)) {
          modelRefs.add(model);
        }
      }
    }
  }
  
  // Parse ARCANA mapping
  if (fs.existsSync(arcanaMappingPath)) {
    const arcana = JSON.parse(fs.readFileSync(arcanaMappingPath, 'utf8'));
    for (const [lens, data] of Object.entries(arcana)) {
      if (lens === '_meta') continue;
      arcanaLenses.set(lens, {
        primary: data.primary || [],
        secondary: data.secondary || [],
        gaps: data.gaps || ''
      });
    }
  }
  
  return { bibKeys, modelRefs, arcanaLenses };
}

// Main validation
function validate() {
  console.log('📋 Wave 7A — Bibliography-to-Model Cross-Reference Validation\n');
  
  const bibKeys = loadBibliographyKeys();
  const modelKeys = loadModelKeys();
  const { bibKeys: contractBibKeys, modelRefs, arcanaLenses } = parseGroundingContracts();
  
  console.log(`📚 Bibliography entries loaded: ${bibKeys.size}`);
  console.log(`🤖 Model files loaded: ${modelKeys.size}`);
  console.log(`📄 Contract bibliography keys found: ${contractBibKeys.size}`);
  console.log(`🔗 Contract model references found: ${modelRefs.size}`);
  console.log(`🔮 ARCANA lenses loaded: ${arcanaLenses.size}\n`);
  
  const report = {
    timestamp: new Date().toISOString(),
    bibliography: {
      total: bibKeys.size,
      referencedInContracts: contractBibKeys.size,
      missingFromBibliography: [],
      unreferenced: []
    },
    models: {
      total: modelKeys.size,
      referencedInContracts: modelRefs.size,
      missingModels: [],
      unreferencedModels: []
    },
    arcana: {
      total: arcanaLenses.size,
      withPrimaryRefs: 0,
      expectedGaps: ['derrida', 'land', 'schmitt', 'strauss', 'yarvin'],
      actualGaps: []
    },
    summary: {
      passed: true,
      errors: [],
      warnings: []
    }
  };
  
  // Check bibliography keys referenced in contracts exist in .bib files
  for (const key of contractBibKeys) {
    if (!bibKeys.has(key)) {
      report.bibliography.missingFromBibliography.push(key);
      report.summary.errors.push(`Bibliography key "${key}" referenced in contracts but not found in any .bib file`);
      report.summary.passed = false;
    }
  }
  
  // Check for bibliography entries not referenced in any contract (warning only)
  for (const key of bibKeys) {
    if (!contractBibKeys.has(key)) {
      report.bibliography.unreferenced.push(key);
      report.summary.warnings.push(`Bibliography entry "${key}" not referenced in any grounding contract`);
    }
  }
  
  // Check model references
  for (const ref of modelRefs) {
    if (!modelKeys.has(ref)) {
      report.models.missingModels.push(ref);
      report.summary.errors.push(`Model reference "${ref}" in contracts but no corresponding model file found`);
      report.summary.passed = false;
    }
  }
  
  // Check for models not referenced (warning only)
  for (const key of modelKeys) {
    if (!modelRefs.has(key)) {
      report.models.unreferencedModels.push(key);
      report.summary.warnings.push(`Model "${key}" not referenced in any grounding contract`);
    }
  }
  
  // Check ARCANA lenses
  for (const [lens, data] of arcanaLenses) {
    const hasPrimary = data.primary && data.primary.length > 0;
    if (hasPrimary) {
      report.arcana.withPrimaryRefs++;
    } else {
      if (!report.arcana.expectedGaps.includes(lens)) {
        report.arcana.actualGaps.push(lens);
        report.summary.errors.push(`ARCANA lens "${lens}" has no primary bibliography references (unexpected gap)`);
        report.summary.passed = false;
      } else {
        report.arcana.actualGaps.push(lens);
        report.summary.warnings.push(`ARCANA lens "${lens}" has no primary references (expected gap)`);
      }
    }
  }
  
  // Output summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 VALIDATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Overall: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`\nBibliography:`);
  console.log(`  Missing from .bib files: ${report.bibliography.missingFromBibliography.length}`);
  console.log(`  Unreferenced (warnings): ${report.bibliography.unreferenced.length}`);
  console.log(`\nModels:`);
  console.log(`  Missing model files: ${report.models.missingModels.length}`);
  console.log(`  Unreferenced (warnings): ${report.models.unreferencedModels.length}`);
  console.log(`\nARCANA:`);
  console.log(`  Lenses with primary refs: ${report.arcana.withPrimaryRefs}/${report.arcana.total}`);
  console.log(`  Expected gaps: ${report.arcana.expectedGaps.join(', ')}`);
  console.log(`  Unexpected gaps: ${report.arcana.actualGaps.filter(g => !report.arcana.expectedGaps.includes(g)).join(', ') || 'none'}`);
  console.log(`\nErrors: ${report.summary.errors.length}`);
  console.log(`Warnings: ${report.summary.warnings.length}`);
  
  // Write JSON report
  const outputPath = path.join(repoRoot, 'dist', 'cross-reference-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report written to: ${outputPath}`);
  
  return report.summary.passed ? 0 : 1;
}

const exitCode = validate();
process.exit(exitCode);