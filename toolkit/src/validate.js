#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const bibDir = args[0] || '../bibliography';
const ciMode = args.includes('--ci');

// Validation rules
const REQUIRED_FIELDS = {
  book: ['title', 'author', 'year', 'publisher', 'isbn', 'abstract'],
  article: ['title', 'author', 'year', 'journal', 'abstract'],
  inproceedings: ['title', 'author', 'year', 'booktitle', 'abstract']
};

const WARNINGS = {
  book: { isbn: 'Missing ISBN', abstract: 'Short abstract (< 50 chars)' },
  article: { doi: 'Missing DOI', abstract: 'Short abstract (< 50 chars)' },
  inproceedings: { doi: 'Missing DOI', abstract: 'Short abstract (< 50 chars)' }
};

class BibValidator {
  constructor(bibDir, ciMode = false) {
    this.bibDir = path.resolve(bibDir);
    this.ciMode = ciMode;
    this.errors = [];
    this.warnings = [];
    this.totalEntries = 0;
    this.citationKeys = new Set();
  }

  log(message, color = 'white') {
    if (!this.ciMode) {
      console.log(chalk[color](message));
    }
  }

  error(file, key, message) {
    this.errors.push({ file, key, message });
    this.log(`  ❌ [${key}] ${message}`, 'red');
  }

  warn(file, key, message) {
    this.warnings.push({ file, key, message });
    this.log(`  ⚠️  [${key}] ${message}`, 'yellow');
  }

  success(message) {
    this.log(`  ✓ ${message}`, 'green');
  }

  validateEntry(entry, filename, rawEntry = {}) {
    const key = entry.id;
    const type = entry.type;

    // Check for duplicate keys
    if (this.citationKeys.has(key)) {
      this.error(filename, key, 'Duplicate citation key');
      return;
    }
    this.citationKeys.add(key);

    // Check required fields based on CSL format
    // title
    if (!entry.title) {
      this.error(filename, key, 'Missing required field: title');
    }

    // author
    if (!entry.author || entry.author.length === 0) {
      this.error(filename, key, 'Missing required field: author');
    }

    // year/issued
    if (!entry.issued || !entry.issued['date-parts']) {
      this.error(filename, key, 'Missing required field: year');
    }

    // Type-specific fields
    if (type === 'book') {
      if (!entry.publisher) {
        this.error(filename, key, 'Missing required field: publisher');
      }
      if (!entry.ISBN) {
        this.warn(filename, key, 'Missing ISBN');
      } else {
        // Check ISBN format
        const isbnClean = entry.ISBN.replace(/[-\s]/g, '');
        if (!/^\d{10}(\d{3})?$/.test(isbnClean)) {
          this.error(filename, key, 'Malformed ISBN');
        }
      }
    } else if (type === 'article-journal' || type === 'paper-conference') {
      if (!entry['container-title']) {
        this.error(filename, key, 'Missing required field: journal/booktitle');
      }
      if (!entry.DOI) {
        this.warn(filename, key, 'Missing DOI');
      }
    }

    // Check DOI format if present
    if (entry.DOI) {
      const doiPattern = /^10\.\d{4,9}\/[-._;()\/:a-zA-Z0-9]+$/;
      if (!doiPattern.test(entry.DOI)) {
        this.error(filename, key, 'Malformed DOI');
      }
    }

    // Check abstract from raw fields
    const abstract = rawEntry.abstract || '';
    if (!abstract || abstract.length < 50) {
      if (!abstract) {
        this.error(filename, key, 'Missing required field: abstract');
      } else {
        this.warn(filename, key, 'Short abstract (< 50 chars)');
      }
    }

    // Check for HUMMBL keywords from raw fields
    const keywords = rawEntry.keywords || '';
    if (!keywords || !keywords.includes('HUMMBL:')) {
      this.warn(filename, key, 'No HUMMBL transformation keywords assigned');
    }
  }

  parseBibTeXEntry(entryText) {
    const fields = {};
    const lines = entryText.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*(\w+)\s*=\s*\{(.+)\}\s*,?\s*$/);
      if (match) {
        const [, key, value] = match;
        fields[key.toLowerCase()] = value.trim();
      }
    }
    
    return fields;
  }

  async validateFile(filepath) {
    const filename = path.basename(filepath);
    this.log(`\n📖 Validating ${filename}...`, 'cyan');

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Parse BibTeX with citation-js for structure
      let citation;
      try {
        citation = new Cite(content, { forceType: '@bibtex/text' });
      } catch (parseError) {
        this.error(filename, 'FILE', `BibTeX syntax error: ${parseError.message}`);
        return 0;
      }

      const entries = citation.data;
      this.log(`  Found ${entries.length} entries`, 'blue');

      // Parse raw BibTeX for additional fields
      const rawEntries = {};
      const entryRegex = /@\w+\{([^,]+),([^@]+?)(?=\n\})/gs;
      let match;
      while ((match = entryRegex.exec(content)) !== null) {
        const key = match[1].trim();
        const rawFields = this.parseBibTeXEntry(match[2]);
        rawEntries[key] = rawFields;
      }

      // Validate each entry
      entries.forEach(entry => {
        const rawEntry = rawEntries[entry.id] || {};
        this.validateEntry(entry, filename, rawEntry);
      });

      return entries.length;
    } catch (err) {
      this.error(filename, 'FILE', `Failed to read file: ${err.message}`);
      return 0;
    }
  }

  async validate() {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('  HUMMBL Bibliography Validator', 'cyan');
    this.log('='.repeat(60), 'cyan');

    // Find all .bib files
    const bibFiles = fs.readdirSync(this.bibDir)
      .filter(f => f.endsWith('.bib'))
      .map(f => path.join(this.bibDir, f));

    if (bibFiles.length === 0) {
      this.log('\n❌ No .bib files found in ' + this.bibDir, 'red');
      process.exit(1);
    }

    // Validate each file
    for (const filepath of bibFiles) {
      const count = await this.validateFile(filepath);
      this.totalEntries += count;
    }

    // Print summary
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('  Validation Summary', 'cyan');
    this.log('='.repeat(60), 'cyan');
    this.log(`\nTotal Entries: ${this.totalEntries}`, 'blue');
    this.log(`Errors: ${this.errors.length}`, this.errors.length > 0 ? 'red' : 'green');
    this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'yellow' : 'green');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n✨ All validations passed!', 'green');
    }

    // In CI mode, print machine-readable output
    if (this.ciMode) {
      console.log(JSON.stringify({
        totalEntries: this.totalEntries,
        errors: this.errors.length,
        warnings: this.warnings.length,
        details: { errors: this.errors, warnings: this.warnings }
      }));
    }

    // Exit with error code if critical errors found
    if (this.errors.length > 0) {
      this.log('\n❌ Validation failed with critical errors', 'red');
      process.exit(1);
    }

    this.log('');
    process.exit(0);
  }
}

// Run validator
const validator = new BibValidator(bibDir, ciMode);
validator.validate().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
