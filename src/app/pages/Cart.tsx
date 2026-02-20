import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some delicious items to get started
          </p>
          <Link to="/menu">
            <button className="bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform">
              Browse Menu
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={`${item.product.id}-${item.size}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                {item.size && (
                  <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                )}
                <p className="text-amber-600 font-bold mt-1">
                  {formatPrice(item.total)}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.product.id, item.size)}
                className="text-red-500 p-2 hover:bg-red-50 rounded-lg active:scale-95 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1, item.size)
                }
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1, item.size)
                }
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checkout Section */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
          <Link to="/checkout">
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-4 font-semibold text-lg active:scale-95 transition-transform">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
