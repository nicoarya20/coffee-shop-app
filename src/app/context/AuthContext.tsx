import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage on mount
    const savedUser = localStorage.getItem('coffee_shop_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Validate user session by refreshing data
        // This will auto-logout if user no longer exists in database
        refreshUser();
      } catch (error) {
        console.error('Invalid user data in localStorage, clearing...');
        localStorage.removeItem('coffee_shop_user');
      }
    }
    setLoading(false);
  }, []);

  const refreshUser = async () => {
    try {
      // Get userId from localStorage
      const savedUser = localStorage.getItem('coffee_shop_user');
      const userId = savedUser ? JSON.parse(savedUser).id : null;

      if (!userId) {
        console.warn('⚠️ No userId found, cannot refresh');
        return;
      }

      const response = await api.user.getProfile(userId);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('coffee_shop_user', JSON.stringify(response.data));
        console.log('🔄 User refreshed:', {
          id: response.data.id,
          name: response.data.name,
          role: response.data.role,
          loyaltyPoints: response.data.loyaltyPoints
        });
      } else {
        // User not found in database - auto logout
        console.warn('⚠️ User session invalid, auto-logout');
        logout();
      }
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      
      // Auto-logout on 404 (user not found) or 401 (unauthorized)
      if (error.status === 404 || error.status === 401) {
        console.warn('⚠️ Session expired or user not found, auto-logout');
        logout();
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('coffee_shop_user', JSON.stringify(response.data));
        console.log('🔐 Login successful:', {
          email: response.data.email,
          role: response.data.role,
          name: response.data.name,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.auth.register(data);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('coffee_shop_user', JSON.stringify(response.data));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coffee_shop_user');
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
