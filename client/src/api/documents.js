import API from './axios';

/**
 * Create a new blank document
 * @param {Object} [data] - { title, content }
 */
export const createDocument = async (data = {}) => {
  const response = await API.post('/documents', data);
  return response.data;
};

/**
 * Fetch documents (supports ?type=shared or ?type=owned)
 */
export const getDocuments = async (params = {}) => {
  const response = await API.get('/documents', { params });
  return response.data;
};

/**
 * Fetch a single document by ID
 * @param {string} id - Document ID
 */
export const getDocumentById = async (id) => {
  const response = await API.get(`/documents/${id}`);
  return response.data;
};

/**
 * Update document title and/or content
 * @param {string} id - Document ID
 * @param {Object} data - { title, content }
 */
export const updateDocument = async (id, data) => {
  const response = await API.put(`/documents/${id}`, data);
  return response.data;
};

/**
 * Delete a document by ID
 * @param {string} id - Document ID
 */
export const deleteDocument = async (id) => {
  const response = await API.delete(`/documents/${id}`);
  return response.data;
};

/**
 * Export a document by ID in a specific format ('pdf' | 'docx' | 'txt' | 'html')
 * @param {string} id - Document ID
 * @param {'pdf' | 'docx' | 'txt' | 'html'} format - Target export format
 */
export const exportDocument = async (id, format) => {
  const response = await API.get(`/documents/${id}/export`, {
    params: { format },
    responseType: 'blob'
  });
  return response;
};

