import apiClient from './client';
import { Sale } from '../types';

interface RegisterSaleResponse extends Sale {
  low_stock: boolean;
}

export const registerSale = async (productId: number, quantity: number): Promise<RegisterSaleResponse> => {
  const response = await apiClient.post<RegisterSaleResponse>('/sales/', { product: productId, quantity });
  return response.data;
};

export const getSales = async (): Promise<Sale[]> => {
  const response = await apiClient.get<Sale[]>('/sales/');
  return response.data;
};
