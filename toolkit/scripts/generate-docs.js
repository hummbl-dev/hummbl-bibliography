#!/usr/bin/env node

/**
 * HUMMBL Base120 Documentation Generator
 * Auto-generates reference docs from canonical source
 */

import { BASE120_MODELS } from '../dist/utils/validateModelCode.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate quick reference markdown
 */
function generateQuickReference() {
  let markdown = '# HUMMBL Base120 Quick Reference\n\n';
  markdown += '**Version**: 1.0-production\n';
  markdown += '**Generated**: ' + new Date().toISOString().split('T')[0] + '\n';
  markdown += '**Source**: Canonical Base120 Framework\n\n';
  markdown += '---\n\n';

  Object.entries(BASE120_MODELS).forEach(([transformation, models]) => {
    markdown += `## ${transformation} Series\n\n`;
    markdown += `**Transform**: ${getTransformationDescription(transformation)}\n\n`;
    markdown += '| Code | Model Name |\n';
    markdown += '|------|-----------|\n';

    models.forEach((name, index) => {
      const code = `${transformation}${index + 1}`;
      markdown += `| **${code}** | ${name} |\n`;
    });

    markdown += '\n';
  });

  markdown += '---\n\n';
  markdown += '**Usage Guidelines**\n\n';
  markdown += '1. **Only use models from this official list**\n';
  markdown += '2. **Reference by code**: [P|IN|CO|DE|RE|SY][1-20]\n';
  markdown += '3. **Verify against this list** before claiming a model\n';
  markdown += '4. **When uncertain, ask** rather than guessing\n\n';

  return markdown;
}

/**
 * Generate detailed reference with examples
 */
function generateDetailedReference() {
  let markdown = '# HUMMBL Base120 - Complete Reference\n\n';
  markdown += '**Version**: 1.0-production\n';
  markdown += '**Generated**: ' + new Date().toISOString().split('T')[0] + '\n\n';
  markdown += '---\n\n';

  Object.entries(BASE120_MODELS).forEach(([transformation, models]) => {
    markdown += `# ${transformation} — ${getTransformationName(transformation)}\n\n`;
    markdown += `**Transform**: ${getTransformationDescription(transformation)}\n\n`;

    models.forEach((name, index) => {
      const code = `${transformation}${index + 1}`;
      markdown += `## ${code}: ${name}\n\n`;
      markdown += '**Definition**: ' + getModelDescription(code) + '\n\n';
      markdown += '**Example Usage**:\n';
      markdown += '```typescript\n';
      markdown += `// Using ${code} (${name})\n`;
      markdown += getUsageExample(code);
      markdown += '```\n\n';
    });

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Generate JSON data for programmatic access
 */
function generateJsonData() {
  const data = {
    version: '1.0-production',
    generated: new Date().toISOString(),
    transformations: {}
  };

  Object.entries(BASE120_MODELS).forEach(([transformation, models]) => {
    data.transformations[transformation] = {
      name: getTransformationName(transformation),
      description: getTransformationDescription(transformation),
      models: models.map((name, index) => ({
        code: `${transformation}${index + 1}`,
        name,
        description: getModelDescription(`${transformation}${index + 1}`),
        example: getUsageExample(`${transformation}${index + 1}`)
      }))
    };
  });

  return JSON.stringify(data, null, 2);
}

/**
 * Generate TypeScript types
 */
function generateTypes() {
  let types = '// HUMMBL Base120 TypeScript Types\n';
  types += '// Auto-generated from canonical source\n\n';

  types += 'export type TransformationType = ';
  types += Object.keys(BASE120_MODELS).map(t => `'${t}'`).join(' | ');
  types += ';\n\n';

  types += 'export type ModelCode = ';
  const allCodes = [];
  Object.entries(BASE120_MODELS).forEach(([transformation, models]) => {
    models.forEach((_, index) => {
      allCodes.push(`'${transformation}${index + 1}'`);
    });
  });
  types += allCodes.join(' |\n  ');
  types += ';\n\n';

  types += 'export interface ModelDefinition {\n';
  types += '  code: ModelCode;\n';
  types += '  name: string;\n';
  types += '  transformation: TransformationType;\n';
  types += '  description: string;\n';
  types += '  example: string;\n';
  types += '}\n\n';

  return types;
}

// Helper functions
function getTransformationName(transformation) {
  const names = {
    P: 'Perspective/Identity',
    IN: 'Inversion',
    CO: 'Composition',
    DE: 'Decomposition',
    RE: 'Recursion',
    SY: 'Meta-Systems'
  };
  return names[transformation] || transformation;
}

function getTransformationDescription(transformation) {
  const descriptions = {
    P: 'Frame and name what is. Anchor or shift point of view.',
    IN: 'Reverse assumptions. Examine opposites, edges, negations.',
    CO: 'Combine parts into coherent wholes.',
    DE: 'Break complex systems into constituent parts.',
    RE: 'Apply operations iteratively, with outputs becoming inputs.',
    SY: 'Understand systems of systems, coordination, and emergent dynamics.'
  };
  return descriptions[transformation] || '';
}

function getModelDescription(code) {
  // In a full implementation, this would have detailed descriptions
  // For now, return a placeholder
  return `HUMMBL Base120 mental model: ${code}`;
}

function getUsageExample(code) {
  // In a full implementation, this would have specific examples
  // For now, return a generic example
  return `const result = apply${code}Strategy(data);\nconsole.log('Applied ${code} successfully');`;
}

// CLI interface
const command = process.argv[2];
const outputDir = process.argv[3] || './docs/generated';

if (!command) {
  console.log('Usage: node generate-docs.js <command> [output-dir]');
  console.log('Commands:');
  console.log('  quick     - Generate quick reference markdown');
  console.log('  detailed  - Generate detailed reference markdown');
  console.log('  json      - Generate JSON data');
  console.log('  types     - Generate TypeScript types');
  console.log('  all       - Generate all formats');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

switch (command) {
  case 'quick':
    fs.writeFileSync(path.join(outputDir, 'quick-reference.md'), generateQuickReference());
    console.log('✅ Generated quick-reference.md');
    break;

  case 'detailed':
    fs.writeFileSync(path.join(outputDir, 'detailed-reference.md'), generateDetailedReference());
    console.log('✅ Generated detailed-reference.md');
    break;

  case 'json':
    fs.writeFileSync(path.join(outputDir, 'base120-data.json'), generateJsonData());
    console.log('✅ Generated base120-data.json');
    break;

  case 'types':
    fs.writeFileSync(path.join(outputDir, 'base120-types.ts'), generateTypes());
    console.log('✅ Generated base120-types.ts');
    break;

  case 'all':
    fs.writeFileSync(path.join(outputDir, 'quick-reference.md'), generateQuickReference());
    fs.writeFileSync(path.join(outputDir, 'detailed-reference.md'), generateDetailedReference());
    fs.writeFileSync(path.join(outputDir, 'base120-data.json'), generateJsonData());
    fs.writeFileSync(path.join(outputDir, 'base120-types.ts'), generateTypes());
    console.log('✅ Generated all documentation formats');
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
