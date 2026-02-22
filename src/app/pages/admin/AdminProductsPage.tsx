import { motion } from 'motion/react';
import { 
  Coffee, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  ArrowLeft,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client';
import { toast } from 'sonner';
import { AdminProductModal } from '../../components/admin/AdminProductModal';

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

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'coffee' | 'tea' | 'snacks'>('all');

  const fetchProducts = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.products.getAll();
      console.log('📥 Fetched products:', response.data);
      response.data.forEach(product => {
        console.log(`  - ${product.name}: image URL =`, product.image);
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.products.delete(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      console.log('⭐ Toggling featured for:', product.name, 'to', !product.featured);
      await api.products.update(product.id, {
        featured: !product.featured,
      });
      toast.success('Product updated');
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to toggle featured:', error);
      if (error.status === 404) {
        toast.error('Server not found. Make sure the server is running (npm run server)');
      } else if (error.status === 400) {
        toast.error('Invalid request. Please try again.');
      } else {
        toast.error('Failed to update product');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    coffee: products.filter(p => p.category === 'coffee').length,
    tea: products.filter(p => p.category === 'tea').length,
    snacks: products.filter(p => p.category === 'snacks').length,
    featured: products.filter(p => p.featured).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
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
              <h1 className="text-2xl font-bold">Products Management</h1>
              <p className="text-amber-100 text-sm">Manage your menu items</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-amber-100">Total</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{stats.coffee}</p>
              <p className="text-xs text-amber-100">Coffee</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{stats.tea}</p>
              <p className="text-xs text-amber-100">Tea</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
              <p className="text-lg font-bold">{stats.snacks}</p>
              <p className="text-xs text-amber-100">Snacks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
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

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'coffee', label: 'Coffee', count: stats.coffee },
            { id: 'tea', label: 'Tea', count: stats.tea },
            { id: 'snacks', label: 'Snacks', count: stats.snacks },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setCategoryFilter(filter.id as any)}
              className={`flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === filter.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-sm'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-1 ${categoryFilter === filter.id ? 'text-amber-100' : 'text-gray-400'}`}>
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="relative mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 rounded-lg object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    // Skip if already using placeholder
                    if (img.src.includes('placehold.co')) return;
                    
                    console.error('❌ Failed to load image:', product.image);
                    img.src = 'https://placehold.co/400x300/f59e0b/ffffff?text=No+Image';
                  }}
                />
                {product.featured && (
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-400/50">
                    <Star className="w-3 h-3 fill-current animate-pulse" />
                    Featured
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-600 font-bold text-sm">{formatPrice(product.price)}</span>
                {product.sizes && product.sizes.length > 0 && (
                  <span className="text-xs text-gray-400">{product.sizes.length} sizes</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 border-t border-gray-100 pt-2">
                <button
                  onClick={() => handleToggleFeatured(product)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                    product.featured
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg shadow-yellow-400/50 scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className={product.featured ? 'animate-pulse' : ''}>
                    {product.featured ? '★' : '☆'}
                  </span>
                  {product.featured ? 'Featured' : 'Feature'}
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <button
              onClick={handleAddProduct}
              className="mt-4 text-amber-600 font-medium text-sm"
            >
              Add your first product
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSave={() => {
            fetchProducts();
            setShowProductModal(false);
            toast.success(editingProduct ? 'Product updated' : 'Product created');
          }}
        />
      )}
    </div>
  );
}
