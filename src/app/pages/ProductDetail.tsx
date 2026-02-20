import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0]?.name || ''
  );

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentPrice = selectedSize
    ? product.sizes?.find((s) => s.name === selectedSize)?.price || product.price
    : product.price;

  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Product Detail</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square overflow-hidden"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.featured && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <div className="p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Select Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        selectedSize === size.name
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm">{size.name}</div>
                      <div className="text-xs mt-1">
                        {formatPrice(size.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Price</span>
                <span className="text-2xl font-bold text-amber-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleAddToCart}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-lg active:scale-95 transition-transform"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
