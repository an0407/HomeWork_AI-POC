import { Subject, Language } from './homework';

export type QuestionType = 'mcq' | 'fill_blank' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface PracticeTest {
  test_id: string;
  subject: Subject;
  num_questions: number;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
  language: Language;
  created_at: string;
}

export interface PracticeGenerateRequest {
  subject: Subject;
  topics: string[];
  num_questions: number;
  difficulty: Difficulty;
  language: Language;
}

export interface UserAnswer {
  question_number: number;
  user_answer: string;
}

export interface PracticeSubmitRequest {
  test_id: string;
  answers: UserAnswer[];
  time_taken: number;
}

export interface QuestionResult {
  question_number: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface PracticeResult {
  test_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken: number;
  results: QuestionResult[];
  created_at: string;
}
