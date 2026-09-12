import api from './axios';

/**
 * Upload a media file (audio or image)
 */
export const uploadMediaFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
