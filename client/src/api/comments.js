import API from './axios';

/**
 * Fetch all comments for a document
 * @param {string} docId - Document ID
 */
export const getComments = async (docId) => {
  const response = await API.get(`/documents/${docId}/comments`);
  return response.data;
};

/**
 * Create a new comment thread on a document
 * @param {string} docId - Document ID
 * @param {Object} data - { text, selectedText, selectionRange }
 */
export const createComment = async (docId, data) => {
  const response = await API.post(`/documents/${docId}/comments`, data);
  return response.data;
};

/**
 * Add a reply to an existing comment
 * @param {string} commentId - Comment ID
 * @param {Object} data - { text }
 */
export const addReply = async (commentId, data) => {
  const response = await API.post(`/comments/${commentId}/replies`, data);
  return response.data;
};

/**
 * Update a comment (resolve, reopen, edit text)
 * @param {string} commentId - Comment ID
 * @param {Object} data - { resolved, text }
 */
export const updateComment = async (commentId, data) => {
  const response = await API.patch(`/comments/${commentId}`, data);
  return response.data;
};

/**
 * Delete a comment thread
 * @param {string} commentId - Comment ID
 */
export const deleteComment = async (commentId) => {
  const response = await API.delete(`/comments/${commentId}`);
  return response.data;
};
