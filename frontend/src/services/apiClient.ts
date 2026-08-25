import axios from 'axios';

const apiClient = axios.create({
  // Pulled from Docker build arguments / local .env
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

console.log('API Client Config:', {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Prefix to specify which backend we target through the API gateway
const targetBackendPrefix = "/api/csharp/"
//const targetBackendPrefix = "/api/node/"
//const targetBackendPrefix = "/api/java/"

export { apiClient, targetBackendPrefix };