import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, CreditCard, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items for API
      const orderItems = items.map(item => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        size: item.size,
        total: item.total,
      }));

      // Call API to create order
      await api.orders.create({
        items: orderItems,
        customerName,
        notes: notes || undefined,
      });

      // Clear cart and show success
      clearCart();
      setIsProcessing(false);
      toast.success('Order placed successfully! Check your orders.');
      navigate('/orders');
    } catch (error: any) {
      console.error('Failed to place order:', error);
      setIsProcessing(false);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Customer Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-amber-500' : 'border-gray-300'
                }`}
              >
                {paymentMethod === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                )}
              </div>
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Credit/Debit Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'cash' ? 'border-amber-500' : 'border-gray-300'
                }`}
              >
                {paymentMethod === 'cash' && (
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                )}
              </div>
              <Wallet className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Cash on Pickup</span>
            </button>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {item.product.name} {item.size && `(${item.size})`} x{' '}
                  {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.total)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !customerName.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold text-lg active:scale-95 transition-transform"
          >
            {isProcessing ? 'Processing...' : `Place Order · ${formatPrice(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
