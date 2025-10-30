#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let bibDir = '../bibliography';
let failOnDuplicates = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fail-on-duplicates') {
    failOnDuplicates = true;
  } else if (!args[i].startsWith('--') && i === args.length - 1) {
    // The last non-flag argument is the bibDir
    bibDir = args[i];
  }
}

class DuplicateChecker {
  constructor(bibDir) {
    this.bibDir = path.resolve(bibDir);
    this.entries = new Map(); // key -> { file, entry }
    this.duplicates = [];
    this.titleMap = new Map(); // normalized title -> entries
    this.doiMap = new Map(); // DOI -> entries
    this.isbnMap = new Map(); // ISBN -> entries
  }

  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  normalizeISBN(isbn) {
    return isbn.replace(/[-\s]/g, '');
  }

  async loadFile(filepath) {
    const filename = path.basename(filepath);
    console.log(chalk.cyan(`\n📖 Loading ${filename}...`));

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const citation = new Cite(content, { forceType: '@bibtex/text' });
      const entries = citation.data;

      console.log(chalk.blue(`  Found ${entries.length} entries`));

      entries.forEach(entry => {
        const key = entry.id;

        // Check for duplicate citation keys
        if (this.entries.has(key)) {
          this.duplicates.push({
            type: 'citation_key',
            key: key,
            files: [this.entries.get(key).file, filename]
          });
        } else {
          this.entries.set(key, { file: filename, entry });
        }

        // Track by normalized title
        if (entry.title) {
          const normTitle = this.normalizeTitle(entry.title);
          if (!this.titleMap.has(normTitle)) {
            this.titleMap.set(normTitle, []);
          }
          this.titleMap.get(normTitle).push({ key, file: filename, entry });
        }

        // Track by DOI
        if (entry.DOI) {
          const doi = entry.DOI.toLowerCase();
          if (!this.doiMap.has(doi)) {
            this.doiMap.set(doi, []);
          }
          this.doiMap.get(doi).push({ key, file: filename, entry });
        }

        // Track by ISBN
        if (entry.ISBN) {
          const isbn = this.normalizeISBN(entry.ISBN);
          if (!this.isbnMap.has(isbn)) {
            this.isbnMap.set(isbn, []);
          }
          this.isbnMap.get(isbn).push({ key, file: filename, entry });
        }
      });

      return entries.length;
    } catch (err) {
      console.error(chalk.red(`  ❌ Error loading ${filename}: ${err.message}`));
      return 0;
    }
  }

  findDuplicates() {
    console.log(chalk.cyan('\n🔍 Checking for duplicates...'));

    // Check for duplicate titles
    for (const [title, entries] of this.titleMap) {
      if (entries.length > 1) {
        this.duplicates.push({
          type: 'title',
          value: title,
          entries: entries.map(e => ({ key: e.key, file: e.file }))
        });
      }
    }

    // Check for duplicate DOIs
    for (const [doi, entries] of this.doiMap) {
      if (entries.length > 1) {
        this.duplicates.push({
          type: 'doi',
          value: doi,
          entries: entries.map(e => ({ key: e.key, file: e.file }))
        });
      }
    }

    // Check for duplicate ISBNs
    for (const [isbn, entries] of this.isbnMap) {
      if (entries.length > 1) {
        this.duplicates.push({
          type: 'isbn',
          value: isbn,
          entries: entries.map(e => ({ key: e.key, file: e.file }))
        });
      }
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan('  Duplicate Check Summary'));
    console.log('='.repeat(60));

    console.log(chalk.blue(`\nTotal Entries: ${this.entries.size}`));
    console.log(chalk.blue(`Unique Titles: ${this.titleMap.size}`));
    console.log(chalk.blue(`Entries with DOI: ${this.doiMap.size}`));
    console.log(chalk.blue(`Entries with ISBN: ${this.isbnMap.size}`));

    if (this.duplicates.length === 0) {
      console.log(chalk.green('\n✨ No duplicates found!'));
      return false;
    }

    console.log(chalk.yellow(`\n⚠️  Found ${this.duplicates.length} potential duplicate(s):\n`));

    this.duplicates.forEach((dup, idx) => {
      console.log(chalk.yellow(`${idx + 1}. Duplicate ${dup.type.toUpperCase()}`));

      if (dup.type === 'citation_key') {
        console.log(chalk.white(`   Key: ${dup.key}`));
        console.log(chalk.white(`   Files: ${dup.files.join(', ')}`));
      } else {
        console.log(chalk.white(`   Value: ${dup.value.substring(0, 80)}...`));
        dup.entries.forEach(entry => {
          console.log(chalk.white(`   - [${entry.key}] in ${entry.file}`));
        });
      }
      console.log('');
    });

    console.log(chalk.yellow('💡 Run "npm run fix-dups" to automatically resolve duplicates\n'));
    return true;
  }

  async check() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan('  HUMMBL Bibliography Duplicate Checker'));
    console.log('='.repeat(60));

    // Find all .bib files
    const bibFiles = fs.readdirSync(this.bibDir)
      .filter(f => f.endsWith('.bib'))
      .map(f => path.join(this.bibDir, f));

    if (bibFiles.length === 0) {
      console.log(chalk.red('\n❌ No .bib files found in ' + this.bibDir));
      process.exit(1);
    }

    // Load all files
    for (const filepath of bibFiles) {
      await this.loadFile(filepath);
    }

    // Find duplicates
    this.findDuplicates();

    // Print report
    const hasDuplicates = this.printReport();

    // Exit with code 1 if duplicates found and failOnDuplicates is true (for CI)
    if (hasDuplicates && failOnDuplicates) {
      console.error(chalk.red('\n❌ Duplicates found and --fail-on-duplicates flag is set'));
      process.exit(1);
    } else if (hasDuplicates) {
      process.exit(0); // Don't fail if --fail-on-duplicates is not set
    } else {
      process.exit(0);
    }
  }
}

// Run checker
const checker = new DuplicateChecker(bibDir);
checker.check().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
