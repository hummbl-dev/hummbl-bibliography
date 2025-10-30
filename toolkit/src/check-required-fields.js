#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { program } = require('commander');
const { parseBibFile } = require('./utils/parser');

// Required fields for different entry types
const REQUIRED_FIELDS = {
  article: ['author', 'title', 'journal', 'year', 'volume'],
  book: ['author', 'title', 'publisher', 'year'],
  inproceedings: ['author', 'title', 'booktitle', 'year'],
  incollection: ['author', 'title', 'booktitle', 'publisher', 'year'],
  inbook: ['author', 'title', 'chapter', 'publisher', 'year'],
  phdthesis: ['author', 'title', 'school', 'year'],
  mastersthesis: ['author', 'title', 'school', 'year'],
  techreport: ['author', 'title', 'institution', 'year'],
  manual: ['title'],
  misc: ['title'],
  // Add more entry types and their required fields as needed
};

// Default required fields for any entry type
const DEFAULT_REQUIRED_FIELDS = ['title', 'author', 'year'];

program
  .description('Check for missing required fields in bibliography entries')
  .argument('<path>', 'Path to bibliography directory')
  .option('--fail-on-missing', 'Exit with error code if any required fields are missing', false)
  .parse(process.argv);

const options = program.opts();
const bibPath = program.args[0];

if (!fs.existsSync(bibPath)) {
  console.error(chalk.red(`Error: Path '${bibPath}' does not exist`));
  process.exit(1);
}

// Get all .bib files in the directory
const bibFiles = fs.readdirSync(bibPath)
  .filter(file => file.endsWith('.bib'))
  .map(file => path.join(bibPath, file));

if (bibFiles.length === 0) {
  console.error(chalk.yellow(`No .bib files found in ${bibPath}`));
  process.exit(0);
}

let hasErrors = false;
const missingFieldsReport = [];

// Process each .bib file
for (const file of bibFiles) {
  try {
    const entries = parseBibFile(file);
    
    for (const [key, entry] of Object.entries(entries)) {
      const entryType = entry.type.toLowerCase();
      const requiredFields = REQUIRED_FIELDS[entryType] || DEFAULT_REQUIRED_FIELDS;
      const missingFields = [];

      // Check for required fields
      for (const field of requiredFields) {
        if (!entry.fields[field]) {
          missingFields.push(field);
        }
      }

      // Check for HUMMBL transformation tags
      if (!entry.fields.keywords || !/HUMMBL:(P|IN|CO|DE|RE|SY)/.test(entry.fields.keywords)) {
        missingFields.push('HUMMBL transformation tag (e.g., HUMMBL:CO)');
      }

      if (missingFields.length > 0) {
        hasErrors = true;
        missingFieldsReport.push({
          key,
          file: path.basename(file),
          type: entryType,
          missing: missingFields
        });
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error processing ${file}:`), error.message);
    hasErrors = true;
  }
}

// Generate report
if (missingFieldsReport.length > 0) {
  console.log(chalk.bold('\n❌ Missing Required Fields:'));
  console.log('='.repeat(80));
  
  missingFieldsReport.forEach(({ key, file, type, missing }) => {
    console.log(chalk.bold(`\n${key} (${type}) in ${file}:`));
    missing.forEach(field => {
      console.log(`  - Missing: ${chalk.red(field)}`);
    });
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(chalk.red.bold(`\nFound ${missingFieldsReport.length} entries with missing required fields`));
  
  if (options.failOnMissing) {
    process.exit(1);
  }
} else {
  console.log(chalk.green.bold('\n✅ All entries have the required fields'));
}

process.exit(0);
