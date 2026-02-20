import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export function Home() {
  const { addToCart } = useCart();
  const featuredProducts = products.filter((p) => p.featured);

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
            <input
              type="text"
              placeholder="Search coffee, tea, snacks..."
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-amber-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
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
          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
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
