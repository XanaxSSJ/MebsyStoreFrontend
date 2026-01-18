import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthToken, categoryAPI, productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

function CategoryPage() {
  const { slug } = useParams();
  const token = getAuthToken();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategoryAndProducts();
  }, [slug]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      const categories = await categoryAPI.getAll();
      const foundCategory = categories.find(cat => cat.slug === slug);
      
      if (foundCategory) {
        setCategory(foundCategory);
        const allProducts = await productAPI.getAll();
        const categoryProducts = allProducts.filter(
          product => product.categoryId === foundCategory.id
        );
        setProducts(categoryProducts);
      } else {
        setError('Categoría no encontrada');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 w-full">
        <div className="w-full" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-3xl">
              <h1 className="mb-sm">Error</h1>
              <p className="text-secondary mb-xl">{error}</p>
              <Link to="/" className="btn btn-secondary">
                Volver al inicio
              </Link>
            </div>
          ) : !category ? (
            <div className="text-center py-3xl">
              <h1 className="mb-sm">Categoría no encontrada</h1>
              <p className="text-secondary mb-xl">La categoría que buscas no existe</p>
              <Link to="/" className="btn btn-secondary">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-xl text-center">
                <h1 className="mb-sm">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-secondary">
                    {category.description}
                  </p>
                )}
              </div>

              {products.length === 0 ? (
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
                    <h2 className="mb-sm">
                      No hay productos
                    </h2>
                    <p className="text-secondary">
                      Esta categoría aún no tiene productos disponibles
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-secondary mb-lg text-center">
                    {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-lg">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CategoryPage;
