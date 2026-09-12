import api from './axios';

/**
 * Fetch all versions for a document
 */
export const getVersions = async (docId) => {
  const response = await api.get(`/documents/${docId}/versions`);
  return response.data;
};

/**
 * Fetch a specific version by ID
 */
export const getVersion = async (docId, versionId) => {
  const response = await api.get(`/documents/${docId}/versions/${versionId}`);
  return response.data;
};

/**
 * Create a named snapshot for a document
 */
export const createVersion = async (docId, versionData) => {
  const response = await api.post(`/documents/${docId}/versions`, versionData);
  return response.data;
};

/**
 * Restore a document to a past version
 */
export const restoreVersion = async (docId, versionId) => {
  const response = await api.post(`/documents/${docId}/versions/${versionId}/restore`);
  return response.data;
};
