import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import { lazy, Suspense, ReactNode } from 'react';
import { BottomNav } from './components/BottomNav';
import { AdminBottomNav } from './components/admin/AdminBottomNav';
import { useAuth } from './context/AuthContext';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BottomNav />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          reason: isAdmin ? 'admin-required' : 'auth-required'
        }} 
        replace 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <AdminBottomNav />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}><Home /></Suspense>
      </Layout>
    ),
  },
  {
    path: '/menu',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}><Menu /></Suspense>
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>
    ),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}><Cart /></Suspense>
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}><Checkout /></Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <Layout>
          <Suspense fallback={<PageLoader />}><Orders /></Suspense>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <Suspense fallback={<PageLoader />}><Profile /></Suspense>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          <Suspense fallback={<PageLoader />}><Settings /></Suspense>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense>
      </AdminLayout>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense>
      </AdminLayout>
    ),
  },
]);
