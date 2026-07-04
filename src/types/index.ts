export type UserRole = "admin" | "worker";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  height: number;
  width: number;
  area: number;
  price: number;
  stock: number;
  image: string | null;
}

export interface Sale {
  id: number;
  product: Product;
  worker: User;
  quantity: number;
  unit_price: number;
  total_price: number;
  sold_at: string;
}
