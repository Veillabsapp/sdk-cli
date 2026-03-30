import type { VeilLabsClient, Currency } from '../../sdk';
import { logger } from './ui';

export interface ParsedAsset {
  ticker: string;
  network: string;
}

export async function validateAndParseAsset(
  sdk: VeilLabsClient,
  input: string,
  label: string = 'Asset'
): Promise<ParsedAsset | null> {
  const [ticker, network] = input.split(':');
  const targetTicker = ticker?.toLowerCase() || '';
  const targetNetwork = network?.toLowerCase() || '';

  // Fetch all currencies for validation
  let currencies: Currency[] = [];
  try {
    currencies = await sdk.market.getCurrencies();
  } catch (error) {
    logger.error('Failed to connect to VeilLabs API for validation.');
    return null;
  }

  const matchingTicker = currencies.filter((c: Currency) => c.ticker.toLowerCase() === targetTicker);

  if (matchingTicker.length === 0) {
    logger.error(`${label} '${targetTicker}' is not supported by Veil Labs.`);
    return null;
  }

  // If network is specified, validate it
  if (targetNetwork) {
    const validPair = matchingTicker.find(c => c.network.toLowerCase() === targetNetwork);
    if (!validPair) {
      logger.error(`${label} '${targetTicker}' is not available on network '${targetNetwork}'.`);
      const validNetworks = matchingTicker.map(c => c.network).join(', ');
      logger.info(`Available networks for ${targetTicker.toUpperCase()}: ${validNetworks}`);
      return null;
    }
    return { ticker: targetTicker, network: targetNetwork };
  }

  // If network is NOT specified, and there's only one option, use it
  if (matchingTicker.length === 1 && matchingTicker[0]) {
    return { ticker: targetTicker, network: matchingTicker[0].network.toLowerCase() };
  }

  // If there are multiple options, ask the user to be specific
  logger.error(`${label} '${targetTicker}' exists on multiple networks. Please be specific (e.g., '${targetTicker}:eth').`);
  const validNetworks = matchingTicker.map(c => c.network).join(', ');
  logger.info(`Available networks for ${targetTicker.toUpperCase()}: ${validNetworks}`);
  
  return null;
}
