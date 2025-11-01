import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.5.99:8000',
});

// Request types
export interface GenerateFlashcardsRequest {
  homework_id: string;
  num_cards?: number;
  output_language?: string;
}

// Response types
export interface Flashcard {
  card_id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlashcardSet {
  set_id: string;
  title: string;
  subject: string;
  output_language: string;
  cards: Flashcard[];
  total_cards: number;
  created_at: string;
}

export interface GenerateFlashcardsResponse extends FlashcardSet {}

export interface GetFlashcardSetResponse {
  success: boolean;
  flashcard_set: FlashcardSet;
}

// Flashcard API
export const flashcardApi = {
  /**
   * Generate flashcards for a homework assignment
   */
  generateFlashcards: async (
    data: GenerateFlashcardsRequest
  ): Promise<GenerateFlashcardsResponse> => {
    const response = await api.post('/api/flashcards/generate', data);
    return response.data;
  },

  /**
   * Get a specific flashcard set by ID
   */
  getFlashcardSet: async (setId: string): Promise<GetFlashcardSetResponse> => {
    const response = await api.get(`/api/flashcards/set/${setId}`);
    return response.data;
  },
};
