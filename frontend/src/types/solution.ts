export interface SolutionStep {
  step_number: number;
  explanation: string;
  formula_used?: string | null;
}

export interface Solution {
  solution_id: string;
  homework_id: string;
  question: string;
  subject: string;
  solution_steps: SolutionStep[];
  final_answer: string;
  concepts_covered: string[];
  audio_url?: string | null;
  output_language: string;
  created_at: string;
}

export interface SolutionGenerateRequest {
  homework_id: string;
  generate_audio: boolean;
  output_language: string;
  audio_language?: string;
}
