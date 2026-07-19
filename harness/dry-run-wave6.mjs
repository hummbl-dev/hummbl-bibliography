// dry-run-wave6.mjs — Pre-flight check only for Wave 6
import { preflightCheck, log, generateStats } from './lib.mjs';
import { wave6T13, wave6T12, wave6T7 } from './entries-wave6.mjs';

log('\n# Wave 6 Dry Run (pre-flight only)');
log(`Started: ${new Date().toISOString()}`);
log('Initial tier stats:');
log(generateStats());

const batches = [wave6T13, wave6T12, wave6T7];
for (const batch of batches) {
  log(`\n--- ${batch.id}: ${batch.description} ---`);
  log(`  Entries: ${batch.entries.length}`);
  log('  Pre-flight: checking for duplicates...');
  const conflicts = preflightCheck(batch.entries);
  if (conflicts.length > 0) {
    log(`  PRE-FLIGHT FAILED: ${conflicts.length} conflict(s):`);
    for (const c of conflicts) {
      log(`    [${c.type}] ${c.key}: ${c.detail}`);
    }
  } else {
    log('  Pre-flight: PASSED (no conflicts)');
  }
}
log('\nDry run complete.');
