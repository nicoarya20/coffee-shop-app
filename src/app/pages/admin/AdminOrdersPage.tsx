import { motion } from 'motion/react';
import {
  Package,
  Clock,
  CheckCircle,
  ChefHat,
  ArrowLeft,
  DollarSign,
  Search,
  Calendar,
  Filter,
  Download,
  X,
  FileText,
  AlertCircle
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
  
  // Advanced filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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

  // Export orders to CSV
  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Ticket Number', 'Customer', 'Date', 'Status', 'Items', 'Total', 'Notes'];
    
    const csvData = filteredOrders.map(order => {
      const ticketNumber = generateTicketNumber(order);
      const date = formatDate(order.timestamp);
      const items = order.items.map(item => `${item.product.name} (${item.quantity})`).join('; ');
      const notes = order.notes || '';
      
      return [
        order.id,
        ticketNumber,
        order.customerName,
        date,
        order.status.toUpperCase(),
        items,
        order.total.toString(),
        notes,
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
    });
    
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Orders exported successfully');
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
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

  // Generate ticket number from order ID and timestamp
  const generateTicketNumber = (order: Order) => {
    const date = new Date(order.timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const day = date.getDate().toString().padStart(2, '0');
    const shortId = order.id.slice(-6).toUpperCase();
    return `ORD-${year}${month}${day}-${shortId}`;
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
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (orderFilter === 'pending') return order.status === 'pending';
    if (orderFilter === 'active') return ['preparing', 'ready'].includes(order.status);
    if (orderFilter === 'completed') return order.status === 'completed';
    if (orderFilter === 'cancelled') return order.status === 'cancelled';
    
    // Search by order ID or ticket number
    if (searchQuery) {
      const ticketNumber = generateTicketNumber(order).toLowerCase();
      const orderId = order.id.toLowerCase();
      if (!ticketNumber.includes(searchQuery.toLowerCase()) && !orderId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by customer name
    if (customerNameFilter) {
      if (!order.customerName.toLowerCase().includes(customerNameFilter.toLowerCase())) {
        return false;
      }
    }
    
    // Date range filter
    if (dateRangeFilter !== 'all') {
      const orderDate = new Date(order.timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateRangeFilter === 'today') {
        if (orderDate < today) return false;
      } else if (dateRangeFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (dateRangeFilter === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < monthAgo) return false;
      }
    }
    
    return true;
  });

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['preparing', 'ready'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    // Revenue hanya dari completed orders (BUKAN cancelled)
    revenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <p className="text-amber-100 text-sm">Manage all customer orders</p>
              </div>
            </div>
            <button
              onClick={exportOrdersToCSV}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Export to CSV"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-amber-100" />
                <p className="text-xs text-amber-100">Pending</p>
              </div>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-amber-100" />
                <p className="text-xs text-amber-100">Revenue</p>
              </div>
              <p className="text-lg font-bold">{formatPrice(stats.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || customerNameFilter || dateRangeFilter !== 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </div>
            
            {/* Customer Name Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Search by customer name..."
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                <Calendar className="w-3 h-3 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setDateRangeFilter(range.id as any)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      dateRangeFilter === range.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(customerNameFilter || dateRangeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCustomerNameFilter('');
                  setDateRangeFilter('all');
                }}
                className="w-full py-2 text-sm text-amber-600 font-medium hover:bg-amber-50 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All', count: orders.length },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'active', label: 'Active', count: stats.active },
            { id: 'completed', label: 'Completed', count: stats.completed },
            { id: 'cancelled', label: 'Cancelled', count: stats.cancelled },
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
            filteredOrders.map((order, index) => {
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
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">
                          {generateTicketNumber(order)}
                        </p>
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(order.timestamp)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.customerName}</p>
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
                    <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-amber-700 mb-1">Customer Notes:</p>
                          <p className="text-sm text-amber-900">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="w-full mb-3 flex items-center justify-center gap-2 py-2 text-sm text-amber-600 font-medium hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Details
                  </button>

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
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="bg-red-500 text-white rounded-lg py-2 font-medium text-sm active:scale-95 transition-transform"
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

                    {order.status === 'cancelled' && (
                      <div className="text-center py-2 text-sm text-red-500 font-medium">
                        Order cancelled
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ticket Number</span>
                <span className="font-bold text-gray-900">{generateTicketNumber(selectedOrder)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="font-mono text-xs text-gray-600">{selectedOrder.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer</span>
                <span className="font-medium text-gray-900">{selectedOrder.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date & Time</span>
                <span className="text-sm text-gray-900">{formatDate(selectedOrder.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusInfo(selectedOrder.status).bg} ${getStatusInfo(selectedOrder.status).color}`}>
                  {getStatusInfo(selectedOrder.status).text}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.size && `${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Notes */}
            {selectedOrder.notes && (
              <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                <p className="text-xs font-bold text-amber-700 mb-1">Customer Notes:</p>
                <p className="text-sm text-amber-900">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-lg font-medium text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-amber-600">{formatPrice(selectedOrder.total)}</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  // Print functionality
                  window.print();
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
