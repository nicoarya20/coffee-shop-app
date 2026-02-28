import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useOfflineDetection } from './hooks/useOfflineDetection';
import '../styles/index.css';

// Wrapper component to use hooks inside ErrorBoundary
function AppContent() {
  // Initialize offline detection
  useOfflineDetection();

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <AppContent />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
