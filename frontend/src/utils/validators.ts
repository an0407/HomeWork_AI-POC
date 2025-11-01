import { ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES, MAX_FILE_SIZE } from './constants';

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a WAV, MP3, or WebM audio file.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Validate text input
 */
export function validateTextInput(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Please enter a question.',
    };
  }

  if (trimmed.length < 5) {
    return {
      valid: false,
      error: 'Question is too short. Please provide more detail.',
    };
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      error: 'Question is too long. Please keep it under 5000 characters.',
    };
  }

  return { valid: true };
}

/**
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}
