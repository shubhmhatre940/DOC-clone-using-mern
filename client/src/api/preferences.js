import api from './axios';

/**
 * Fetch current user profile and preferences
 */
export const getUserPreferences = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update user preferences and notification settings
 */
export const updateUserPreferences = async (data) => {
  const response = await api.put('/auth/preferences', data);
  return response.data;
};
