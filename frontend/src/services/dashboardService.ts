import { apiClient } from './api';
import { DashboardStats, TrendsAnalytics, SystemHealth, Signal, Document } from '../types/api';

export const dashboardService = {
  async getHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemHealth>('/health');
    return response.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getTrends(timeframe: string = '30d'): Promise<TrendsAnalytics> {
    const response = await apiClient.get<TrendsAnalytics>('/analytics/trends', { params: { timeframe } });
    return response.data;
  },

  async getSignals(params: { signal_type?: string; severity?: number; limit?: number } = {}): Promise<Signal[]> {
    const response = await apiClient.get<Signal[]>('/signals', { params });
    return response.data;
  },

  async getDocuments(params: { source_code?: string; limit?: number } = {}): Promise<Document[]> {
    const response = await apiClient.get<Document[]>('/documents', { params });
    return response.data;
  },
};
