#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const { Cite } = require('@citation-js/core');
require('@citation-js/plugin-bibtex');

const args = process.argv.slice(2);
const bibDir = args[0] || '../bibliography';

class DOIFinder {
  constructor(bibDir) {
    this.bibDir = path.resolve(bibDir);
    this.missingDOIs = [];
    this.foundDOIs = [];
  }

  async searchCrossRef(title, author, year) {
    try {
      const query = `${title} ${author} ${year}`.replace(/[^\w\s]/g, ' ');
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=1`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'HUMMBL-Bibliography/1.0 (mailto:contact@example.com)' },
        timeout: 5000
      });

      if (response.data.message.items.length > 0) {
        const item = response.data.message.items[0];
        const score = item.score;
        
        // Only return if confidence is high enough
        if (score > 50) {
          return {
            doi: item.DOI,
            score: score,
            title: item.title ? item.title[0] : '',
            confidence: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
          };
        }
      }

      return null;
    } catch (err) {
      console.error(chalk.red(`    Error querying CrossRef: ${err.message}`));
      return null;
    }
  }

  async processEntry(entry, filename) {
    if (entry.DOI) {
      return; // Already has DOI
    }

    // Only search for articles and conference papers
    if (entry.type !== 'article' && entry.type !== 'inproceedings') {
      return;
    }

    const author = Array.isArray(entry.author) 
      ? entry.author[0].family || entry.author[0].literal || ''
      : entry.author || '';

    console.log(chalk.blue(`  Searching for: ${entry.id}`));

    const result = await this.searchCrossRef(
      entry.title || '',
      author,
      entry.year || ''
    );

    if (result) {
      this.foundDOIs.push({
        file: filename,
        key: entry.id,
        title: entry.title,
        ...result
      });
      console.log(chalk.green(`    ✓ Found DOI: ${result.doi} (confidence: ${result.confidence})`));
    } else {
      this.missingDOIs.push({
        file: filename,
        key: entry.id,
        title: entry.title,
        type: entry.type
      });
      console.log(chalk.yellow(`    - No DOI found`));
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async scanFile(filepath) {
    const filename = path.basename(filepath);
    console.log(chalk.cyan(`\n📖 Scanning ${filename}...`));

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const citation = new Cite(content, { forceType: '@bibtex/text' });
      const entries = citation.data;

      for (const entry of entries) {
        await this.processEntry(entry, filename);
      }
    } catch (err) {
      console.error(chalk.red(`  ❌ Error scanning ${filename}: ${err.message}`));
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan('  DOI Enrichment Report'));
    console.log('='.repeat(60));

    const total = this.foundDOIs.length + this.missingDOIs.length;
    console.log(chalk.blue(`\nTotal entries checked: ${total}`));
    console.log(chalk.green(`DOIs found: ${this.foundDOIs.length}`));
    console.log(chalk.yellow(`DOIs not found: ${this.missingDOIs.length}`));

    if (this.foundDOIs.length > 0) {
      console.log(chalk.cyan('\n📝 Found DOIs:\n'));
      this.foundDOIs.forEach((item, idx) => {
        console.log(chalk.white(`${idx + 1}. [${item.key}] ${item.file}`));
        console.log(chalk.white(`   DOI: ${item.doi}`));
        console.log(chalk.white(`   Confidence: ${item.confidence} (score: ${item.score})`));
        console.log('');
      });

      console.log(chalk.yellow('💡 Review these DOIs and manually add them to the bibliography files.'));
    }

    if (this.missingDOIs.length > 0) {
      console.log(chalk.cyan('\n❌ Entries without DOIs:\n'));
      this.missingDOIs.forEach((item, idx) => {
        console.log(chalk.white(`${idx + 1}. [${item.key}] ${item.file}`));
        console.log(chalk.white(`   Title: ${item.title}`));
        console.log('');
      });
    }

    console.log('');
  }

  async run() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan('  HUMMBL Bibliography DOI Finder'));
    console.log('='.repeat(60));
    console.log(chalk.yellow('\n⚠️  This tool uses the CrossRef API. Please be patient...\n'));

    // Find all .bib files
    const bibFiles = fs.readdirSync(this.bibDir)
      .filter(f => f.endsWith('.bib'))
      .map(f => path.join(this.bibDir, f));

    if (bibFiles.length === 0) {
      console.log(chalk.red('\n❌ No .bib files found in ' + this.bibDir));
      process.exit(1);
    }

    // Scan each file
    for (const filepath of bibFiles) {
      await this.scanFile(filepath);
    }

    // Print report
    this.printReport();
  }
}

// Run finder
const finder = new DOIFinder(bibDir);
finder.run().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
