import api from './api';

export type FeedbackIssueType =
  | 'incorrect_answer'
  | 'unclear_explanation'
  | 'too_advanced'
  | 'too_simple'
  | 'language_error'
  | 'other';

export interface SubmitFeedbackRequest {
  solution_id: string;
  rating: number; // 1-5
  feedback_text?: string;
  was_helpful: boolean;
  issues?: FeedbackIssueType[];
}

export interface FeedbackResponse {
  feedback_id: string;
  message: string;
  average_rating?: number;
}

export interface FeedbackItem {
  _id: string;
  solution_id: string;
  rating: number;
  feedback_text?: string;
  was_helpful: boolean;
  issues?: FeedbackIssueType[];
  created_at: string;
}

export interface SolutionFeedbackSummary {
  solution_id: string;
  average_rating: number;
  total_feedback: number;
  helpful_count: number;
  recent_feedback: FeedbackItem[];
}

export const feedbackApi = {
  submitFeedback: async (data: SubmitFeedbackRequest): Promise<FeedbackResponse> => {
    const response = await api.post('/api/feedback/submit', data);
    return response.data;
  },

  getSolutionFeedback: async (solutionId: string): Promise<SolutionFeedbackSummary> => {
    const response = await api.get(`/api/feedback/solution/${solutionId}`);
    return response.data;
  },
};
