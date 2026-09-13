import api from './axios';

/**
 * Fetch paginated activity log for a document
 * @param {string} documentId
 * @param {number} page
 * @param {number} limit
 */
export const getActivityLog = async (documentId, page = 1, limit = 30) => {
  const response = await api.get(`/documents/${documentId}/activity`, {
    params: { page, limit }
  });
  return response.data;
};
