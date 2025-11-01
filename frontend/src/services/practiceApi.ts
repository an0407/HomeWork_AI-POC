import api from './api';

export interface Question {
  question_id: string;
  question_text: string;
  question_type: 'mcq' | 'fill_blank' | 'true_false';
  options?: string[];
  difficulty: string;
}

export interface PracticeTest {
  test_id: string;
  homework_id: string;
  topic: string;
  subject: string;
  output_language: string;
  questions: Question[];
  created_at: string;
}

export interface SubmitAnswer {
  question_id: string;
  user_answer: string;
}

export interface PracticeSubmitRequest {
  answers: SubmitAnswer[];
  time_taken_seconds: number;
}

export interface DetailedResult {
  question: string;
  question_type: string;
  options?: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface PracticeSubmitResponse {
  submission_id: string;
  test_id: string;
  score: number;
  correct: number;
  total: number;
  time_taken_seconds: number;
  results: DetailedResult[];
  submitted_at: string;
}

export interface PracticeResults {
  test_id: string;
  submission_id: string;
  topic: string;
  subject: string;
  score: number;
  correct: number;
  total: number;
  time_taken_seconds: number;
  detailed_results: DetailedResult[];
  submitted_at: string;
}

export interface GeneratePracticeTestRequest {
  homework_id: string;
  question_count: number;
  difficulty: string;
  output_language: string;
}

export interface GeneratePracticeTestResponse {
  test_id: string;
  homework_id: string;
  topic: string;
  subject: string;
  output_language: string;
  questions: Question[];
  created_at: string;
}

export const practiceApi = {
  /**
   * Generate a new practice test
   */
  generatePracticeTest: async (
    request: GeneratePracticeTestRequest
  ): Promise<GeneratePracticeTestResponse> => {
    const response = await api.post('/api/practice/generate', request);
    return response.data;
  },

  /**
   * Get a practice test by ID
   */
  getPracticeTest: async (testId: string): Promise<PracticeTest> => {
    const response = await api.get(`/api/practice/${testId}`);
    return response.data;
  },

  /**
   * Submit answers for a practice test
   */
  submitPracticeTest: async (
    testId: string,
    request: PracticeSubmitRequest
  ): Promise<PracticeSubmitResponse> => {
    const response = await api.post(`/api/practice/${testId}/submit`, request);
    return response.data;
  },

  /**
   * Get detailed results for a practice test submission
   */
  getPracticeResults: async (
    testId: string,
    submissionId: string
  ): Promise<PracticeResults> => {
    const response = await api.get(
      `/api/practice/${testId}/results/${submissionId}`
    );
    return response.data;
  },
};
