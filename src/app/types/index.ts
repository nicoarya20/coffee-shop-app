export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'snacks';
  featured?: boolean;
  sizes?: Array<{ name: string; price: number }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  total: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: Date;
  customerName: string;
  notes?: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}
