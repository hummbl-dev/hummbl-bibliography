// retry-failed.mjs — Retry only the batches that failed in the first run
import { processBatch, log } from './lib.mjs';
import { wave3aT16, wave3aT17 } from './entries-wave3a-t16t17.mjs';
import { wave3aT18, wave3aT19 } from './entries-wave3a-t18t19.mjs';
import { wave4a } from './entries-wave4a.mjs';

const REPO = 'C:\\Users\\Owner\\PROJECTS\\hummbl-bibliography';

// Only the 5 batches that failed due to duplicates (now fixed)
const batches = [
  wave3aT16,     // 13 T16 Data Governance entries (fixed: removed Sculley2015TechDebt, Mitchell2019ModelCards)
  wave3aT17,     // 13 T17 Privacy entries (fixed: removed Shokri2017MembershipInference)
  wave3aT18,     // 10 T18 Human Oversight entries (fixed: removed Klein2004, Parasuraman2000)
  wave3aT19,     // 10 T19 Incident Response entries (was clean, failed due to cascading dup check)
  wave4a,        // 14 ARCANA social theory entries (was clean, failed due to cascading dup check)
];

async function main() {
  log('\n# HUMMBL Bibliography Overnight Expansion Harness — RETRY RUN');
  log(`Started: ${new Date().toISOString()}`);
  log(`Batches to process: ${batches.length} (previously failed batches with fixed entries)`);
  log(`Total entries to add: ${batches.reduce((s, b) => s + b.entries.length, 0)}`);
  log('');

  let succeeded = 0;
  let failed = 0;
  let totalEntriesAdded = 0;
  const results = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    log(`\n--- Batch ${i + 1}/${batches.length}: ${batch.id} ---`);
    
    try {
      const ok = processBatch(batch);
      if (ok) {
        succeeded++;
        totalEntriesAdded += batch.entries.length;
        results.push({ id: batch.id, status: 'SUCCESS', entries: batch.entries.length });
      } else {
        failed++;
        results.push({ id: batch.id, status: 'FAILED', entries: batch.entries.length });
      }
    } catch (err) {
      log(`  UNEXPECTED ERROR in batch ${batch.id}: ${err.message}`);
      failed++;
      results.push({ id: batch.id, status: 'ERROR', entries: batch.entries.length, error: err.message });
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  log('\n\n=== RETRY RUN SUMMARY ===');
  log(`Completed: ${new Date().toISOString()}`);
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

  // File research-side issues if all batches succeeded
  if (succeeded > 0) {
    log('\n=== FILING RESEARCH-SIDE GROUNDING CONTRACT ISSUES ===');
    try {
      const { execSync } = await import('child_process');
      execSync('node harness/research-updates.mjs', { cwd: REPO, encoding: 'utf8', timeout: 120000, stdio: 'inherit' });
    } catch (err) {
      log(`Research updates failed: ${err.message}`);
    }
  }

  log('\nRetry run complete.');
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  log(err.stack || '');
  process.exit(1);
});
