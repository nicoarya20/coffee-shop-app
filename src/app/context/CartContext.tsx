import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        const price = size
          ? product.sizes?.find((s) => s.name === size)?.price || product.price
          : product.price;
        updated[existingIndex].total = updated[existingIndex].quantity * price;
        toast.success('Item updated in cart');
        return updated;
      }

      const price = size
        ? product.sizes?.find((s) => s.name === size)?.price || product.price
        : product.price;

      toast.success('Item added to cart');
      return [
        ...prev,
        {
          product,
          quantity,
          size,
          total: price * quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.size === size) {
          const price = size
            ? item.product.sizes?.find((s) => s.name === size)?.price || item.product.price
            : item.product.price;
          return {
            ...item,
            quantity,
            total: price * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
