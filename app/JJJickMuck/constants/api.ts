// API configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // OCR
  OCR_PROCESS: '/api/ocr/process',
  OCR_HISTORY: '/api/ocr/history',

  // Profile
  PROFILE_GET: '/api/profile',
  PROFILE_UPDATE: '/api/profile',

  // RAG
  RAG_QUERY: '/api/rag/query',
};
