import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-amber-600 font-bold">
              {formatPrice(product.price)}
            </span>
          </div>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
          className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 font-medium active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
