import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthToken, categoryAPI } from '../services/api';

function Home() {
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = getAuthToken();
    setToken(storedToken);
    
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAPI.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    electronica: '📱',
    ropa: '👕',
    hogar: '🏠',
    deportes: '⚽',
    libros: '📚',
    juguetes: '🧸',
  };

  const getCategoryIcon = (slug) => {
    return categoryIcons[slug] || '📦';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container section">
        <div className="text-center mb-3xl mx-auto">
          <h1 className="mb-lg text-center">Bienvenido a MebsyStore</h1>
          <p className="text-lg text-secondary text-center mb-lg">
            Tu tienda en línea de confianza. Descubre productos increíbles en nuestras categorías.
          </p>
          <Link to="/productos" className="btn btn-primary">
            Ver Todos los Productos
          </Link>
        </div>

        <div className="mb-lg">
          <h2 className="text-center mb-xl">Explora Nuestras Categorías</h2>
          
          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando categorías...</p>
            </div>
          ) : error ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">No hay categorías disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-lg">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  className="card card-sm text-center transition-all hover:-translate-y-1 hover:shadow-lg border-2 border-gray-200 hover:border-gray-900"
                >
                  <div className="text-4xl mb-sm">{getCategoryIcon(category.slug)}</div>
                  <h3 className="text-sm font-semibold text-primary">{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
