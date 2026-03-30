import { Command } from 'commander';
import { VeilLabsClient, type SeedDestination } from '../../sdk';
import { logger, createSpinner, formatTable } from '../utils/ui';
import { validateAndParseAsset } from '../utils/assets';
import enquirer from 'enquirer';
const { Confirm, Input, NumberPrompt } = enquirer as any;
import chalk from 'chalk';

export function seedCommands(sdk: VeilLabsClient) {
  const seed = new Command('seed').description('Private Seed (Multi-distribution) commands');

  seed
    .command('create')
    .description('Start interactive wizard for multi-destination distribution')
    .action(async () => {
      logger.header('SEED DISTRIBUTION WIZARD');

      try {
        // 1. Source Asset
        const fromInput = await new Input({
          message: 'Enter source asset (e.g., eth:eth or usdt:bsc):',
          initial: 'eth:eth'
        }).run();

        const fromAsset = await validateAndParseAsset(sdk, fromInput, 'Source Asset');
        if (!fromAsset) return;

        // 2. Amount
        const amount = await new Input({
          message: `Enter total amount of ${fromAsset.ticker.toUpperCase()}:`,
          validate: (v: string) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 || 'Enter a valid amount'
        }).run();

        // 3. Destinations Loop
        const destinations: SeedDestination[] = [];
        let totalPercentage = 0;

        console.log(chalk.cyan('\nDefine destinations (Total must be 100%):'));

        while (totalPercentage < 100) {
          console.log(chalk.gray(`\n--- Destination Node #${destinations.length + 1} (${totalPercentage}% allocated) ---`));

          const destAssetInput = await new Input({
            message: 'Enter destination asset (e.g., usdc:bsc):',
            initial: 'usdc:bsc'
          }).run();

          const destAsset = await validateAndParseAsset(sdk, destAssetInput, 'Destination Asset');
          if (!destAsset) continue;

          const address = await new Input({
            message: `Enter recipient address for ${destAsset.ticker.toUpperCase()}:`,
            validate: (v: string) => v.length > 20 || 'Enter a valid address'
          }).run();

          const max = 100 - totalPercentage;
          const percentage = await new NumberPrompt({
            message: `Enter percentage for this destination (max ${max}%):`,
            validate: (v: number) => (v > 0 && v <= max) || `Enter a value between 1 and ${max}`
          }).run();

          destinations.push({
            address,
            ticker: destAsset.ticker,
            network: destAsset.network,
            percentage
          });

          totalPercentage += percentage;
        }

        // 4. Summary & Confirmation
        logger.header('DISTRIBUTION SUMMARY');
        console.log(`Source:     ${amount} ${fromAsset.ticker.toUpperCase()} (${fromAsset.network.toUpperCase()})`);
        console.log(`Nodes:      ${destinations.length}`);
        
        const summaryTable = [['Address', 'Asset', '%']];
        destinations.forEach(d => {
          summaryTable.push([
            d.address.substring(0, 10) + '...' + d.address.substring(d.address.length - 10),
            `${d.ticker.toUpperCase()}:${d.network.toUpperCase()}`,
            `${d.percentage}%`
          ]);
        });
        console.log(formatTable(summaryTable));

        const confirm = await new Confirm({
          message: 'Initiate this seed distribution?'
        }).run();

        if (!confirm) {
          logger.info('Cancelled by user.');
          return;
        }

        const spinner = createSpinner('Creating seed distribution...').start();
        const response = await sdk.seed.create({
          tickerFrom: fromAsset.ticker,
          networkFrom: fromAsset.network,
          tickerTo: 'bnb-bsc', // Default target asset as per backend concept
          networkTo: 'bsc',
          amount,
          destinations
        });
        spinner.stop();

        logger.success('Seed distribution initiated successfully!');
        logger.header('INTAKE DETAILS');
        console.log(`Tracking ID:      ${response.id}`);
        console.log(`Deposit Address:  ${response.addressFrom}`);
        console.log(`Amount:           ${response.amountFrom} ${response.tickerFrom.toUpperCase()}`);
        console.log('\n' + `Please deposit ${response.amountFrom} ${response.tickerFrom.toUpperCase()} to the address above.` + '\n');
        logger.info(`Run 'veillabs seed status ${response.id}' to monitor all nodes.`);

      } catch (error: any) {
        logger.error(`Wizard error: ${error.message}`);
      }
    });

  seed
    .command('status <id>')
    .description('Check status of all distribution nodes in a seed transaction')
    .action(async (id) => {
      const spinner = createSpinner('Fetching seed status...').start();
      try {
        const status = await sdk.seed.getStatus(id);
        spinner.stop();

        logger.header(`SEED DISTRIBUTION: ${id}`);
        console.log(`Parent Status:  ${status.status}`);
        console.log(`Source Amount:  ${status.amountFrom} ${status.tickerFrom?.toUpperCase() || ''}`);

        if (status.destinations && status.destinations.length > 0) {
          const data = [['Node', 'Address', 'Asset', '%', 'Status']];
          status.destinations.forEach((d: any, i: number) => {
            data.push([
              (i + 1).toString(),
              d.address.substring(0, 6) + '...' + d.address.substring(d.address.length - 6),
              `${d.ticker?.toUpperCase() || ''}`,
              `${d.percentage}%`,
              d.status?.toUpperCase() || 'WAITING'
            ]);
          });
          console.log(formatTable(data));
        } else {
          logger.info('No destination data available yet (Parent transaction still processing).');
        }

        logger.info(`Use 'veillabs track ${id}' for high-level intake tracking.`);
      } catch (error: any) {
        spinner.fail('Failed to fetch seed status');
        logger.error(error.message);
      }
    });

  return seed;
}
