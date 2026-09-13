import api from './axios';

/**
 * Check text for grammar and spelling errors via self-hosted LanguageTool
 * @param {string} text - Text to analyze
 * @param {string} language - Target language (default 'en-US')
 */
export const checkGrammar = async (text, language = 'en-US') => {
  const response = await api.post('/grammar-check', { text, language });
  return response.data;
};
