// API configuration
// For Expo: Use your computer's IP address instead of localhost
// Android Emulator: Use 10.0.2.2 to access host machine's localhost
// iOS Simulator: Use localhost
// Physical Device: Use your computer's IP address (e.g., http://192.168.1.100:3000)
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

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
