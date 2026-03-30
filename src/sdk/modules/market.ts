import type { AxiosInstance } from 'axios';
import type { Currency, Estimate, EstimateParams } from '../types';

export class MarketModule {
  constructor(private api: AxiosInstance) {}

  async getCurrencies(): Promise<Currency[]> {
    const { data } = await this.api.get<Currency[]>('/currencies');
    return data;
  }

  async getPairs(ticker: string, network: string): Promise<any[]> {
    const { data } = await this.api.get<any[]>(`/pairs/${ticker}/${network}`);
    return data;
  }

  async getEstimate(params: EstimateParams): Promise<Estimate> {
    const { data } = await this.api.get<Estimate>('/estimates', { params });
    return data;
  }

  async getRanges(params: any): Promise<any> {
    const { data } = await this.api.get<any>('/ranges', { params });
    return data;
  }
}
