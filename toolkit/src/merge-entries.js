#!/usr/bin/env node

const chalk = require('chalk');
const readline = require('readline');

console.log('\n' + '='.repeat(60));
console.log(chalk.cyan.bold('  HUMMBL Bibliography Entry Merger'));
console.log('='.repeat(60));

console.log(chalk.yellow('\n⚠️  This is an interactive tool for merging bibliography entries.'));
console.log(chalk.white('\nUsage:'));
console.log(chalk.white('  1. Identify entries that need merging'));
console.log(chalk.white('  2. Manually consolidate the best information from both'));
console.log(chalk.white('  3. Remove the duplicate entry'));
console.log(chalk.white('  4. Run validation to confirm'));

console.log(chalk.cyan('\n💡 Tips for merging:'));
console.log(chalk.white('  - Keep the entry from the higher tier (T1 > T2 > T3)'));
console.log(chalk.white('  - Preserve the most complete metadata'));
console.log(chalk.white('  - Combine HUMMBL transformation keywords'));
console.log(chalk.white('  - Use the most authoritative citation key'));

console.log(chalk.yellow('\n🔧 For automatic duplicate removal, use:'));
console.log(chalk.white('  npm run fix-dups'));

console.log('\n' + '='.repeat(60) + '\n');

// Exit gracefully
process.exit(0);
