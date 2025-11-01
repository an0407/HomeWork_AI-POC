import { Language } from './homework';

export interface UserSettings {
  user_id: string;
  default_input_language: Language;
  default_output_language: Language;
  auto_generate_audio: boolean;
  audio_speed: number; // 0.75, 1.0, 1.25, 1.5
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  study_reminders: boolean;
  study_reminder_time?: string; // HH:MM format
}

export interface UpdateSettingsRequest {
  default_input_language?: Language;
  default_output_language?: Language;
  auto_generate_audio?: boolean;
  audio_speed?: number;
  theme?: 'light' | 'dark' | 'system';
  notifications_enabled?: boolean;
  study_reminders?: boolean;
  study_reminder_time?: string;
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  settings: UserSettings;
}
