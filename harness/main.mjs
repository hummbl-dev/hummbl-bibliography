// main.mjs v2 — Overnight harness main runner with dry-run support
// Usage: node harness/main.mjs [--dry-run]
import { processBatch, log, generateStats } from './lib.mjs';
import { wave2a } from './entries-wave2a.mjs';
import { wave3aT14, wave3aT15 } from './entries-wave3a-t14t15.mjs';
import { wave3aT16, wave3aT17 } from './entries-wave3a-t16t17.mjs';
import { wave3aT18, wave3aT19 } from './entries-wave3a-t18t19.mjs';
import { wave4a } from './entries-wave4a.mjs';
import { wave5 } from './entries-wave5.mjs';

const REPO = 'C:\\Users\\Owner\\PROJECTS\\hummbl-bibliography';
const dryRun = process.argv.includes('--dry-run');

const batches = [
  wave2a,        // 8 CO-grounding entries
  wave3aT14,     // 8 T14 Provenance entries
  wave3aT15,     // 5 T15 Maturity entries
  wave3aT16,     // 13 T16 Data Governance entries
  wave3aT17,     // 13 T17 Privacy entries
  wave3aT18,     // 10 T18 Human Oversight entries
  wave3aT19,     // 10 T19 Incident Response entries
  wave4a,        // 14 ARCANA social theory entries
  wave5,         // 1 T6 Governance completion entry
];

async function main() {
  log('# HUMMBL Bibliography Overnight Expansion Harness v2');
  log(`Started: ${new Date().toISOString()}`);
  log(`Mode: ${dryRun ? 'DRY RUN (no writes, no commits)' : 'LIVE (full commit + push)'}`);
  log(`Batches to process: ${batches.length}`);
  log(`Total entries to add: ${batches.reduce((s, b) => s + b.entries.length, 0)}`);
  log('');
  log('Initial tier stats:');
  log(generateStats());
  log('');

  let succeeded = 0;
  let failed = 0;
  let totalEntriesAdded = 0;
  const results = [];
  const allConflicts = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    log(`\n--- Batch ${i + 1}/${batches.length}: ${batch.id} ---`);

    try {
      const result = processBatch(batch, { dryRun });
      if (result.success) {
        succeeded++;
        totalEntriesAdded += batch.entries.length;
        results.push({ id: batch.id, status: dryRun ? 'DRY-RUN-OK' : 'SUCCESS', entries: batch.entries.length });
      } else {
        failed++;
        results.push({ id: batch.id, status: `FAILED(${result.reason})`, entries: batch.entries.length });
        if (result.conflicts && result.conflicts.length > 0) {
          allConflicts.push({ batch: batch.id, conflicts: result.conflicts });
        }
      }
    } catch (err) {
      log(`  UNEXPECTED ERROR in batch ${batch.id}: ${err.message}`);
      failed++;
      results.push({ id: batch.id, status: 'ERROR', entries: batch.entries.length });
    }

    // Brief pause between batches to let filesystem settle
    await new Promise(r => setTimeout(r, 2000));
  }

  log('\n\n=== OVERNIGHT HARNESS SUMMARY ===');
  log(`Completed: ${new Date().toISOString()}`);
  log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  log(`Batches succeeded: ${succeeded}/${batches.length}`);
  log(`Batches failed: ${failed}/${batches.length}`);
  log(`Total entries added: ${totalEntriesAdded}`);
  log('');
  log('| Batch | Status | Entries |');
  log('|-------|--------|---------|');
  for (const r of results) {
    log(`| ${r.id} | ${r.status} | ${r.entries} |`);
  }
  log('');

  if (allConflicts.length > 0) {
    log('\n=== ALL CONFLICTS ===');
    for (const ac of allConflicts) {
      log(`\nBatch ${ac.batch}:`);
      for (const c of ac.conflicts) {
        log(`  [${c.type}] ${c.key}: ${c.detail}`);
      }
    }
  }

  log('\nFinal tier stats:');
  log(generateStats());

  // File research-side issues if at least one batch succeeded (LIVE mode only)
  if (!dryRun && succeeded > 0) {
    log('\n=== FILING RESEARCH-SIDE GROUNDING CONTRACT ISSUES ===');
    try {
      const { execSync } = await import('child_process');
      execSync('node harness/research-updates.mjs', { cwd: REPO, encoding: 'utf8', timeout: 120000, stdio: 'inherit' });
    } catch (err) {
      log(`Research updates failed: ${err.message}`);
    }
  }

  log('\nHarness complete.');
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  log(err.stack || '');
  process.exit(1);
});
