import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import CategoryPage from './features/products/pages/CategoryPage';
import ProductsPage from './features/products/pages/ProductsPage';
import ProductDetailPage from './features/products/pages/ProductDetailPage';
import CartPage from './features/cart/pages/CartPage';
import ProfilePage from './features/user/pages/ProfilePage';
import OrdersPage from './features/orders/pages/OrdersPage';
import OrderDetailPage from './features/orders/pages/OrderDetailPage';
import CheckoutPage from './features/checkout/pages/CheckoutPage';
import PaymentSuccessPage from './features/orders/pages/PaymentSuccessPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/ordenes" element={<OrdersPage />} />
        <Route path="/orden/:orderId" element={<OrderDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
      </Routes>
    </Router>
  );
}

export default App;
