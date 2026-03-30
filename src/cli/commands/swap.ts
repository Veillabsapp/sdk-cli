import { Command } from 'commander';
import { VeilLabsClient } from '../../sdk';
import { logger, createSpinner } from '../utils/ui';
import { validateAndParseAsset } from '../utils/assets';

export function swapCommands(sdk: VeilLabsClient) {
  const swap = new Command('swap').description('Private swap commands');

  swap
    .command('create <from> <to> <amount> <address>')
    .description('Initiate a quick private swap')
    .option('--json', 'Output raw JSON')
    .action(async (from, to, amount, address, options) => {
      const fromAsset = await validateAndParseAsset(sdk, from, 'From Asset');
      const toAsset = await validateAndParseAsset(sdk, to, 'To Asset');

      if (!fromAsset || !toAsset) return;

      const spinner = createSpinner('Initiating swap...').start();
      try {
        const response = await sdk.swap.create({
          tickerFrom: fromAsset.ticker,
          networkFrom: fromAsset.network,
          tickerTo: toAsset.ticker,
          networkTo: toAsset.network,
          amount,
          addressTo: address
        });
        spinner.stop();

        if (options.json) {
          console.log(JSON.stringify(response, null, 2));
          return;
        }

        logger.success('Swap initiated successfully!');
        logger.header('SWAP DETAILS');
        console.log(`Tracking ID:      ${response.id}`);
        console.log(`Deposit Address:  ${response.addressFrom}`);
        console.log(`Amount from:      ${response.amountFrom} ${fromAsset.ticker.toUpperCase()}`);
        console.log(`Amount to:        ${response.amountTo} ${toAsset.ticker.toUpperCase()}`);
        console.log(`Destination:      ${response.addressTo}`);
        console.log('\n' + `Please deposit ${response.amountFrom} ${fromAsset.ticker.toUpperCase()} to the address above.` + '\n');
        logger.info(`Run 'veillabs track ${response.id}' to monitor progress.`);
      } catch (error: any) {
        spinner.fail('Failed to initiate swap');
        logger.error(error.message);
      }
    });

  return swap;
}
