import { BASE_URL } from '@env';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import Storage from '../storage';
import { API, API_BASE_URL } from '../constants';
import { showMessage } from '../helper/Toast';
import { store } from '@app/redux';
import { logout } from '../service/AuthService';

const baseURL = API_BASE_URL;

export const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log('BASE_URL', BASE_URL);
let lastLogoutTime = 0;
const LOGOUT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

console.log('inssadahjsdhasiod', instance.getUri())

const refreshToken = async () => {
  const refreshToken = Storage.getItem('refresh-token');
  const { auth } = API;

  if (!refreshToken) {
    return null;
  }

  console.log('Refresh Token ...........');

  try {
    const response = await axios.post(`${baseURL}/${auth.refreshToken}`, {
      refresh_token: refreshToken,
    });

    Storage.setItem('token', response?.data?.data?.token);
    Storage.setItem('refresh-token', response?.data?.data?.refreshToken);

    return response?.data?.data?.token;
  } catch (error: any) {
    const currentTime = Date.now();
    if (currentTime - lastLogoutTime > LOGOUT_COOLDOWN) {
      showMessage('Session token expired!');
      store.dispatch(logout());
      lastLogoutTime = currentTime;
    }
    throw error;
  }
};

instance.interceptors.request.use(async config => {
  const state = await NetInfo.fetch();

  const url = config.url;
  console.log('Request Endpoint:', url); // or `${config.baseURL}${config.url}`
  console.log(`Full url --> ${config.baseURL}/${config.url}`);

  if (!state.isConnected) {
    throw new axios.Cancel(
      'No internet connection. Please connect to the internet.',
    );
  }

  const token = Storage.getItem('token');
  // console.log('token -- ',token);

  if (token && config.headers) {
    config.headers['x-access-token'] = token;
    // config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token and the request hasn't already been retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Refresh the token
        const newToken = await refreshToken();

        // Update the token in the headers
        // instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        // originalRequest.headers.Authorization = `Bearer ${newToken}`;
        instance.defaults.headers.common['x-access-token'] = newToken;
        originalRequest.headers['x-access-token'] = newToken;

        // Retry the original request
        return instance(originalRequest);
      } catch (refreshError) {
        // If the refresh fails, reset the auth state and reject the promise
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
