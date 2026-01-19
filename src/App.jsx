import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/ordenes" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
