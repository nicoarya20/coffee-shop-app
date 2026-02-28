export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProductsQueryParams {
  category?: 'coffee' | 'tea' | 'snacks';
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateOrderInput {
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      category: string;
    };
    quantity: number;
    size?: string;
    total: number;
  }>;
  customerName: string;
  notes?: string;
  userId?: string;
}

export interface UpdateOrderStatusInput {
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}
