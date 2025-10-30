#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Cite } = require('@citation-js/core');
require('@citation-js/plugin-bibtex');

const args = process.argv.slice(2);
const bibDir = args[0] || '../bibliography';

class KeywordExtractor {
  constructor(bibDir) {
    this.bibDir = path.resolve(bibDir);
    this.transformationMap = new Map();
    this.entryMap = new Map();
  }

  extractTransformations(keywords) {
    const transformations = [];
    if (!keywords) return transformations;

    const keywordStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const matches = keywordStr.match(/HUMMBL:(P|IN|CO|DE|RE|SY)/g);

    if (matches) {
      matches.forEach(match => {
        transformations.push(match.replace('HUMMBL:', ''));
      });
    }

    return [...new Set(transformations)];
  }

  processEntry(entry, filename) {
    const transformations = this.extractTransformations(entry.keywords);

    if (transformations.length > 0) {
      this.entryMap.set(entry.id, {
        title: entry.title,
        file: filename,
        transformations: transformations
      });

      transformations.forEach(trans => {
        if (!this.transformationMap.has(trans)) {
          this.transformationMap.set(trans, []);
        }
        this.transformationMap.get(trans).push({
          key: entry.id,
          title: entry.title,
          file: filename
        });
      });
    }
  }

  async loadFile(filepath) {
    const filename = path.basename(filepath);

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const citation = new Cite(content, { forceType: '@bibtex/text' });
      const entries = citation.data;

      entries.forEach(entry => this.processEntry(entry, filename));
    } catch (err) {
      console.error(chalk.red(`Error loading ${filename}: ${err.message}`));
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan.bold('  HUMMBL TRANSFORMATION KEYWORDS'));
    console.log('='.repeat(60));

    const transNames = {
      P: 'Perspective',
      IN: 'Inversion',
      CO: 'Composition',
      DE: 'Decomposition',
      RE: 'Recursion',
      SY: 'Synthesis'
    };

    const transOrder = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];

    transOrder.forEach(trans => {
      const entries = this.transformationMap.get(trans) || [];
      const name = transNames[trans];

      console.log(chalk.cyan(`\n${trans}: ${name} (${entries.length} entries)`));

      if (entries.length > 0) {
        entries.forEach((entry, idx) => {
          console.log(chalk.white(`  ${idx + 1}. [${entry.key}] ${entry.title.substring(0, 70)}...`));
          console.log(chalk.gray(`     ${entry.file}`));
        });
      } else {
        console.log(chalk.yellow('  No entries found'));
      }
    });

    // Entries by transformation count
    console.log(chalk.cyan('\n📊 ENTRIES BY TRANSFORMATION COUNT'));

    const countMap = new Map();
    this.entryMap.forEach((entry, key) => {
      const count = entry.transformations.length;
      if (!countMap.has(count)) {
        countMap.set(count, []);
      }
      countMap.get(count).push({ key, ...entry });
    });

    Array.from(countMap.keys())
      .sort((a, b) => b - a)
      .forEach(count => {
        const entries = countMap.get(count);
        console.log(chalk.white(`\n  ${count} transformation(s): ${entries.length} entries`));
        entries.slice(0, 5).forEach(entry => {
          console.log(chalk.gray(`    - [${entry.key}] ${entry.transformations.join(', ')}`));
        });
        if (entries.length > 5) {
          console.log(chalk.gray(`    ... and ${entries.length - 5} more`));
        }
      });

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async run() {
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

    // Print report
    this.printReport();
  }
}

// Run extractor
const extractor = new KeywordExtractor(bibDir);
extractor.run().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
