import { Home, Coffee, ShoppingCart, Package, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Fetch pending orders count for notification badge
  useEffect(() => {
    if (!user?.id) {
      setPendingOrdersCount(0);
      return;
    }

    const fetchPendingOrders = async () => {
      try {
        const response = await api.orders.getAll({ userId: user.id });
        const pendingCount = response.data.filter(
          o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
        ).length;
        setPendingOrdersCount(pendingCount);
      } catch (error) {
        console.error('Failed to fetch pending orders:', error);
      }
    };

    fetchPendingOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/menu', icon: Coffee, label: 'Menu' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { path: '/orders', icon: Package, label: 'Orders', notification: pendingOrdersCount },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label, badge, notification }) => {
          const isActive = location.pathname === path;
          const showNotification = notification !== undefined && notification > 0;
          
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center flex-1 relative group"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-amber-600' : 'text-gray-400'
                  } group-active:scale-90 transition-all`}
                />
                {/* Cart Badge */}
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {/* Notification Badge for Orders */}
                {showNotification && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold animate-pulse">
                    {notification > 9 ? '9+' : notification}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-amber-600 font-medium' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
