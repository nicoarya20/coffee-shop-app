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

// Helper to wrap lazy components with Suspense
function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback: ReactNode = <PageLoader />
) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
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
        {withSuspense(Home)()}
      </Layout>
    ),
  },
  {
    path: '/menu',
    element: (
      <Layout>
        {withSuspense(Menu)()}
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: withSuspense(ProductDetail)(),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        {withSuspense(Cart)()}
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: (
      <ProtectedRoute>
        {withSuspense(Checkout)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <Layout>
          {withSuspense(Orders)()}
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          {withSuspense(Profile)()}
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout>
          {withSuspense(Settings)()}
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminLayout>
        {withSuspense(AdminDashboard)()}
      </AdminLayout>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <AdminLayout>
        {withSuspense(AdminOrdersPage)()}
      </AdminLayout>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <AdminLayout>
        {withSuspense(AdminProductsPage)()}
      </AdminLayout>
    ),
  },
]);
