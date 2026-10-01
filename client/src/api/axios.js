import axios from 'axios';

// Resolve API base URL dynamically:
// - Supports VITE_API_URL env variable (e.g. on Vercel)
// - In local dev without env var, defaults to http://localhost:5000/api (or local network IP)
// - In production without env var, defaults to https://doc-clone-using-mern.onrender.com/api
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  if (!url) {
    if (import.meta.env.DEV) {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return `http://${host}:5000/api`;
    }
    url = 'https://doc-clone-using-mern.onrender.com/api';
  }

  // Handle LAN testing if url points to localhost and is accessed via local IP
  if (typeof window !== 'undefined' && (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1'))) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      url = url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
  }

  // Ensure the URL has no trailing slash and ends with /api
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token and let browser set boundary for FormData
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If payload is FormData, remove Content-Type so browser sets boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle unauthenticated responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default API;
