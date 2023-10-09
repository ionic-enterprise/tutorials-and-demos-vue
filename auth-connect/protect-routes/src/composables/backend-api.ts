import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthentication } from './authentication';
import { useSession } from './session';
import router from '@/router';

const baseURL = 'https://cs-demo-api.herokuapp.com';

const client = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { getAccessToken } = useAuthentication();
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      const { clearSession } = useSession();
      clearSession().then(() => router.replace('/tabs/tab1'));
    }
    return Promise.reject(error);
  },
);

export const useBackendAPI = () => {
  return {
    client,
  };
};
