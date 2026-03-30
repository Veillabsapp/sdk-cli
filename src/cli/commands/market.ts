import { Command } from 'commander';
import { VeildexClient } from '../../sdk';
import { logger, formatTable, createSpinner } from '../utils/ui';

export function marketCommands(sdk: VeildexClient) {
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

        currencies.forEach(c => {
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
