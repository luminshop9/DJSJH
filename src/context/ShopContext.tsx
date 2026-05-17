import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, Expense } from '@/src/types.ts';

interface ShopContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  loading: boolean;
  recordSale: (items: any[], clientId?: string) => Promise<void>;
  updateStock: (productId: string, delta: number) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Taza Mágica", sku: "TM-001", stock: 25, cost: 8, price: 18, category: "Magic Mug", createdAt: new Date().toISOString() },
  { id: "2", name: "Taza Blanca Premium", sku: "TB-001", stock: 4, cost: 4, price: 12, category: "White Mug", createdAt: new Date().toISOString() },
  { id: "3", name: "Polo Oversize Negro", sku: "PO-102", stock: 15, cost: 15, price: 35, category: "Polo", createdAt: new Date().toISOString() },
  { id: "4", name: "Gorra Snapback", sku: "GC-201", stock: 10, cost: 10, price: 25, category: "Accessories", createdAt: new Date().toISOString() }
];

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lumin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('lumin_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('lumin_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('lumin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lumin_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('lumin_expenses', JSON.stringify(expenses));
  }, [expenses]);
  
  const recordSale = async (items: any[], clientId?: string) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const profit = items.reduce((acc, item) => acc + ((item.price - item.cost) * item.quantity), 0);
    
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      items,
      total: subtotal,
      profit: profit,
      clientId: clientId || 'Mostrador',
      createdAt: new Date().toISOString()
    };

    setSales(prev => [newSale, ...prev]);
    
    // Update Stock
    setProducts(prev => prev.map(p => {
      const saleItem = items.find(item => item.productId === p.id || item.name === p.name);
      if (saleItem) {
        return { ...p, stock: p.stock - saleItem.quantity };
      }
      return p;
    }));
  };

  const updateStock = async (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: p.stock + delta } : p
    ));
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  return (
    <ShopContext.Provider value={{ products, sales, expenses, loading, recordSale, updateStock, addProduct }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
