import { Command } from 'commander';
import { VeilLabsClient } from '../sdk';
import { marketCommands } from './commands/market';
import { swapCommands } from './commands/swap';
import { trackCommands } from './commands/track';
import { logger } from './utils/ui';
import chalk from 'chalk';

export const cli = new Command();

cli
  .name('veillabs')
  .description('Veil Labs Privacy-First SDK & CLI for Cross-chain Swaps')
  .version('1.0.0');

// Global Options
cli.option('--base-url <url>', 'Override default API base URL', 'https://trade.veillabs.app/api');

export function runCLI() {
  const options = cli.opts();
  const sdk = new VeilLabsClient({
    baseUrl: options.baseUrl
  });

  // Register Commands
  cli.addCommand(marketCommands(sdk));
  cli.addCommand(swapCommands(sdk));
  cli.addCommand(trackCommands(sdk));

  // Default header
  console.log(chalk.cyan.bold('\n' + ' VEIL LABS CLI ' + '\n'));

  cli.parse(process.argv);

  if (!process.argv.slice(2).length) {
    cli.outputHelp();
  }
}
