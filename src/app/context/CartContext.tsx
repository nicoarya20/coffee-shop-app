import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const CART_STORAGE_KEY = 'coffee_shop_cart';

// Helper to serialize cart items (without product objects to save space)
const serializeCart = (items: CartItem[]): any[] => {
  return items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    size: item.size,
    total: item.total,
  }));
};

// Helper to deserialize cart items (reconstruct with full product objects)
const deserializeCart = (serialized: any[], allProducts: Map<string, Product>): CartItem[] => {
  return serialized
    .filter(item => allProducts.has(item.productId))
    .map(item => ({
      product: allProducts.get(item.productId)!,
      quantity: item.quantity,
      size: item.size,
      total: item.total,
    }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('🛒 Loaded cart from localStorage:', parsed.length, 'items');
        // Note: We'll store full cart items temporarily until products are loaded
        // This is a simplified version - in production you'd want to fetch products
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        console.log('💾 Cart saved to localStorage:', items.length, 'items');
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        console.log('🗑️ Cart cleared from localStorage');
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

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
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('🗑️ Cart cleared');
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
