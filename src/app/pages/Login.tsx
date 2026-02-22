import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Mail, Lock, Coffee, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  const { login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login:', { 
        email, 
        activeTab,
        expectedRole: activeTab === 'admin' ? 'ADMIN' : 'USER'
      });

      // Login and get user data
      await login(email, password);

      // Refresh to get latest user data with role
      if (refreshUser) {
        await refreshUser();
      }

      // Get user from localStorage (already updated by refreshUser)
      const savedUser = localStorage.getItem('coffee_shop_user');
      const loggedInUser = savedUser ? JSON.parse(savedUser) : null;

      console.log('✅ Login successful:', {
        email: loggedInUser?.email,
        role: loggedInUser?.role,
        roleInDB: loggedInUser?.role,
        expectedRole: activeTab === 'admin' ? 'ADMIN' : 'USER',
        mismatch: loggedInUser?.role?.toUpperCase() !== (activeTab === 'admin' ? 'ADMIN' : 'USER')
      });

      toast.success(`Welcome, ${loggedInUser?.name || 'User'}!`);

      // Show warning if role doesn't match selected tab
      if (loggedInUser?.role?.toUpperCase() !== (activeTab === 'admin' ? 'ADMIN' : 'USER')) {
        toast.warning(
          `⚠️ Account role (${loggedInUser?.role}) doesn't match selected tab (${activeTab}). Redirecting based on actual role.`,
          { duration: 5000 }
        );
      }

      // Redirect based on user role, not tab selection
      const from = (location.state as any)?.from?.pathname;

      if (loggedInUser?.role?.toUpperCase() === 'ADMIN') {
        navigate('/admin', { replace: true });
        toast.info('Redirecting to Admin Dashboard');
      } else {
        navigate(from || '/', { replace: true });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200"
          >
            <Coffee className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {/* Tab Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'user'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              User
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === 'admin'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-xs text-blue-800 font-medium mb-2">📝 Demo Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex justify-between items-center">
                <span><strong>User:</strong> user@coffee.com</span>
                <span className="text-blue-600 font-mono">userpassword</span>
              </div>
              <div className="flex justify-between items-center">
                <span><strong>Admin:</strong> admin@coffee.com</span>
                <span className="text-blue-600 font-mono">adminpassword</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              ℹ️ Login will redirect based on your account role in database, not the selected tab.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white transition-all ${
                  activeTab === 'admin' 
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                  : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
