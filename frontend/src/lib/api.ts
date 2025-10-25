import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize auth header from cookie if exists
const token = getCookie('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('token');
      delete api.defaults.headers.common['Authorization'];
      
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  setCookie('token', token, {
    maxAge: 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  });
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};