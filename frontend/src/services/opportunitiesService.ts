import { apiClient } from './api';
import { Opportunity, OpportunityDetail, OpportunityListResponse } from '../types/api';

export interface OpportunityFilterParams {
  search?: string;
  category?: string;
  min_score?: number;
  max_score?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export const opportunitiesService = {
  async getOpportunities(params: OpportunityFilterParams = {}): Promise<OpportunityListResponse> {
    const response = await apiClient.get<OpportunityListResponse>('/opportunities', { params });
    return response.data;
  },

  async getOpportunityById(id: string): Promise<OpportunityDetail> {
    const response = await apiClient.get<OpportunityDetail>(`/opportunities/${id}`);
    return response.data;
  },

  async updateOpportunityStatus(id: string, status: 'active' | 'starred' | 'archived'): Promise<Opportunity> {
    const response = await apiClient.patch<Opportunity>(`/opportunities/${id}`, { status });
    return response.data;
  },

  async getOpportunityPRD(id: string) {
    const response = await apiClient.get<import('../types/api').OpportunityPRD>(`/opportunities/${id}/prd`);
    return response.data;
  },

  async getBatchPRD(opportunityIds: string[]) {
    const response = await apiClient.post<{
      count: number;
      items: import('../types/api').OpportunityPRD[];
      combined_markdown: string;
    }>('/opportunities/batch-prd', { opportunity_ids: opportunityIds });
    return response.data;
  },
};

