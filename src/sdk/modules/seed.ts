import type { AxiosInstance } from 'axios';
import type { SeedParams, SeedResponse } from '../types';

export class SeedModule {
  constructor(private api: AxiosInstance) {}

  async create(params: SeedParams): Promise<SeedResponse> {
    const { data } = await this.api.post<SeedResponse>('/seed/create', params);
    return data;
  }

  async getStatus(id: string): Promise<SeedResponse> {
    const { data } = await this.api.get<SeedResponse>(`/seed/status/${id}`);
    return data;
  }
}
