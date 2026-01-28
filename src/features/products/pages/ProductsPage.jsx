import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import { useProductsQuery } from '../hooks/useProductsQuery';

const EMPTY_ARRAY = [];

function ProductsPage() {
  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsQuery();

  const products = productsData ?? EMPTY_ARRAY;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container section">
        <div className="mb-xl text-center">
          <h1 className="mb-sm">Todos los Productos</h1>
          <p className="text-secondary">
            Explora nuestra colección completa de productos
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
        ) : products.length === 0 ? (
          <div className="card card-lg max-w-2xl mx-auto">
            <div className="text-center py-3xl">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-lg">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h2 className="mb-sm">No hay productos</h2>
              <p className="text-secondary">
                Aún no hay productos disponibles en la tienda
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-secondary mb-lg text-center">
              {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductsPage;

