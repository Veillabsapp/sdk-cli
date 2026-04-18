export interface Currency {
  ticker: string;
  name: string;
  network: string;
  image: string;
  hasExternalId: boolean;
  isFiat: boolean;
  featured: boolean;
  isDefault: boolean;
}

export interface Pair {
  fromTicker: string;
  fromNetwork: string;
  toTicker: string;
  toNetwork: string;
}

export interface EstimateParams {
  tickerFrom: string;
  networkFrom: string;
  tickerTo: string;
  networkTo: string;
  amount: string;
}

export interface Estimate {
  estimatedAmount: string;
  rateId: string | null;
  validUntil: string | null;
  traceId: string;
}

export interface SwapParams {
  tickerFrom: string;
  networkFrom: string;
  tickerTo: string;
  networkTo: string;
  amount: string;
  addressTo: string;
  fixed?: boolean;
}

export interface SwapResponse {
  id: string;
  orderId: string;
  addressFrom: string;
  amountFrom: string;
  amountTo: string;
  status: string;
  tickerFrom: string;
  networkFrom: string;
  tickerTo: string;
  networkTo: string;
  addressTo: string;
  traceId?: string;
}

export interface SeedDestination {
  address: string;
  percentage: number;
  ticker: string;
  network: string;
}

export interface SeedParams {
  tickerFrom: string;
  networkFrom: string;
  tickerTo: string;
  networkTo: string;
  amount: string;
  destinations: SeedDestination[];
}

export interface SeedResponse {
  id: string;
  status: string;
  amountFrom: string;
  tickerFrom: string;
  addressFrom: string;
  destinations: any[];
}

