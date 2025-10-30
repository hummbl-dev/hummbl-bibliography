#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Cite } = require('@citation-js/core');
require('@citation-js/plugin-bibtex');

const args = process.argv.slice(2);
const bibDir = args[0] || '../bibliography';
const jsonOutput = args.includes('--json');

class BibStats {
  constructor(bibDir) {
    this.bibDir = path.resolve(bibDir);
    this.stats = {
      total: 0,
      byTier: { T1: 0, T2: 0, T3: 0 },
      byType: {},
      transformations: { P: 0, IN: 0, CO: 0, DE: 0, RE: 0, SY: 0 },
      quality: {
        withDOI: 0,
        withISBN: 0,
        withAbstract: 0,
        withKeywords: 0
      }
    };
  }

  parseBibTeXRaw(content) {
    const rawEntries = {};
    const entryRegex = /@\w+\{([^,]+),([^@]+?)(?=\n\})/gs;
    let match;
    
    while ((match = entryRegex.exec(content)) !== null) {
      const key = match[1].trim();
      const entryText = match[2];
      const fields = {};
      
      const lines = entryText.split('\n');
      for (const line of lines) {
        const fieldMatch = line.match(/^\s*(\w+)\s*=\s*\{(.+)\}\s*,?\s*$/);
        if (fieldMatch) {
          const [, fieldKey, value] = fieldMatch;
          fields[fieldKey.toLowerCase()] = value.trim();
        }
      }
      
      rawEntries[key] = fields;
    }
    
    return rawEntries;
  }

  extractTransformations(keywords) {
    const transformations = new Set();
    if (!keywords) return transformations;

    const keywordStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const matches = keywordStr.match(/HUMMBL:(P|IN|CO|DE|RE|SY)/g);

    if (matches) {
      matches.forEach(match => {
        const trans = match.replace('HUMMBL:', '');
        transformations.add(trans);
      });
    }

    return transformations;
  }

  getTier(filename) {
    if (filename.includes('T1')) return 'T1';
    if (filename.includes('T2')) return 'T2';
    if (filename.includes('T3')) return 'T3';
    return 'Unknown';
  }

  processEntry(entry, filename, rawEntry = {}) {
    this.stats.total++;

    // Count by tier
    const tier = this.getTier(filename);
    this.stats.byTier[tier] = (this.stats.byTier[tier] || 0) + 1;

    // Count by type
    const type = entry.type || 'unknown';
    this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;

    // Count transformations from raw keywords
    const keywords = rawEntry.keywords || '';
    const transformations = this.extractTransformations(keywords);
    transformations.forEach(trans => {
      this.stats.transformations[trans]++;
    });

    // Quality metrics
    if (entry.DOI) this.stats.quality.withDOI++;
    if (entry.ISBN) this.stats.quality.withISBN++;
    
    const abstract = rawEntry.abstract || '';
    if (abstract && abstract.length >= 50) this.stats.quality.withAbstract++;
    if (transformations.size > 0) this.stats.quality.withKeywords++;
  }

  async loadFile(filepath) {
    const filename = path.basename(filepath);

    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const citation = new Cite(content, { forceType: '@bibtex/text' });
      const entries = citation.data;

      // Parse raw BibTeX for additional fields
      const rawEntries = this.parseBibTeXRaw(content);

      entries.forEach(entry => {
        const rawEntry = rawEntries[entry.id] || {};
        this.processEntry(entry, filename, rawEntry);
      });

      return entries.length;
    } catch (err) {
      if (!jsonOutput) {
        console.error(chalk.red(`Error loading ${filename}: ${err.message}`));
      }
      return 0;
    }
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan.bold('  HUMMBL BIBLIOGRAPHY STATISTICS'));
    console.log('='.repeat(60));

    // Total entries
    console.log(chalk.cyan('\n📊 OVERVIEW'));
    console.log(chalk.white(`Total Entries: ${chalk.bold(this.stats.total)}`));

    // By tier
    console.log(chalk.cyan('\n📚 BY TIER'));
    Object.entries(this.stats.byTier).forEach(([tier, count]) => {
      const percentage = ((count / this.stats.total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(count / 2));
      console.log(chalk.white(`  ${tier}: ${chalk.bold(count.toString().padStart(2))} (${percentage}%) ${chalk.blue(bar)}`));
    });

    // By type
    console.log(chalk.cyan('\n📖 BY TYPE'));
    Object.entries(this.stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = ((count / this.stats.total) * 100).toFixed(1);
        console.log(chalk.white(`  ${type.padEnd(15)}: ${chalk.bold(count.toString().padStart(2))} (${percentage}%)`));
      });

    // Transformations
    console.log(chalk.cyan('\n🔄 HUMMBL TRANSFORMATIONS'));
    const transNames = {
      P: 'Perspective',
      IN: 'Inversion',
      CO: 'Composition',
      DE: 'Decomposition',
      RE: 'Recursion',
      SY: 'Synthesis'
    };

    Object.entries(this.stats.transformations)
      .sort((a, b) => b[1] - a[1])
      .forEach(([trans, count]) => {
        const bar = '█'.repeat(Math.floor(count / 2));
        console.log(chalk.white(`  ${trans.padEnd(2)} (${transNames[trans].padEnd(13)}): ${chalk.bold(count.toString().padStart(2))} ${chalk.green(bar)}`));
      });

    // Quality metrics
    console.log(chalk.cyan('\n✨ QUALITY METRICS'));
    const qualityMetrics = [
      { label: 'Entries with DOI', count: this.stats.quality.withDOI },
      { label: 'Entries with ISBN', count: this.stats.quality.withISBN },
      { label: 'Entries with Abstract', count: this.stats.quality.withAbstract },
      { label: 'Entries with HUMMBL Keywords', count: this.stats.quality.withKeywords }
    ];

    qualityMetrics.forEach(metric => {
      const percentage = ((metric.count / this.stats.total) * 100).toFixed(1);
      const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red';
      console.log(chalk.white(`  ${metric.label.padEnd(30)}: ${chalk.bold(metric.count.toString().padStart(2))} (${chalk[color](percentage + '%')})`));
    });

    // Gap analysis
    console.log(chalk.cyan('\n📈 GAP ANALYSIS'));
    const avgTransformations = Object.values(this.stats.transformations).reduce((a, b) => a + b, 0) / 6;
    const gaps = Object.entries(this.stats.transformations)
      .filter(([, count]) => count < avgTransformations)
      .sort((a, b) => a[1] - b[1]);

    if (gaps.length > 0) {
      console.log(chalk.yellow(`  Average coverage: ${avgTransformations.toFixed(1)} entries per transformation`));
      console.log(chalk.yellow(`  Need more entries for: ${gaps.map(([t]) => t).join(', ')}`));
    } else {
      console.log(chalk.green('  ✓ Balanced transformation coverage'));
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async run() {
    // Find all .bib files
    const bibFiles = fs.readdirSync(this.bibDir)
      .filter(f => f.endsWith('.bib'))
      .map(f => path.join(this.bibDir, f));

    if (bibFiles.length === 0) {
      if (!jsonOutput) {
        console.log(chalk.red('\n❌ No .bib files found in ' + this.bibDir));
      }
      process.exit(1);
    }

    // Load all files
    for (const filepath of bibFiles) {
      await this.loadFile(filepath);
    }

    // Output results
    if (jsonOutput) {
      console.log(JSON.stringify(this.stats, null, 2));
    } else {
      this.printReport();
    }
  }
}

// Run stats
const stats = new BibStats(bibDir);
stats.run().catch(err => {
  if (!jsonOutput) {
    console.error(chalk.red('Fatal error:'), err);
  }
  process.exit(1);
});
