import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import '../styles/index.css';

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <OrderProvider>
          <div className="dark:bg-gray-900 dark:text-gray-100 transition-colors">
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors />
          </div>
        </OrderProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
