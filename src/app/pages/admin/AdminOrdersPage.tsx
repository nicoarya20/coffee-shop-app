import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  ChefHat,
  ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  customerName: string;
  notes?: string;
  timestamp: Date;
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const fetchOrders = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.orders.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 5 seconds without showing loading spinner
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.orders.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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
    }
  };

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'pending') return order.status === 'pending';
    if (orderFilter === 'active') return ['preparing', 'ready'].includes(order.status);
    if (orderFilter === 'completed') return order.status === 'completed';
    return true;
  });

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-b-3xl sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Orders Management</h1>
              <p className="text-amber-100 text-sm">Manage all customer orders</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-amber-100">Pending</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-amber-100">Active</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-amber-100">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All', count: orders.length },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'active', label: 'Active', count: stats.active },
            { id: 'completed', label: 'Completed', count: stats.completed },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setOrderFilter(filter.id as any)}
              className={`flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                orderFilter === filter.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-sm'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-1 ${orderFilter === filter.id ? 'text-amber-100' : 'text-gray-400'}`}>
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.timestamp)}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                      <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-100 pt-3 space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.size && `${item.size} · `}Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Total & Actions */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-bold text-amber-600">{formatPrice(order.total)}</span>
                    </div>

                    {/* Status Actions */}
                    {order.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="bg-blue-500 text-white rounded-lg py-2 font-medium text-sm active:scale-95 transition-transform"
                        >
                          Start Preparing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="bg-gray-500 text-white rounded-lg py-2 font-medium text-sm active:scale-95 transition-transform"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full bg-green-500 text-white rounded-lg py-2 font-medium text-sm active:scale-95 transition-transform"
                      >
                        Mark as Ready
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full bg-amber-500 text-white rounded-lg py-2 font-medium text-sm active:scale-95 transition-transform"
                      >
                        Complete Order
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        Order completed
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
