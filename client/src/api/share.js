import API from './axios';

/**
 * Fetch collaborators and sharing settings for a document
 */
export const getCollaborators = async (id) => {
  const response = await API.get(`/documents/${id}/collaborators`);
  return response.data;
};

/**
 * Invite or update collaborator role on a document
 */
export const addCollaborator = async (id, email, role = 'viewer') => {
  const response = await API.post(`/documents/${id}/share`, { email, role });
  return response.data;
};

/**
 * Remove a collaborator from a document
 */
export const removeCollaborator = async (id, userId) => {
  const response = await API.delete(`/documents/${id}/share/${userId}`);
  return response.data;
};

/**
 * Update link sharing visibility and role
 */
export const updateVisibility = async (id, visibility, linkRole) => {
  const response = await API.patch(`/documents/${id}/visibility`, { visibility, linkRole });
  return response.data;
};
