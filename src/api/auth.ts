import apiClient from './client';
import { User } from '../types';

interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

const base64UrlDecode = (input: string): string => {
  const str = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);

  const bufferConstructor = (globalThis as any).Buffer;
  if (bufferConstructor) {
    return bufferConstructor.from(padded, 'base64').toString('utf8');
  }

  if (typeof atob === 'function') {
    let binary = atob(padded);
    let result = '';
    for (let i = 0; i < binary.length; i += 1) {
      result += String.fromCharCode(binary.charCodeAt(i));
    }
    return result;
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < padded.length; i += 1) {
    const value = chars.indexOf(padded.charAt(i));
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

const decodeJwtPayload = (token: string): any => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }

  return JSON.parse(base64UrlDecode(parts[1]));
};

export const login = async (email: string, password: string): Promise<{ user: User; access: string }> => {
  const response = await apiClient.post<LoginResponse>('/auth/login/', { email, password });
  const access = response.data.access;

  console.log('[auth] login response data', response.data);

  if (response.data.user) {
    console.log('[auth] login response already contains user');
    return {
      user: response.data.user,
      access,
    };
  }

  const payload = decodeJwtPayload(access);
  console.log('[auth] decoded JWT payload', payload);

  const userId = payload.user_id || payload.userId || payload.id;
  if (!userId) {
    throw new Error('Unable to determine user ID from JWT token');
  }

  console.log('[auth] fetching user with id', userId);

  try {
    const user = await apiClient.get<User>(`/users/${userId}/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    console.log('[auth] fetched user', user.data);

    return {
      user: user.data,
      access,
    };
  } catch (error: any) {
    console.warn('[auth] unable to fetch full user profile, using fallback user payload', error?.response?.status);

    const fallbackUser: User = {
      id: Number(userId),
      first_name: '',
      last_name: '',
      email: '',
      role: 'worker',
    };

    return {
      user: fallbackUser,
      access,
    };
  }
};
