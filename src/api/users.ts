import apiClient from './client';
import { User } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users/');
  return response.data;
};

export const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await apiClient.get<User>('/users/me/', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getUser = async (id: number | string, accessToken: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await apiClient.post<User>('/users/', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}/`);
};
