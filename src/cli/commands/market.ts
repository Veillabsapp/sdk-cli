import { Command } from 'commander';
import { VeilLabsClient } from '../../sdk';
import { logger, formatTable, createSpinner } from '../utils/ui';
import { validateAndParseAsset } from '../utils/assets';

export function marketCommands(sdk: VeilLabsClient) {
  const market = new Command('market').description('Market data commands');

  market
    .command('currencies')
    .description('List all supported currencies')
    .option('--json', 'Output raw JSON')
    .action(async (options) => {
      const spinner = createSpinner('Fetching currencies...').start();
      try {
        const currencies = await sdk.market.getCurrencies();
        spinner.stop();

        if (options.json) {
          console.log(JSON.stringify(currencies, null, 2));
          return;
        }

        const data = [
          ['Ticker', 'Name', 'Network', 'Fiat', 'Featured']
        ];

        currencies.forEach((c: any) => {
          data.push([
            c.ticker.toUpperCase(),
            c.name,
            c.network.toUpperCase(),
            c.isFiat ? 'Yes' : 'No',
            c.featured ? 'Yes' : 'No'
          ]);
        });

        console.log(formatTable(data));
      } catch (error: any) {
        spinner.fail('Failed to fetch currencies');
        logger.error(error.message);
      }
    });

  market
    .command('estimate <from> <to> <amount>')
    .description('Get swap estimate')
    .option('--json', 'Output raw JSON')
    .action(async (from, to, amount, options) => {
      // Split 'eth:eth' or similar if network is provided, otherwise default ticker as network
      const fromAsset = await validateAndParseAsset(sdk, from, 'From Asset');
      const toAsset = await validateAndParseAsset(sdk, to, 'To Asset');

      if (!fromAsset || !toAsset) return;

      const spinner = createSpinner('Calculating estimate...').start();
      try {
        const estimate = await sdk.market.getEstimate({
          tickerFrom: fromAsset.ticker,
          networkFrom: fromAsset.network,
          tickerTo: toAsset.ticker,
          networkTo: toAsset.network,
          amount
        });
        spinner.stop();

        if (options.json) {
          console.log(JSON.stringify(estimate, null, 2));
          return;
        }

        logger.header('SWAP ESTIMATE');
        console.log(`From:    ${amount} ${fromAsset.ticker.toUpperCase()} (${fromAsset.network.toUpperCase()})`);
        console.log(`To:      ${estimate.estimatedAmount} ${toAsset.ticker.toUpperCase()} (${toAsset.network.toUpperCase()})`);
        
        const rate = parseFloat(estimate.estimatedAmount) / parseFloat(amount);
        console.log(`Rate:    1 ${fromAsset.ticker.toUpperCase()} = ${rate.toFixed(8)} ${toAsset.ticker.toUpperCase()}`);
        console.log(`Trace ID: ${estimate.traceId}`);
      } catch (error: any) {
        spinner.fail('Failed to get estimate');
        logger.error(error.message);
      }
    });

  return market;
}
