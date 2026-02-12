/**
 * API Configuration
 * Configure base URL and default headers for all API requests
 */

function ensureProtocol(url: string): string {
  if (!url) return 'http://localhost:5001';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Default to https if no protocol specified
  return `https://${url}`;
}
const rawBaseURL = import.meta.env.VITE_BACKEND_BASEPATH;
export const API_CONFIG = {
  // Development
  baseURL: ensureProtocol(rawBaseURL) || 'http://localhost:5001',

  // Production (update when deploying)
  // baseURL: 'https://your-production-api.com',

  headers: {
    'Content-Type': 'application/json',
  },
};
