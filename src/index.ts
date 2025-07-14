/**
 * Main entry point for graphinate CLI tool
 */

import { CLI } from './cli/index';

export async function main(): Promise<void> {
  const cli = new CLI();
  await cli.run();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}