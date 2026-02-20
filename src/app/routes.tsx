import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { BottomNav } from './components/BottomNav';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BottomNav />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: '/menu',
    element: (
      <Layout>
        <Menu />
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <Cart />
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/orders',
    element: (
      <Layout>
        <Orders />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <Profile />
      </Layout>
    ),
  },
]);
