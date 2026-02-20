import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, CartItem } from '../types';

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], customerName: string, notes?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (items: CartItem[], customerName: string, notes?: string) => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      total,
      status: 'pending',
      timestamp: new Date(),
      customerName,
      notes,
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
