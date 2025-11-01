import { Subject, Language } from './homework';

export interface Flashcard {
  card_id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlashcardSet {
  set_id: string;
  set_name: string;
  subject: Subject;
  topic: string;
  num_cards: number;
  cards: Flashcard[];
  language: Language;
  created_at: string;
}

export interface FlashcardGenerateRequest {
  subject: Subject;
  topic: string;
  num_cards: number;
  language: Language;
}

export interface FlashcardProgress {
  set_id: string;
  cards_studied: number;
  cards_mastered: number;
  last_studied_at?: string;
}

export interface StudySessionCard extends Flashcard {
  isFlipped: boolean;
  difficulty_rating?: 'again' | 'hard' | 'good' | 'easy';
}
