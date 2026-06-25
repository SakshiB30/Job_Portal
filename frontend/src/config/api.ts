// Centralized API base URL configuration
// Use Vite env var: VITE_API_BASE_URL
// Example: VITE_API_BASE_URL=http://localhost:8080

const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

if (!baseUrl) {
  // Helps catch missing env configuration during dev/build
   
  console.warn('VITE_API_BASE_URL is not set. Falling back to http://localhost:8080');
}

export const API_BASE_URL = baseUrl ?? 'https://job-portal-backend-tjmf.onrender.com';

