// dry-run.mjs — Test a single batch without committing
import { appendEntries, runValidate, runCheckDups, log } from './lib.mjs';
import { wave2a } from './entries-wave2a.mjs';

log('# DRY RUN TEST: Wave 2A');
log(`Entries: ${wave2a.entries.length}`);

// Append entries
appendEntries(wave2a.entries);

// Validate
const val = runValidate();
log(`Validation result: ${val.errors} errors, ${val.warnings} warnings`);

// Check duplicates
const noDups = runCheckDups();
log(`Duplicates: ${noDups ? 'none' : 'FOUND'}`);

if (val.errors === 0 && noDups) {
  log('DRY RUN PASSED — entries are valid');
} else {
  log('DRY RUN FAILED — review errors above');
  if (val.output) {
    const lines = val.output.split('\n').filter(l => /error|warning|duplicate/i.test(l)).slice(0, 20);
    lines.forEach(l => log(`  ${l.trim()}`));
  }
}
