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
export const exportDocument = async (id, format, params = {}) => {
  const response = await API.get(`/documents/${id}/export`, {
    params: { format, ...params },
    responseType: 'blob'
  });
  return response;
};

/**
  * Upload a Word document (.docx)
  * @param {FormData} formData - FormData containing 'file'
  */
export const uploadDocument = async (formData) => {
  // Let the browser automatically configure 'multipart/form-data; boundary=...'
  const response = await API.post('/documents/upload', formData);
  return response.data;
};

/**
 * Fetch available document templates
 */
export const getTemplates = async () => {
  const response = await API.get('/templates');
  return response.data;
};

/**
 * Fetch a single template by ID
 * @param {string} id - Template ID
 */
export const getTemplateById = async (id) => {
  const response = await API.get(`/templates/${id}`);
  return response.data;
};

/**
 * Search documents by title and content
 * @param {string} query - Search term
 */
export const searchDocuments = async (query) => {
  const response = await API.get('/documents/search', { params: { q: query } });
  return response.data;
};

/**
 * Restore a document from trash
 * @param {string} id - Document ID
 */
export const restoreDocument = async (id) => {
  const response = await API.patch(`/documents/${id}/restore`);
  return response.data;
};

/**
 * Permanently delete a document
 * @param {string} id - Document ID
 */
export const permanentDeleteDocument = async (id) => {
  const response = await API.delete(`/documents/${id}/permanent`);
  return response.data;
};

/**
 * Toggle starred status of a document
 * @param {string} id - Document ID
 */
export const toggleStarDocument = async (id) => {
  const response = await API.patch(`/documents/${id}/star`);
  return response.data;
};

/**
 * Move a document to a folder (or null for root)
 * @param {string} id - Document ID
 * @param {string|null} folderId - Destination folder ID
 */
export const moveDocumentToFolder = async (id, folderId) => {
  const response = await API.patch(`/documents/${id}/move`, { folderId });
  return response.data;
};



