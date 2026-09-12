import api from './axios';

/**
 * Fetch all notifications and unread count
 */
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
