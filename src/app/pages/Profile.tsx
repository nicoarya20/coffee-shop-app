import { motion } from 'motion/react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Award,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  TrendingUp,
  Coffee,
  Gift,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface PointsHistory {
  id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  createdAt: string;
}

export function Profile() {
  const { user, logout, isAdmin, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    fetchPointsHistory();
    // Refresh points data when component mounts
    if (refreshUser) {
      refreshUser();
    }
  }, []);

  const fetchPointsHistory = async () => {
    try {
      setLoadingPoints(true);
      const response = await api.user.getPointsHistory();
      setPointsHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch points history:', error);
    } finally {
      setLoadingPoints(false);
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin', admin: true }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    { icon: LogOut, label: 'Logout', onClick: handleLogout, danger: true },
  ];

  // Calculate points statistics
  const earnedPoints = pointsHistory
    .filter(h => h.type === 'earned')
    .reduce((sum, h) => sum + h.points, 0);
  
  const redeemedPoints = pointsHistory
    .filter(h => h.type === 'redeemed')
    .reduce((sum, h) => sum + Math.abs(h.points), 0);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-4 pt-8 pb-20 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>

          {/* User Info Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-amber-100 text-sm">{isAdmin ? 'Administrator' : 'Coffee Member'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/90">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-white/90">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loyalty Points */}
      <div className="max-w-md mx-auto px-4 -mt-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.loyaltyPoints}
                </p>
              </div>
            </div>
          </div>

          {/* Points Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Earned</span>
              </div>
              <p className="text-lg font-bold text-green-600">+{earnedPoints}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gift className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">Redeemed</span>
              </div>
              <p className="text-lg font-bold text-purple-600">-{redeemedPoints}</p>
            </div>
          </div>

          {/* How to earn points */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-2">💰 How to earn points:</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• 1 Point for every Rp 1,000 spent</li>
              <li>• ☕ 2x Points for Coffee purchases!</li>
              <li>• Points awarded when order is completed</li>
            </ul>
          </div>
        </motion.div>

        {/* Points History */}
        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Points History
          </h3>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loadingPoints ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading history...</p>
              </div>
            ) : pointsHistory.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pointsHistory.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.type === 'earned' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {item.type === 'earned' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <Gift className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      item.type === 'earned' ? 'text-green-600' : 'text-purple-600'
                    }`}>
                      {item.type === 'earned' ? '+' : '-'}{Math.abs(item.points)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No points history yet</p>
                <p className="text-gray-400 text-xs mt-1">Complete your first order to earn points!</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors cursor-pointer ${
                  item.danger ? 'text-red-500' : (item as any).admin ? 'text-purple-600' : 'text-gray-900'
                }`}
                onClick={item.onClick}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {(item as any).admin && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            );

            return (item as any).path ? (
              <Link key={item.label} to={(item as any).path}>
                {content}
              </Link>
            ) : (
              <div key={item.label}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
