export type InputType = 'image' | 'text' | 'audio' | 'webcam';
export type Language = 'en' | 'ta' | 'hi';
export type Subject = 'math' | 'science' | 'language';

export interface HomeworkUploadRequest {
  file?: File;
  text_input?: string;
  audio_file?: File;
  input_type: InputType;
  input_language: Language;
  output_language: Language;
}

export interface Homework {
  homework_id: string;
  extracted_text: string;
  subject: Subject;
  input_type: InputType;
  input_language: Language;
  output_language: Language;
  status: string;
  created_at: string;
}
