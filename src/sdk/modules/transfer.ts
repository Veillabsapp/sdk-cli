import type { AxiosInstance } from 'axios';
import type { TransferParams, MultiTransferParams, TransferResponse } from '../types';

export class TransferModule {
  constructor(private api: AxiosInstance) {}

  async single(params: TransferParams): Promise<TransferResponse> {
    const { data } = await this.api.post<TransferResponse>('/transfer', params);
    return data;
  }

  async multi(params: MultiTransferParams): Promise<TransferResponse> {
    const { data } = await this.api.post<TransferResponse>('/transfer/multi', params);
    return data;
  }
}

export class StatsModule {
  constructor(private api: AxiosInstance) {}

  async getVolume(): Promise<any> {
    const { data } = await this.api.get('/volume');
    return data;
  }
}
