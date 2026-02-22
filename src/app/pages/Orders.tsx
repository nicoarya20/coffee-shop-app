import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, ChefHat } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { toast } from 'sonner';
import { Order } from '../types';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersRef = useRef<Order[]>([]);

  const fetchOrders = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.orders.getAll();
      
      // Check for status updates on existing orders
      if (!isSilent && previousOrdersRef.current.length > 0) {
        response.data.forEach(newOrder => {
          const oldOrder = previousOrdersRef.current.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            toast.success(`📦 Order status updated: ${newOrder.status.toUpperCase()}`);
          }
        });
      }

      previousOrdersRef.current = response.data;
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for order updates every 5 seconds
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Invalid date';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
        };
      case 'preparing':
        return {
          icon: ChefHat,
          text: 'Preparing',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
        };
      case 'ready':
        return {
          icon: Package,
          text: 'Ready for Pickup',
          color: 'text-green-600',
          bg: 'bg-green-100',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500">Your order history will appear here</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {orders.map((order, index) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(order.timestamp)}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusInfo.bg}`}
                >
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.size && `${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              {/* Order Total */}
              <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-amber-600">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Action Button */}
              {order.status === 'ready' && (
                <button className="w-full mt-3 bg-amber-500 text-white rounded-lg py-2 font-medium active:scale-95 transition-transform">
                  Ready to Pick Up
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
