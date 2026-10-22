import { apiClient } from './api';
import { IngestionJob, Source } from '../types/api';

export interface TriggerJobParams {
  source_code: string;
  category?: string;
  limit?: number;
  run_pipeline?: boolean;
}

export const jobsService = {
  async getSources(): Promise<Source[]> {
    const response = await apiClient.get<Source[]>('/sources');
    return response.data;
  },

  async getJobs(): Promise<IngestionJob[]> {
    const response = await apiClient.get<IngestionJob[]>('/jobs');
    return response.data;
  },

  async getJobById(id: string): Promise<IngestionJob> {
    const response = await apiClient.get<IngestionJob>(`/jobs/${id}`);
    return response.data;
  },

  async triggerJob(params: TriggerJobParams): Promise<{ job_id: string; status: string; message: string }> {
    const response = await apiClient.post<{ job_id: string; status: string; message: string }>('/jobs/ingest', params);
    return response.data;
  },
};
