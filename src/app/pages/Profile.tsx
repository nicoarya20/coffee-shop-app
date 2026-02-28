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
  RefreshCw,
  Edit2,
  X,
  Save,
  Lock,
  Filter,
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
  const [lastPointsCount, setLastPointsCount] = useState(0);
  
  // Edit Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Points History Filter
  const [pointsFilter, setPointsFilter] = useState<'all' | 'earned' | 'redeemed'>('all');

  // Debug log user data
  useEffect(() => {
    if (user) {
      console.log('👤 Profile user data:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
      });
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchPointsHistory();
    // Refresh user data on mount (only if user is logged in)
    if (user && refreshUser) {
      refreshUser();
    }
    
    // Poll for points updates every 10 seconds (silent refresh)
    const interval = setInterval(() => {
      fetchPointsHistory(true); // Silent refresh
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user?.id]); // Re-run if user changes

  // Check if points changed and show notification
  useEffect(() => {
    if (user && user.loyaltyPoints !== lastPointsCount && lastPointsCount !== 0) {
      const pointsGained = user.loyaltyPoints - lastPointsCount;
      if (pointsGained > 0) {
        toast.success(`🎉 You earned ${pointsGained} loyalty points!`);
      }
    }
    if (user) {
      setLastPointsCount(user.loyaltyPoints);
    }
  }, [user?.loyaltyPoints]);

  const fetchPointsHistory = async (silent = false) => {
    if (!silent) {
      setLoadingPoints(true);
    }
    try {
      if (!user?.id) {
        console.warn('⚠️ No userId, cannot fetch points history');
        return;
      }
      
      const response = await api.user.getPointsHistory(user.id);
      setPointsHistory(response.data);
      if (!silent) {
        console.log('📊 Points history loaded:', {
          userId: user.id,
          count: response.data.length,
          entries: response.data.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch points history:', error);
    } finally {
      if (!silent) {
        setLoadingPoints(false);
      }
    }
  };

  const handleRefreshPoints = async () => {
    console.log('🔄 Refreshing points data...');
    if (refreshUser) {
      await refreshUser();
    }
    await fetchPointsHistory();
    toast.success('Points data refreshed');
  };

  // Edit Profile handlers
  const handleEditClick = () => {
    if (user) {
      setEditForm({ name: user.name || '', email: user.email, phone: user.phone || '' });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.user.updateProfile({
        userId: user.id,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
      });

      if (response.success) {
        await refreshUser?.();
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', phone: '' });
  };

  // Change Password handlers
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await api.user.changePassword({
        userId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        toast.success('Password changed successfully');
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      if (error.status === 400) {
        toast.error(error.message || 'Current password is incorrect');
      } else {
        console.error('Change password error:', error);
        toast.error('Failed to change password');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', path: '/admin', admin: true }] : []),
    { icon: Lock, label: 'Change Password', onClick: () => setIsChangingPassword(true) },
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

  // Filter points history
  const filteredPointsHistory = pointsHistory.filter(item => {
    if (pointsFilter === 'all') return true;
    return item.type === pointsFilter;
  });

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <p className="text-amber-100 text-sm">{isAdmin ? 'Administrator' : 'Coffee Member'}</p>
                </div>
              </div>
              <button
                onClick={handleEditClick}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Edit profile"
              >
                <Edit2 className="w-5 h-5 text-white" />
              </button>
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={handleCancelPasswordChange}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelPasswordChange}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isSavingPassword}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
            <button
              onClick={handleRefreshPoints}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Refresh points"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Points History
            </h3>
            
            {/* Points Filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'All' },
                { id: 'earned', label: 'Earned' },
                { id: 'redeemed', label: 'Redeemed' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setPointsFilter(filter.id as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    pointsFilter === filter.id
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loadingPoints ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading history...</p>
              </div>
            ) : filteredPointsHistory.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredPointsHistory.slice(0, 10).map((item, index) => (
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
                <p className="text-gray-500 text-sm">
                  {pointsFilter === 'all' 
                    ? 'No points history yet' 
                    : `No ${pointsFilter} points yet`}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {pointsFilter === 'all' 
                    ? 'Complete your first order to earn points!' 
                    : `You haven't ${pointsFilter} any points yet`}
                </p>
              </div>
            )}
            
            {filteredPointsHistory.length > 10 && (
              <div className="px-4 py-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing 10 of {filteredPointsHistory.length} entries
                </p>
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
