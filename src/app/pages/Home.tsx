import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { Product } from '../types';
import { useState, useEffect } from 'react';

export function Home() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching featured products...');
      const response = await api.products.getFeatured();
      console.log('🌟 Featured products response:', response.data);
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Coffee', icon: '☕', path: '/menu?category=coffee' },
    { name: 'Tea', icon: '🍵', path: '/menu?category=tea' },
    { name: 'Snacks', icon: '🥐', path: '/menu?category=snacks' },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-b-3xl"
      >
        <div className="max-w-md mx-auto">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold mb-2"
          >
            Good Morning! ☀️
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-50 text-sm mb-6"
          >
            Start your day with a perfect cup
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Link to="/menu">
              <input
                type="text"
                placeholder="Search coffee, tea, snacks..."
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-amber-100 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                readOnly
              />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto px-4">
        {/* Categories */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={category.path}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm text-center active:scale-95 transition-transform"
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Featured Products */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Featured</h2>
            </div>
            <Link
              to="/menu"
              className="flex items-center gap-1 text-amber-600 text-sm font-medium"
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">No featured products yet</p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-800 text-xs font-medium mb-2">📝 For Admin:</p>
                <p className="text-amber-700 text-xs">
                  Go to <a href="/admin/products" className="underline font-semibold">Products Management</a> and 
                  click "☆ Feature" on any product to mark it as featured.
                </p>
              </div>
              <Link to="/menu" className="text-amber-600 font-medium text-sm mt-4 inline-block">
                Browse Menu
              </Link>
            </div>
          )}
        </div>

        {/* Promo Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 mb-4"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-xl mb-2">Special Offer! 🎉</h3>
            <p className="text-sm text-white/90 mb-3">
              Get 20% off on all coffee drinks this week
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm active:scale-95 transition-transform">
              Claim Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
