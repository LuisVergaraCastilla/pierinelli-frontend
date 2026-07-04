import apiClient from './client';
import { Product } from '../types';

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/products/');
  return response.data;
};

const createFormData = (product: Partial<Product>, imageUri: string | null) => {
  const formData = new FormData();

  Object.keys(product).forEach(key => {
    if (product[key] !== null && product[key] !== undefined) {
      formData.append(key, product[key]);
    }
  });

  if (imageUri) {
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    formData.append('image', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);
  }

  return formData;
};

export const createProduct = async (product: Partial<Product>, imageUri: string | null): Promise<Product> => {
  const formData = createFormData(product, imageUri);
  const response = await apiClient.post<Product>('/products/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>, imageUri: string | null): Promise<Product> => {
  const formData = createFormData(product, imageUri);
  const response = await apiClient.put<Product>(`/products/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}/`);
};
