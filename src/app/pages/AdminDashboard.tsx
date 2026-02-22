import { motion } from 'motion/react';
import {
  Package,
  Clock,
  Bell,
  TrendingUp,
  Coffee,
  DollarSign,
  ArrowRight,
  ChefHat,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../api/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName: string;
  notes?: string;
  timestamp: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'snacks';
  featured?: boolean;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);

  // Fetch data
  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        api.orders.getAll(),
        api.products.getAll(),
      ]);

      setPreviousOrderCount(prevCount => {
        const newOrdersCount = ordersRes.data.length - prevCount;
        if (newOrdersCount > 0 && prevCount > 0) {
          toast.success(`🔔 ${newOrdersCount} new order(s) received!`, {
            duration: 5000,
          });
        }
        return ordersRes.data.length;
      });

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    activeOrders: orders.filter(o => ['preparing', 'ready'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
    totalProducts: products.length,
  };

  const pendingOrderCount = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'preparing':
        return { icon: ChefHat, text: 'Preparing', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'ready':
        return { icon: Package, text: 'Ready', color: 'text-green-600', bg: 'bg-green-100' };
      case 'completed':
        return { icon: CheckCircle, text: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'cancelled':
        return { icon: Clock, text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Clock, text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-b-3xl sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-amber-100 text-sm">Manage your coffee shop</p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {pendingOrderCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {pendingOrderCount}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats - Clickable to Orders Page */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/orders" className="block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-100 mb-1">Pending Orders</p>
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="w-6 h-6 text-amber-100" />
                </div>
              </div>
            </Link>
            <Link to="/admin/orders" className="block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-100 mb-1">Revenue</p>
                    <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-6 h-6 text-amber-100" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Overview Only */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Orders Card */}
          <Link
            to="/admin/orders"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Orders Management</h3>
                <p className="text-sm text-gray-600">Process customer orders</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-medium">
                ⏰ {stats.pendingOrders} Pending
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                👨‍🍳 {stats.activeOrders} Active
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                ✅ {stats.completedOrders} Completed
              </span>
            </div>
          </Link>

          {/* Products Card */}
          <Link
            to="/admin/products"
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Products Management</h3>
                <p className="text-sm text-gray-600">Manage menu & pricing</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                ☕ {stats.totalProducts} Products
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium">
                ⭐ {products.filter(p => p.featured).length} Featured
              </span>
            </div>
          </Link>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
            </div>
            <Link
              to="/admin/orders"
              className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} items · {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                      <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Coffee className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Total Products</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
