import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useSearch } from '../contexts/SearchContext';
import { productAPI } from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchQuery } = useSearch();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productAPI.getAll();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error al cargar productos. Verifica tu conexión.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full">
        <div className="w-full" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
          <div className="text-center mb-3xl mx-auto">
            <h1 className="mb-lg text-center">Bienvenido a MebsyStore</h1>
            <p className="text-lg text-secondary text-center">
              Tu tienda en línea de confianza. Descubre productos increíbles.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">
                {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-lg">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
