import API from './axios';

/**
 * Send request to AI Assistant
 * @param {Object} payload - { action: 'generate'|'rephrase'|'tone'|'summarize', prompt?, text?, tone? }
 */
export const processAiAssistant = async (payload) => {
  const response = await API.post('/ai/process', payload);
  return response.data;
};
