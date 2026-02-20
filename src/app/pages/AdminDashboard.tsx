import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Bell,
  TrendingUp,
  Coffee,
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'sonner';
import { AdminProductModal } from '../components/admin/AdminProductModal';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  customerName: string;
  notes?: string;
  timestamp: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'snacks';
  featured?: boolean;
  sizes?: Array<{ name: string; price: number }>;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'active'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [previousOrderCount, setPreviousOrderCount] = useState(0);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        api.orders.getAll(),
        api.products.getAll(),
      ]);

      // Check for new orders
      const newOrdersCount = ordersRes.data.length - previousOrderCount;
      if (newOrdersCount > 0 && previousOrderCount > 0) {
        // New order notification
        toast.success(`🔔 ${newOrdersCount} new order(s) received!`, {
          duration: 5000,
        });

        // Play notification sound (optional)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
      }

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setPreviousOrderCount(ordersRes.data.length);
    } catch (error) {
      // Silent fail - don't show error toast for empty data or network issues during polling
      // This prevents annoying notifications when admin panel is open but no active orders
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await api.orders.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.products.delete(productId);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  // Stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    activeOrders: orders.filter(o => ['preparing', 'ready'].includes(o.status)).length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalProducts: products.length,
  };

  const pendingOrderCount = orders.filter(o => o.status === 'pending').length;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'pending') return order.status === 'pending';
    if (orderFilter === 'active') return ['preparing', 'ready'].includes(order.status);
    return true;
  });

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.includes(searchQuery.toLowerCase())
  );

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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-100" />
                <span className="text-xs text-amber-100">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-100" />
                <span className="text-xs text-amber-100">Revenue</span>
              </div>
              <p className="text-lg font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'orders', label: 'Orders', icon: Package, badge: pendingOrderCount },
            { id: 'products', label: 'Products', icon: Coffee },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Orders</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Active Orders</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Products</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-amber-600 text-sm font-medium"
                >
                  See all
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items · {formatPrice(order.total)}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                        <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'pending', label: 'Pending', count: stats.pendingOrders },
                { id: 'active', label: 'Active', count: stats.activeOrders },
                { id: 'all', label: 'All', count: stats.totalOrders },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOrderFilter(filter.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    orderFilter === filter.id
                      ? 'bg-amber-500 text-white'
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
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
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
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Search & Add */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={handleAddProduct}
                className="bg-amber-500 text-white rounded-lg px-4 py-2 active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 rounded-lg object-cover mb-2"
                    />
                    {product.featured && (
                      <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-bold text-sm">{formatPrice(product.price)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={() => {
            fetchData();
            setShowProductModal(false);
          }}
        />
      )}
    </div>
  );
}
