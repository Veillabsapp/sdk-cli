import axios, { type AxiosInstance } from 'axios';
import { MarketModule } from './modules/market';
import { SwapModule } from './modules/swap';
import { SeedModule } from './modules/seed';
import { TransferModule, StatsModule } from './modules/transfer';

interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
}

export class VeilLabsClient {
  private api: AxiosInstance;
  public market: MarketModule;
  public swap: SwapModule;
  public seed: SeedModule;
  public transfer: TransferModule;
  public stats: StatsModule;

  constructor(config: ClientConfig = {}) {
    const baseUrl = config.baseUrl || 'https://trade.veillabs.app/api';
    
    this.api = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add error interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.data && error.response.data.message) {
          error.message = error.response.data.message;
        } else if (error.response && error.response.data && error.response.data.error) {
          error.message = error.response.data.error;
        }
        return Promise.reject(error);
      }
    );

    this.market = new MarketModule(this.api);
    this.swap = new SwapModule(this.api);
    this.seed = new SeedModule(this.api);
    this.transfer = new TransferModule(this.api);
    this.stats = new StatsModule(this.api);
  }

  async track(id: string): Promise<any> {
    const { data } = await this.api.get(`/tracking/${id}`);
    return data;
  }
}
