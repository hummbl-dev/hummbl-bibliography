#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Cite } = require('@citation-js/core');
require('@citation-js/plugin-bibtex');

const args = process.argv.slice(2);
const bibDir = args[0] || '../bibliography';
const dryRun = args.includes('--dry-run');

class DuplicateFixer {
  constructor(bibDir, dryRun = false) {
    this.bibDir = path.resolve(bibDir);
    this.dryRun = dryRun;
    this.entries = new Map(); // key -> { file, entry, content }
    this.toRemove = [];
  }

  async loadFiles() {
    console.log(chalk.cyan('\n📖 Loading bibliography files...'));

    const bibFiles = fs.readdirSync(this.bibDir)
      .filter(f => f.endsWith('.bib'))
      .map(f => path.join(this.bibDir, f));

    for (const filepath of bibFiles) {
      const filename = path.basename(filepath);
      const content = fs.readFileSync(filepath, 'utf8');

      try {
        const citation = new Cite(content, { forceType: '@bibtex/text' });
        const entries = citation.data;

        console.log(chalk.blue(`  ${filename}: ${entries.length} entries`));

        entries.forEach(entry => {
          if (this.entries.has(entry.id)) {
            // Duplicate found - keep the one from higher tier (T1 > T2 > T3)
            const existing = this.entries.get(entry.id);
            const existingTier = this.getTier(existing.file);
            const newTier = this.getTier(filename);

            if (newTier > existingTier) {
              // Keep existing, remove new
              this.toRemove.push({ file: filepath, key: entry.id });
              console.log(chalk.yellow(`  ⚠️  Duplicate: ${entry.id} (removing from ${filename})`));
            } else {
              // Keep new, remove existing
              this.toRemove.push({ file: existing.file, key: entry.id });
              this.entries.set(entry.id, { file: filepath, entry, content });
              console.log(chalk.yellow(`  ⚠️  Duplicate: ${entry.id} (removing from ${existing.file})`));
            }
          } else {
            this.entries.set(entry.id, { file: filepath, entry, content });
          }
        });
      } catch (err) {
        console.error(chalk.red(`  ❌ Error loading ${filename}: ${err.message}`));
      }
    }
  }

  getTier(filename) {
    if (filename.includes('T1')) return 1;
    if (filename.includes('T2')) return 2;
    if (filename.includes('T3')) return 3;
    return 99;
  }

  fixDuplicates() {
    if (this.toRemove.length === 0) {
      console.log(chalk.green('\n✨ No duplicates to fix!'));
      return;
    }

    console.log(chalk.cyan(`\n🔧 ${this.dryRun ? 'Would remove' : 'Removing'} ${this.toRemove.length} duplicate(s)...`));

    // Group by file
    const fileMap = new Map();
    this.toRemove.forEach(item => {
      if (!fileMap.has(item.file)) {
        fileMap.set(item.file, []);
      }
      fileMap.get(item.file).push(item.key);
    });

    // Remove duplicates from each file
    for (const [filepath, keys] of fileMap) {
      const filename = path.basename(filepath);
      console.log(chalk.blue(`\n  Processing ${filename}...`));

      let content = fs.readFileSync(filepath, 'utf8');

      keys.forEach(key => {
        // Find and remove the entry
        const regex = new RegExp(`@\\w+\\{${key},[^}]*(?:}[^@]*?)*?\\n\\}\\n?`, 'gs');
        content = content.replace(regex, '');
        console.log(chalk.yellow(`    - Removed: ${key}`));
      });

      if (!this.dryRun) {
        // Backup original
        fs.writeFileSync(filepath + '.backup', fs.readFileSync(filepath));
        // Write cleaned content
        fs.writeFileSync(filepath, content);
        console.log(chalk.green(`    ✓ Updated ${filename}`));
      }
    }

    if (this.dryRun) {
      console.log(chalk.yellow('\n💡 This was a dry run. Use without --dry-run to apply changes.'));
    } else {
      console.log(chalk.green('\n✨ Duplicates removed! Backup files created with .backup extension.'));
    }
  }

  async run() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.cyan('  HUMMBL Bibliography Duplicate Fixer'));
    console.log('='.repeat(60));

    if (this.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN MODE - No changes will be made\n'));
    }

    await this.loadFiles();
    this.fixDuplicates();

    console.log('');
  }
}

// Run fixer
const fixer = new DuplicateFixer(bibDir, dryRun);
fixer.run().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
