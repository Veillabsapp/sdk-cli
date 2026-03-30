import { Command } from 'commander';
import { VeildexClient } from '../../sdk';
import { logger, createSpinner } from '../utils/ui';

export function swapCommands(sdk: VeildexClient) {
  const swap = new Command('swap').description('Private swap commands');

  swap
    .command('create <from> <to> <amount> <address>')
    .description('Initiate a quick private swap')
    .option('--json', 'Output raw JSON')
    .action(async (from, to, amount, address, options) => {
      const parseAsset = (asset: string) => {
        const [ticker, network] = asset.split(':');
        return { ticker: ticker || '', network: network || ticker || '' };
      };

      const fromAsset = parseAsset(from);
      const toAsset = parseAsset(to);

      if (!fromAsset.ticker || !toAsset.ticker) {
        logger.error('Invalid asset format. Use ticker or ticker:network');
        return;
      }

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
        logger.info(`Run 'veildex track ${response.id}' to monitor progress.`);
      } catch (error: any) {
        spinner.fail('Failed to initiate swap');
        logger.error(error.message);
      }
    });

  return swap;
}
