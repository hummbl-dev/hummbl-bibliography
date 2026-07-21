#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import axios from 'axios';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const cachePath = path.join(rootDir, '.cache', 'crossref_doi_cache.json');

export function resolveBibDir(positionalArg) {
  if (positionalArg) {
    return path.resolve(positionalArg);
  }
  if (fs.existsSync(path.resolve('bibliography'))) {
    return path.resolve('bibliography');
  }
  if (fs.existsSync(path.join(rootDir, 'bibliography'))) {
    return path.join(rootDir, 'bibliography');
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bibliography');
}

const args = process.argv.slice(2);
const positionalArgs = args.filter(arg => !arg.startsWith('--'));
const useCache = !args.includes('--no-cache');
const bibDir = resolveBibDir(positionalArgs[0]);

function loadCache() {
  try {
    if (useCache && fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
  } catch {}
  return {};
}

function saveCache(cache) {
  try {
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  } catch {}
}

const DOI_CANDIDATE_TYPES = new Set(['article-journal', 'paper-conference']);

export function normalizeType(rawType) {
  return (typeof rawType === 'string' && rawType.trim().toLowerCase()) || '';
}

export function isDoiCandidateType(rawType) {
  return DOI_CANDIDATE_TYPES.has(normalizeType(rawType));
}

export function extractPublicationYear(entry) {
  if (!entry || typeof entry !== 'object') {
    return '';
  }

  if (entry.year !== undefined && entry.year !== null && entry.year !== 0) {
    return String(entry.year).trim();
  }

  const candidateDateNodes = [entry.issued, entry.published, entry.publishedOnline];
  for (const dateNode of candidateDateNodes) {
    const direct = dateNode?.['date-parts']?.[0]?.[0];
    if (direct !== undefined && direct !== null) {
      return String(direct);
    }

    const rawString = dateNode?.raw || dateNode?.['date-time'] || dateNode?.literal;
    if (rawString) {
      const match = String(rawString).match(/\b(19|20)\d{2}\b/);
      if (match) {
        return match[0];
      }
    }
  }

  return '';
}

export function getPrimaryAuthor(entry) {
  const rawAuthor = entry?.author;
  if (Array.isArray(rawAuthor)) {
    const firstAuthor = rawAuthor[0] || {};
    return firstAuthor.family || firstAuthor.literal || firstAuthor.name || '';
  }

  return rawAuthor || '';
}

export class DOIFinder {
  constructor(bibDir) {
    this.bibDir = path.resolve(bibDir);
    this.missingDOIs = [];
    this.foundDOIs = [];
    this.rateLimitDelay = 1000; // ms between CrossRef requests; set to 0 in tests
    this.cache = loadCache();
  }

  async searchCrossRef(title, author, year) {
    const cacheKey = `${title}|${author}|${year}`;
    if (this.cache[cacheKey] !== undefined) {
      return this.cache[cacheKey];
    }

    try {
      const query = `${title} ${author} ${year}`.replace(/[^\w\s]/g, ' ');
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=1`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'HUMMBL-Bibliography/1.0 (mailto:contact@example.com)' },
        timeout: 5000
      });

      let result = null;
      if (response.data.message.items.length > 0) {
        const item = response.data.message.items[0];
        const score = item.score;
        
        // Only return if confidence is high enough
        if (score > 50) {
          result = {
            doi: item.DOI,
            score: score,
            title: item.title ? item.title[0] : '',
            confidence: score > 80 ? 'high' : score > 60 ? 'medium' : 'low'
          };
        }
      }

      this.cache[cacheKey] = result;
      saveCache(this.cache);
      return result;
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
    // citation-js converts BibTeX types to CSL types:
    //   @article -> article-journal, @inproceedings -> paper-conference
    if (!isDoiCandidateType(entry.type)) {
      return;
    }

    const author = getPrimaryAuthor(entry);
    const year = extractPublicationYear(entry);

    console.log(chalk.blue(`  Searching for: ${entry.id}`));

    const result = await this.searchCrossRef(
      entry.title || '',
      author,
      year
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
    if (this.rateLimitDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }
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

    try {
      const reportsDir = path.resolve(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      const reportPath = path.join(reportsDir, 'doi_enrichment_report.json');
      const jsonOutput = {
        generatedAt: new Date().toISOString(),
        totalChecked: total,
        foundCount: this.foundDOIs.length,
        missingCount: this.missingDOIs.length,
        foundDois: this.foundDOIs.map((i) => ({
          citekey: i.key,
          file: i.file,
          doi: i.doi,
          confidence: i.confidence,
          score: i.score,
        })),
        missingDois: this.missingDOIs.map((i) => ({
          citekey: i.key,
          file: i.file,
          title: i.title,
        })),
      };
      fs.writeFileSync(reportPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
      console.log(chalk.gray(`Report saved to ${reportPath}`));
    } catch (err) {
      console.warn(chalk.yellow(`Could not save DOI report: ${err.message}`));
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
const invokedAsScript = process.argv[1] === fileURLToPath(import.meta.url);

if (invokedAsScript) {
  const finder = new DOIFinder(bibDir);
  finder.run().catch(err => {
    console.error(chalk.red('Fatal error:'), err);
    process.exit(1);
  });
}
