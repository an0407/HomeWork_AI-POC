import api from './api';
import { Solution, SolutionGenerateRequest } from '../types/solution';

export const solutionApi = {
  generateSolution: async (data: SolutionGenerateRequest): Promise<Solution> => {
    const response = await api.post('/api/solution/generate', data);
    return response.data;
  },

  getSolution: async (solutionId: string): Promise<Solution> => {
    const response = await api.get(`/api/solution/${solutionId}`);
    return response.data;
  },

  regenerateAudio: async (solutionId: string, language: string): Promise<{ audio_url: string }> => {
    const response = await api.post(`/api/solution/${solutionId}/regenerate-audio`, {
      language,
    });
    return response.data;
  },

  getAudioUrl: (filename: string): string => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/audio/${filename}`;
  },
};
