export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  cost: number;
  price: number;
  category: 'Magic Mug' | 'White Mug' | 'Polo' | 'Personalized' | 'Accessories';
  imageUrl?: string;
  supplier?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  profit: number;
  clientId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}
