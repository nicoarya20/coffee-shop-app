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
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

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
          <div className="flex items-center justify-between">
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
            <button className="text-amber-600 font-medium text-sm">
              Redeem
            </button>
          </div>
        </motion.div>

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
