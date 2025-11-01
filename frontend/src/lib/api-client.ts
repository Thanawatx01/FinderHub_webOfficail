'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { getBackendUrl } from './backend';
import { TOKEN_COOKIE } from './constants';

const apiClient = axios.create({
  baseURL: getBackendUrl(),
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const resolvedBaseUrl = getBackendUrl();
  if (resolvedBaseUrl) {
    config.baseURL = resolvedBaseUrl;
  }

  const token = Cookies.get(TOKEN_COOKIE);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

