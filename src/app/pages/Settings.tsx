import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  Globe,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User,
  Sun,
  ShoppingCart,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    reminders: false,
  });

  const [language, setLanguage] = useState('en');

  const [profile, setProfile] = useState({
    name: 'Coffee Lover',
    email: 'coffee@example.com',
    phone: '+62 812 3456 7890',
  });

  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showClearOrdersConfirm, setShowClearOrdersConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearCartConfirm(false);
    toast.success('Shopping cart cleared');
  };

  const handleClearOrderHistory = async () => {
    if (!user?.id) {
      toast.error('Please login to clear order history');
      return;
    }

    try {
      // Note: This would require a backend endpoint to delete user's orders
      // For now, we'll show a message
      toast.info('Order history clearing requires admin access');
      setShowClearOrdersConfirm(false);
      
      // TODO: Implement backend endpoint for deleting user's order history
      // await api.orders.deleteUserOrders(user.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear order history');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast.error('Please login to delete account');
      return;
    }

    try {
      // Note: This would require a backend endpoint to delete user account
      toast.info('Account deletion requires admin access');
      setShowDeleteAccountConfirm(false);
      
      // TODO: Implement backend endpoint for account deletion
      // await api.user.deleteAccount(user.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-4 pt-6 pb-12 rounded-b-3xl sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/profile" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-4">
        {/* Profile Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Profile Information</h2>
          </div>

          {/* Profile Picture */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-amber-600" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-amber-500 text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Appearance</h2>
          </div>

          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Currently enabled' : 'Easier on the eyes'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: 'orderUpdates',
                label: 'Order Updates',
                description: 'Get notified when your order status changes',
                icon: CreditCard,
              },
              {
                key: 'promotions',
                label: 'Promotions',
                description: 'Receive special offers and discounts',
                icon: Bell,
              },
              {
                key: 'newProducts',
                label: 'New Products',
                description: 'Be the first to know about new menu items',
                icon: User,
              },
              {
                key: 'reminders',
                label: 'Reminders',
                description: 'Daily coffee reminders',
                icon: Smartphone,
              },
            ].map((item) => {
              const Icon = item.icon;
              const enabled = notifications[item.key as keyof typeof notifications];

              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.key as keyof typeof notifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      enabled ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Language & Region */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Language & Region</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
            </select>
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-gray-900">Privacy & Security</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Payment Methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setShowClearOrdersConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Clear Order History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setShowClearCartConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Clear Shopping Cart</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-red-600">Danger Zone</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button
            onClick={() => setShowDeleteAccountConfirm(true)}
            className="w-full bg-red-50 text-red-600 rounded-lg py-3 font-medium hover:bg-red-100 transition-colors"
          >
            Delete Account
          </button>
        </motion.div>

        {/* App Version */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-8"
        >
          <p className="text-sm text-gray-400">Coffee Shop App v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Made with ☕</p>
        </motion.div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Clear Shopping Cart?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will remove all items from your cart. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearCartConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clear Order History Confirmation Modal */}
      {showClearOrdersConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Clear Order History?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will remove all your order history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearOrdersConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearOrderHistory}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Clear History
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Account?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
