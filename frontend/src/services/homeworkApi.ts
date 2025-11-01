import api from './api';
import { HomeworkUploadRequest, Homework } from '../types/homework';

export const homeworkApi = {
  uploadHomework: async (data: HomeworkUploadRequest): Promise<Homework> => {
    const formData = new FormData();
    formData.append('input_type', data.input_type);
    formData.append('input_language', data.input_language);
    formData.append('output_language', data.output_language);

    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.text_input) {
      formData.append('text_input', data.text_input);
    }
    if (data.audio_file) {
      formData.append('audio_file', data.audio_file);
    }

    const response = await api.post('/api/homework/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHomework: async (homeworkId: string): Promise<Homework> => {
    const response = await api.get(`/api/homework/${homeworkId}`);
    return response.data;
  },
};
