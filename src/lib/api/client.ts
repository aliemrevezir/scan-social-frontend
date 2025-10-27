if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production');
}

import axios, { AxiosInstance } from 'axios';

// Create axios instance with default config
export const createApiClient = (baseURL?: string): AxiosInstance => {
  const finalBaseUrl = baseURL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!finalBaseUrl) {
    throw new Error('API base URL is required. Set NEXT_PUBLIC_API_URL environment variable.');
  }
  
  return axios.create({
    baseURL: finalBaseUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
