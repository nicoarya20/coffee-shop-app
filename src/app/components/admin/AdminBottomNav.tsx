import { Home, Package, Coffee } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';

export function AdminBottomNav() {
  const location = useLocation();
  
  // Don't show on product detail page
  if (location.pathname.includes('/product/')) {
    return null;
  }

  const navItems = [
    { path: '/admin', icon: Home, label: 'Overview' },
    { path: '/admin/orders', icon: Package, label: 'Orders' },
    { path: '/admin/products', icon: Coffee, label: 'Products' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-40">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                    active ? 'text-amber-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
