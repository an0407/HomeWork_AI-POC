import api from './api';

export interface DeleteResponse {
  message: string;
  deleted_count: number;
}

export interface BatchResultItem {
  homework_id: string;
  status: 'success' | 'skipped' | 'failed';
  message: string;
  solution_id?: string;
  error?: string;
}

export interface BatchGenerateRequest {
  homework_ids: string[]; // 1-10 items
}

export interface BatchGenerateResponse {
  results: BatchResultItem[];
  total_processed: number;
  successful: number;
  failed: number;
  skipped: number;
}

export const utilityApi = {
  deleteHomework: async (homeworkId: string): Promise<DeleteResponse> => {
    const response = await api.delete(`/api/utility/homework/${homeworkId}`);
    return response.data;
  },

  deleteFlashcardSet: async (setId: string): Promise<DeleteResponse> => {
    const response = await api.delete(`/api/utility/flashcards/${setId}`);
    return response.data;
  },

  batchGenerateSolutions: async (homeworkIds: string[]): Promise<BatchGenerateResponse> => {
    const response = await api.post('/api/utility/batch/generate-solutions', {
      homework_ids: homeworkIds,
    });
    return response.data;
  },
};
