import { apiClient } from './api';
import { 
  CopilotAskRequest, 
  CopilotAskResponse, 
  OpportunitySynthesizeResponse 
} from '../types/api';

export const copilotService = {
  askCopilot: async (payload: CopilotAskRequest): Promise<CopilotAskResponse> => {
    const res = await apiClient.post<CopilotAskResponse>('/ai/ask', payload);
    return res.data;
  },

  getSuggestedPrompts: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/ai/suggested-prompts');
    return res.data;
  },

  synthesizeOpportunity: async (id: string): Promise<OpportunitySynthesizeResponse> => {
    const res = await apiClient.post<OpportunitySynthesizeResponse>(`/ai/synthesize-opportunity/${id}`);
    return res.data;
  },
};

