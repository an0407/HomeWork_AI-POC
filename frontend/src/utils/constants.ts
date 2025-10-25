export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
} as const;

export const SUBJECTS = {
  math: { code: 'math', name: 'Mathematics', icon: '📐' },
  science: { code: 'science', name: 'Science', icon: '🔬' },
  language: { code: 'language', name: 'Language', icon: '📚' },
} as const;

export const INPUT_TYPES = {
  image: { code: 'image', name: 'Upload Image', icon: '📷', description: 'Upload a photo of your homework' },
  webcam: { code: 'webcam', name: 'Take Photo', icon: '📸', description: 'Use your camera to capture homework' },
  text: { code: 'text', name: 'Type Question', icon: '⌨️', description: 'Type or paste your question' },
  audio: { code: 'audio', name: 'Voice Input', icon: '🎤', description: 'Record your question' },
} as const;

export const API_ROUTES = {
  homework: {
    upload: '/api/homework/upload',
    get: (id: string) => `/api/homework/${id}`,
  },
  solution: {
    generate: '/api/solution/generate',
    get: (id: string) => `/api/solution/${id}`,
    regenerateAudio: (id: string) => `/api/solution/${id}/regenerate-audio`,
  },
  practice: {
    generate: '/api/practice/generate',
    submit: (id: string) => `/api/practice/${id}/submit`,
    get: (id: string) => `/api/practice/${id}`,
  },
  flashcard: {
    generate: '/api/flashcard/generate',
    list: '/api/flashcard/sets',
    get: (id: string) => `/api/flashcard/set/${id}`,
  },
  dashboard: {
    stats: '/api/dashboard/stats',
  },
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_AUDIO_TYPES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];

export const TOAST_DURATION = 5000; // 5 seconds
