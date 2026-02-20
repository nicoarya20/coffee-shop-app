import { Home, Coffee, ShoppingCart, Package, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';

export function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/menu', icon: Coffee, label: 'Menu' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { path: '/orders', icon: Package, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
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
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {badge > 9 ? '9+' : badge}
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
