#!/usr/bin/env node

# Safety: run with --dry-run first to preview changes
 * merge-enriched-dois.js — Automatically merge high-confidence DOIs into .bib files
 *
 * Usage: node merge-enriched-dois.js [doiReportJson] [bibDir] [--min-confidence medium] [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

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
  return path.resolve(__dirname, '../bibliography');
}

export function mergeDiscoveredDois(options = {}) {
  const bibDir = resolveBibDir(options.bibDir);
  const minConfidence = options.minConfidence || 'medium';
  const dryRun = Boolean(options.dryRun);

  const allowedConfidences = minConfidence === 'low'
    ? ['low', 'medium', 'high']
    : minConfidence === 'medium'
      ? ['medium', 'high']
      : ['high'];

  const reportPath = options.reportJson
    ? path.resolve(options.reportJson)
    : path.join(rootDir, 'reports', 'doi_enrichment_report.json');

  if (!fs.existsSync(reportPath)) {
    console.log(`No DOI enrichment report found at ${reportPath}. Run 'npm run find-dois' first.`);
    return { mergedCount: 0, skippedCount: 0 };
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const foundDois = report.foundDois || [];
  let mergedCount = 0;
  let skippedCount = 0;

  for (const item of foundDois) {
    if (!item.citekey || !item.doi || !item.file) {
      continue;
    }

    if (!allowedConfidences.includes(item.confidence)) {
      skippedCount++;
      continue;
    }

    const bibFile = path.join(bibDir, item.file);
    if (!fs.existsSync(bibFile)) {
      console.warn(`Warning: Target bib file not found: ${bibFile}`);
      continue;
    }

    let content = fs.readFileSync(bibFile, 'utf8');

    // Skip if entry already has a doi field
    const entryBlockRegex = new RegExp(`(@\\w+\\s*{\\s*${item.citekey}\\s*,[\\s\\S]*?)(^})`, 'm');
    const match = entryBlockRegex.exec(content);

    if (!match) {
      console.warn(`Warning: Citekey ${item.citekey} not found in ${item.file}`);
      continue;
    }

    const entryBody = match[1];
    if (/\bdoi\s*=/i.test(entryBody)) {
      continue; // Already has DOI
    }

    if (dryRun) {
      console.log(`[DRY-RUN] Would add DOI ${item.doi} to ${item.citekey} in ${item.file}`);
      mergedCount++;
    } else {
      const updatedBody = `${entryBody}  doi = {${item.doi}},\n`;
      content = content.replace(entryBlockRegex, `${updatedBody}$2`);
      fs.writeFileSync(bibFile, content, 'utf8');
      console.log(`✓ Added DOI ${item.doi} to ${item.citekey} in ${item.file}`);
      mergedCount++;
    }
  }

  console.log(`\nMerge Summary: ${mergedCount} DOIs ${dryRun ? 'would be merged' : 'merged'}, ${skippedCount} skipped due to confidence filter (< ${minConfidence}).`);
  return { mergedCount, skippedCount };
}

const isScript = process.argv[1] === __filename;
if (isScript) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const minConfIdx = args.indexOf('--min-confidence');
  const minConfidence = minConfIdx !== -1 ? args[minConfIdx + 1] : 'medium';
  const nonFlags = args.filter((a) => !a.startsWith('--'));

  mergeDiscoveredDois({
    reportJson: nonFlags[0],
    bibDir: nonFlags[1],
    minConfidence,
    dryRun,
  });
}
