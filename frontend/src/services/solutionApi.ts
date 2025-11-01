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
    // If filename already includes the full path, use it as-is
    if (filename.startsWith('/api/') || filename.startsWith('http')) {
      // If it's a relative path starting with /api/, prepend the base URL
      if (filename.startsWith('/api/')) {
        return `${import.meta.env.VITE_API_URL || 'http://192.168.5.99:8000'}${filename}`;
      }
      // If it's already a full URL, return as-is
      return filename;
    }
    // Legacy format: just the filename (backward compatibility)
    return `${import.meta.env.VITE_API_URL || 'http://192.168.5.99:8000'}/api/solution/audio/${filename}`;
  },
};
