// run-wave6.mjs — Run Wave 6: strengthen P, IN, SY tags in overfilled tiers
import { processBatch, log, generateStats } from './lib.mjs';
import { wave6T13, wave6T12, wave6T7 } from './entries-wave6.mjs';

async function main() {
  log('\n# Wave 6: Strengthen P, IN, SY Tags in Overfilled Tiers');
  log(`Started: ${new Date().toISOString()}`);
  log('Initial tier stats:');
  log(generateStats());
  log('');

  const batches = [wave6T13, wave6T12, wave6T7];
  let succeeded = 0;
  let failed = 0;
  let totalAdded = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    log(`\n--- Batch ${i + 1}/${batches.length}: ${batch.id} ---`);
    const result = processBatch(batch);
    if (result.success) {
      succeeded++;
      totalAdded += batch.entries.length;
    } else {
      failed++;
      log(`  FAILED: ${result.reason}`);
      if (result.conflicts && result.conflicts.length > 0) {
        for (const c of result.conflicts) {
          log(`    [${c.type}] ${c.key}: ${c.detail}`);
        }
      }
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  log('\n=== WAVE 6 SUMMARY ===');
  log(`Batches succeeded: ${succeeded}/${batches.length}`);
  log(`Batches failed: ${failed}/${batches.length}`);
  log(`Total entries added: ${totalAdded}`);
  log('\nFinal tier stats:');
  log(generateStats());
  log('\nWave 6 complete.');
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});
