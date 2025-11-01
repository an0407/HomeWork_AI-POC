import api from './api';
import { Language } from '../types/homework';

export interface UserPreferences {
  language: Language;
  voice_language: Language;
  difficulty_preference: 'auto' | 'easy' | 'medium' | 'hard';
  grade_level: number; // 1-12
  auto_generate_audio: boolean;
  auto_generate_flashcards: boolean;
  practice_question_count: number; // 1-20
  theme: 'light' | 'dark';
}

export interface PreferencesResponse {
  preferences: UserPreferences;
  updated_at?: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
}

export const settingsApi = {
  getPreferences: async (): Promise<PreferencesResponse> => {
    const response = await api.get('/api/settings/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: UserPreferences): Promise<PreferencesResponse> => {
    const response = await api.put('/api/settings/preferences', preferences);
    return response.data;
  },

  getSupportedLanguages: async (): Promise<LanguageInfo[]> => {
    const response = await api.get('/api/settings/languages');
    return response.data;
  },
};
