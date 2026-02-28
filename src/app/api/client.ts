import type { ApiResponse, ProductsQueryParams, CreateOrderInput, UpdateOrderStatusInput } from './types';
import type { Product, Order, User } from '../types';

// API Base URL configuration
// Priority: 1) VITE_API_URL env var, 2) /api proxy (for localhost), 3) direct IP fallback
const getApiBaseUrl = (): string => {
  // Check if running on network (not localhost)
  const isNetworkAccess = !window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/);

  // For Vercel/production, check if VITE_API_URL is defined
  // @ts-ignore - Vite injects import.meta.env at build time
  const viteApiUrl = import.meta.env?.VITE_API_URL;

  if (viteApiUrl) {
    return viteApiUrl;
  }

  // For network access without env var, use direct IP
  if (isNetworkAccess) {
    // Get the server IP from current hostname
    const serverIp = window.location.hostname;
    return `http://${serverIp}:3001/api`;
  }

  // For localhost development, use proxy
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔌 API Base URL:', API_BASE_URL);

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Something went wrong');
  }
  return response.json();
}

export const api = {
  // Products API
  products: {
    getAll: async (params?: ProductsQueryParams): Promise<ApiResponse<Product[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.featured) searchParams.set('featured', 'true');
      if (params?.search) searchParams.set('search', params.search);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
      return handleResponse<Product[]>(response);
    },

    getById: async (id: string): Promise<ApiResponse<Product>> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return handleResponse<Product>(response);
    },

    getFeatured: async (): Promise<ApiResponse<Product[]>> => {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      return handleResponse<Product[]>(response);
    },

    getByCategory: async (category: 'coffee' | 'tea' | 'snacks'): Promise<ApiResponse<Product[]>> => {
      const response = await fetch(`${API_BASE_URL}/products?category=${category}`);
      return handleResponse<Product[]>(response);
    },

    search: async (query: string): Promise<ApiResponse<Product[]>> => {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      return handleResponse<Product[]>(response);
    },

    create: async (data: any): Promise<ApiResponse<Product>> => {
      // Check if data is FormData (for file upload)
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        const file = data.get('image') as File;
        if (file) {
          console.log('📤 Uploading product with file:', {
            name: file.name,
            type: file.type,
            size: file.size,
          });
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      return handleResponse<Product>(response);
    },

    update: async (id: string, data: any): Promise<ApiResponse<Product>> => {
      // Check if data is FormData (for file upload)
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        const file = data.get('image') as File;
        if (file) {
          console.log('📤 Updating product with file:', {
            name: file.name,
            type: file.type,
            size: file.size,
          });
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });
      return handleResponse<Product>(response);
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    },
  },

  // Orders API
  orders: {
    getAll: async (params?: { userId?: string; status?: string }): Promise<ApiResponse<Order[]>> => {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.status) searchParams.set('status', params.status);
      
      const queryString = searchParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/orders?${queryString}`
        : `${API_BASE_URL}/orders`;
      
      console.log('📡 Fetching orders from:', url);
      
      const response = await fetch(url);
      return handleResponse<Order[]>(response);
    },

    getById: async (id: string): Promise<ApiResponse<Order>> => {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`);
      return handleResponse<Order>(response);
    },

    create: async (input: CreateOrderInput): Promise<ApiResponse<Order>> => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return handleResponse<Order>(response);
    },

    updateStatus: async (id: string, status: UpdateOrderStatusInput['status']): Promise<ApiResponse<Order>> => {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return handleResponse<Order>(response);
    },
  },

  // User API
  user: {
    getProfile: async (userId?: string): Promise<ApiResponse<User>> => {
      const searchParams = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${API_BASE_URL}/user/profile${searchParams}`);
      return handleResponse<User>(response);
    },

    getPointsHistory: async (userId?: string): Promise<ApiResponse<any[]>> => {
      const searchParams = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${API_BASE_URL}/user/points-history${searchParams}`);
      return handleResponse<any[]>(response);
    },

    updateProfile: async (data: Partial<User> & { userId?: string }): Promise<ApiResponse<User>> => {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(response);
    },

    changePassword: async (data: { userId: string; currentPassword: string; newPassword: string }): Promise<ApiResponse<User>> => {
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(response);
    },
  },

  // Auth API
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<User>> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<User>(response);
    },

    register: async (data: any): Promise<ApiResponse<User>> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(response);
    },
  },
};

export { ApiError };
