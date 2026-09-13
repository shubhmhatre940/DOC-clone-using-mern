import API from './axios';

/**
 * Create a new folder
 * @param {Object} data - { name, parentFolder }
 */
export const createFolder = async (data) => {
  const response = await API.post('/folders', data);
  return response.data;
};

/**
 * Fetch all folders for current user (with doc counts)
 */
export const getFolders = async () => {
  const response = await API.get('/folders');
  return response.data;
};

/**
 * Rename a folder
 * @param {string} id - Folder ID
 * @param {string} name - New name
 */
export const renameFolder = async (id, name) => {
  const response = await API.patch(`/folders/${id}`, { name });
  return response.data;
};

/**
 * Delete a folder
 * @param {string} id - Folder ID
 */
export const deleteFolder = async (id) => {
  const response = await API.delete(`/folders/${id}`);
  return response.data;
};
