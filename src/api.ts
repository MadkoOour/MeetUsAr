import axios from 'axios';
import { getToken } from './utils/auth';

const api = axios.create({
  baseURL: 'https://api-yeshtery.dev.meetusvr.com/v1',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;