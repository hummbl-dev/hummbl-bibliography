#!/usr/bin/env node

/**
 * generate-llms-txt.js — Build root llms.txt and llms-full.txt
 *
 * Scans all BibTeX sources in bibliography/ and generates AI-readable indexes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import {
  parseBibEntriesFromFile,
  pickField,
  normalizeAuthor,
  normalizeYear,
  normalizeKeywordTags,
  THEMATIC_TIERS,
  tierFromFile,
} from './build-scientific-grounding.js';

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

export function generateLlmsFiles(bibDirArg, outputDir = rootDir) {
  const bibDir = resolveBibDir(bibDirArg);
  if (!fs.existsSync(bibDir)) {
    throw new Error(`Bibliography directory not found: ${bibDir}`);
  }

  const files = fs.readdirSync(bibDir)
    .filter((f) => f.endsWith('.bib'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/^T(\d+)/)?.[1] || '999', 10);
      const numB = parseInt(b.match(/^T(\d+)/)?.[1] || '999', 10);
      return numA - numB;
    });

  let totalEntries = 0;
  const llmsLines = [];
  const fullLines = [];
  const currentDate = new Date().toISOString().split('T')[0];

  llmsLines.push('# HUMMBL Bibliography — llms.txt');
  llmsLines.push('# AI-readable index of the HUMMBL research bibliography.');

  fullLines.push('# HUMMBL Bibliography — llms-full.txt');
  fullLines.push('# Complete AI-readable research bibliography with abstracts.');
  fullLines.push(`# Generated: ${currentDate}\n`);

  // Section placeholder for count header
  const headerIdx = llmsLines.length;
  llmsLines.push(''); // Will update with entry count
  llmsLines.push('#');
  llmsLines.push('# Query API: node toolkit/src/query.js --keyword HUMMBL:BKI --format json');
  llmsLines.push('# Direct DOI access: https://doi.org/{doi}');
  llmsLines.push('#\n');

  for (const file of files) {
    const fullPath = path.join(bibDir, file);
    const parsedEntries = parseBibEntriesFromFile(fullPath);
    if (parsedEntries.length === 0) continue;

    totalEntries += parsedEntries.length;
    const tierCode = tierFromFile(file);
    const tierName = THEMATIC_TIERS[tierCode]?.name || tierCode;

    llmsLines.push(`## ${tierCode}: ${tierName} (${parsedEntries.length} entries)\n`);
    fullLines.push(`## ${tierCode}: ${tierName}\n`);

    for (const entry of parsedEntries) {
      const f = entry.fields;
      const key = entry.id || entry.key;
      const title = pickField(f, ['title']) || 'Untitled';
      const author = normalizeAuthor(pickField(f, ['author']));
      const year = normalizeYear(pickField(f, ['year']));
      const doi = pickField(f, ['doi']);
      const doiBadge = doi ? `doi:${doi}` : 'no-doi';
      const keywordsRaw = pickField(f, ['keywords', 'keyword', 'keyw']);
      const keywords = normalizeKeywordTags(keywordsRaw);

      // llms.txt summary format
      llmsLines.push(`- **${key}** (${author}, ${year}) ${doiBadge}`);
      llmsLines.push(`  ${title}`);
      if (keywords.length > 0) {
        llmsLines.push(`  Keywords: ${keywords.map(k => `HUMMBL:${k}`).join(' ')}`);
      }
      llmsLines.push('');

      // llms-full.txt detailed format
      const abstract = pickField(f, ['abstract']) || 'No abstract available.';
      fullLines.push(`### [${key}] ${title}`);
      fullLines.push(`- **Author**: ${author}`);
      fullLines.push(`- **Year**: ${year}`);
      fullLines.push(`- **Tier**: ${tierCode} (${tierName})`);
      if (doi) fullLines.push(`- **DOI**: ${doi}`);
      fullLines.push(`- **Keywords**: ${keywords.map(k => `HUMMBL:${k}`).join(' ')}`);
      fullLines.push(`- **Abstract**: ${abstract}\n`);
    }
  }

  llmsLines[headerIdx] = `# ${totalEntries} entries across ${files.length} tiers. Last updated: ${currentDate}.`;

  const llmsPath = path.join(outputDir, 'llms.txt');
  const fullPath = path.join(outputDir, 'llms-full.txt');

  fs.writeFileSync(llmsPath, llmsLines.join('\n'), 'utf8');
  fs.writeFileSync(fullPath, fullLines.join('\n'), 'utf8');

  console.log(`Generated ${path.relative(rootDir, llmsPath)} (${totalEntries} entries)`);
  console.log(`Generated ${path.relative(rootDir, fullPath)}`);
  return { totalEntries, tierCount: files.length };
}

const isScript = process.argv[1] === __filename;
if (isScript) {
  const bibDirArg = process.argv[2];
  generateLlmsFiles(bibDirArg);
}
