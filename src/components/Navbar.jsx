import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken, categoryAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import CartDropdown from './CartDropdown';
import ProfileDropdown from './ProfileDropdown';

function Navbar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const [token, setToken] = useState(() => getAuthToken());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  useEffect(() => {
    const checkToken = () => {
      const currentToken = getAuthToken();
      setToken(currentToken);
    };

    checkToken();
    const interval = setInterval(checkToken, 1000);
    
    loadCategories();
    
    return () => clearInterval(interval);
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]); // Asegurar que siempre sea un array
    }
  };

  // Extract user email from token (simple implementation)
  const getUserEmail = () => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full" style={{ padding: '0 var(--spacing-md)' }}>
        <div className="flex items-center justify-between" style={{ height: '4rem' }}>
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-family-display)', letterSpacing: '0.05em' }}>MebsyStore</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 justify-center max-w-2xl mx-4 gap-6">
            {categories.length > 0 && categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button
              className="hidden md:flex p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Buscar productos"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Carrito de compras"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Profile or Auth Buttons */}
            {token ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Perfil de usuario"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Registrarse
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="grid grid-cols-2 gap-2">
              {categories.length > 0 && categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-center"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Dropdown */}
      <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Profile Dropdown */}
      {token && (
        <ProfileDropdown
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userEmail={getUserEmail()}
        />
      )}
    </nav>
  );
}

export default Navbar;
