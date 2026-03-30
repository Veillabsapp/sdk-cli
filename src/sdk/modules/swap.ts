import type { AxiosInstance } from 'axios';
import type { SwapParams, SwapResponse } from '../types';

export class SwapModule {
  constructor(private api: AxiosInstance) {}

  async create(params: SwapParams): Promise<SwapResponse> {
    const { data } = await this.api.post<SwapResponse>('/exchanges', params);
    return data;
  }

  async getStatus(id: string): Promise<SwapResponse> {
    const { data } = await this.api.get<SwapResponse>(`/exchanges/${id}`);
    return data;
  }
}
