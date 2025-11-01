import api from './api';
import { Subject, Language } from '../types/homework';

export interface HomeworkSearchParams {
  query?: string;
  subject?: Subject;
  date_from?: string;
  date_to?: string;
  limit?: number;
  skip?: number;
}

export interface HomeworkSearchResult {
  homework_id: string;
  extracted_text: string;
  subject: Subject;
  input_language: Language;
  output_language: Language;
  has_solution: boolean;
  solution_id: string | null;
  created_at: string;
}

export interface HomeworkSearchResponse {
  homework: HomeworkSearchResult[];
  total: number;
  page: number;
  total_pages: number;
}

export interface FlashcardSearchParams {
  query?: string;
  subject?: Subject;
  limit?: number;
}

export interface FlashcardSearchResult {
  set_id: string;
  title: string;
  subject: Subject;
  output_language: Language;
  total_cards: number;
  created_at: string;
}

export interface FlashcardSearchResponse {
  flashcard_sets: FlashcardSearchResult[];
  total: number;
}

export const searchApi = {
  searchHomework: async (params: HomeworkSearchParams): Promise<HomeworkSearchResponse> => {
    const response = await api.get('/api/search/homework', { params });
    return response.data;
  },

  searchFlashcards: async (params: FlashcardSearchParams): Promise<FlashcardSearchResponse> => {
    const response = await api.get('/api/search/flashcards', { params });
    return response.data;
  },
};
