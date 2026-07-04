import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitSessionExpired } from '../utils/authEvents';

const getHostFromDebuggerHost = (debuggerHost?: string): string | null => {
  if (!debuggerHost) return null;
  const [host] = debuggerHost.split(':');
  return host || null;
};

const getApiHost = (): string => {
  const debuggerHost =
    Constants.manifest?.debuggerHost ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.expoConfig as any)?.extra?.debuggerHost ||
    (Constants.expoConfig as any)?.debuggerHost;

  const expoApiHost =
    (Constants.expoConfig as any)?.extra?.apiHost ||
    (Constants.manifest as any)?.extra?.apiHost;
  if (expoApiHost) {
    return expoApiHost;
  }

  const hostFromDebugger = getHostFromDebuggerHost(debuggerHost);
  if (hostFromDebugger) {
    return hostFromDebugger;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
};

const apiClient = axios.create({
  baseURL: `http://${getApiHost()}:8000/api`,
  timeout: 10000,
});

// Simple request/response logging for debugging requests from the app
apiClient.interceptors.request.use((config) => {
  try {
    console.log('[api] Request:', config.method, config.url, config.data || '');
  } catch (e) {
    // ignore
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    try {
      console.log('[api] Response:', response.status, response.config.url, response.data);
    } catch (e) {}
    return response;
  },
  async (error) => {
    try {
      if (error.response) {
        console.log('[api] Error response:', error.response.status, error.response.config.url, error.response.data);

        const isAuthExpired =
          error.response.status === 401 &&
          (error.response.data?.code === 'token_not_valid' ||
            error.response.data?.detail?.toLowerCase?.().includes('token is expired') ||
            error.response.data?.detail?.toLowerCase?.().includes('given token not valid'));

        if (isAuthExpired) {
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('user');
          emitSessionExpired();
        }
      } else if (error.request) {
        console.log('[api] No response received for', error.config?.url || 'unknown url');
      } else {
        console.log('[api] Request setup error', error.message);
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
