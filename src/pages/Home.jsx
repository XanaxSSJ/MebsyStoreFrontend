import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useSearch } from '../contexts/SearchContext';
import { useProductsQuery } from '../features/products/hooks/useProductsQuery';

const EMPTY_PRODUCTS = [];

function Home() {
  const { searchQuery } = useSearch();
  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery();

  const products = productsData ?? EMPTY_PRODUCTS;

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, searchQuery]);

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

          {isLoading ? (
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
