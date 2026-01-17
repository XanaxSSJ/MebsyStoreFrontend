import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken, setAuthToken, categoryAPI } from '../services/api';

function Navbar() {
  const [token, setToken] = useState(() => getAuthToken());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '4rem' }}>
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">MebsyStore</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 justify-center max-w-2xl mx-4 gap-6">
            <Link
              to="/productos"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Productos
            </Link>
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

          <div className="flex items-center gap-2 ">
            {token ? (
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Cerrar Sesión
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
              <Link
                to="/productos"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                Productos
              </Link>
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
    </nav>
  );
}

export default Navbar;
