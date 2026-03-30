import { Command } from 'commander';
import { VeildexClient } from '../../sdk';
import { logger, createSpinner } from '../utils/ui';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

export function trackCommands(sdk: VeildexClient) {
  const track = new Command('track')
    .description('Live-polling status of a transaction')
    .argument('<id>', 'Veildex Tracking ID or External Order ID')
    .option('--json', 'Output raw JSON')
    .option('--poll <ms>', 'Polling interval in milliseconds', '5000')
    .action(async (id, options) => {
      const pollInterval = parseInt(options.poll);
      const spinner = createSpinner('Fetching initial status...').start();
      
      try {
        const initialStatus = await sdk.track(id);
        spinner.stop();

        if (options.json) {
          console.log(JSON.stringify(initialStatus, null, 2));
          return;
        }

        logger.header(`TRACKING: ${id}`);
        console.log(`Type:       ${initialStatus.type || 'SWAP'}`);
        console.log(`Amount:     ${initialStatus.amountFrom} ${initialStatus.tickerFrom?.toUpperCase() || ''}`);
        console.log(`Status:     ${initialStatus.status}`);

        const progressBar = new cliProgress.SingleBar({
          format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% | {status}',
          barCompleteChar: '\u2588',
          barIncompleteChar: '\u2591',
          hideCursor: true
        });

        const statusMap: Record<string, number> = {
          'waiting': 10,
          'confirming': 25,
          'exchanging': 50,
          'sending': 75,
          'finished': 100,
          'failed': 100
        };

        progressBar.start(100, statusMap[initialStatus.status] || 0, {
          status: initialStatus.status.toUpperCase()
        });

        const poll = setInterval(async () => {
          try {
            const data = await sdk.track(id);
            const progress = statusMap[data.status] || 0;
            
            progressBar.update(progress, { status: data.status.toUpperCase() });

            if (data.status === 'finished' || data.status === 'failed') {
              progressBar.stop();
              clearInterval(poll);
              console.log('\n');
              if (data.status === 'finished') {
                logger.success('Transaction completed successfully!');
              } else {
                logger.error('Transaction failed.');
              }
            }
          } catch (error) {
            // Silently retry on polling error
          }
        }, pollInterval);

        // Handle Ctrl+C
        process.on('SIGINT', () => {
          clearInterval(poll);
          progressBar.stop();
          console.log('\n');
          logger.info('Tracking stopped by user.');
          process.exit(0);
        });

      } catch (error: any) {
        spinner.fail('Failed to track ID');
        logger.error(error.message);
      }
    });

  return track;
}
