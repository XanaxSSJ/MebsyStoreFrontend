import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { categoryAPI } from '../../../services/categories';
import { productAPI } from '../../../services/products';
import { useCart } from '../../../contexts/CartContext';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const stockLabel = useMemo(() => {
    if (!product) return '';
    if (product.stock <= 0) return 'Sin stock';
    if (product.stock === 1) return '1 unidad disponible';
    return `${product.stock} unidades disponibles`;
  }, [product]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [foundProduct, categories, allProducts] = await Promise.all([
          productAPI.getById(id),
          categoryAPI.getAll().catch(() => []),
          productAPI.getAll(),
        ]);

        if (!foundProduct) {
          setProduct(null);
          setRelatedProducts([]);
          setCategoryName('');
          setError('Producto no encontrado');
          return;
        }

        setProduct(foundProduct);

        const foundCategory = categories.find((c) => String(c.id) === String(foundProduct.categoryId));
        setCategoryName(foundCategory?.name || '');

        const related = allProducts
          .filter((p) => String(p.id) !== String(foundProduct.id))
          .filter((p) => String(p.categoryId) === String(foundProduct.categoryId))
          .slice(0, 10);

        setRelatedProducts(related);
      } catch (err) {
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        {loading ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-sm text-gray-600">Cargando producto...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar</h1>
              <p className="text-sm text-gray-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Volver a productos
              </Link>
            </div>
          </div>
        ) : !product ? null : (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2 transition-colors"
              >
                <span className="text-gray-400">←</span>
                Volver a Productos
              </Link>
            </div>

            {/* 2 columnas: foto | info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Foto */}
              <div className="lg:sticky lg:top-6">
                <div className="mx-auto w-full max-w-xs sm:max-w-sm">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <div className="w-full flex items-center justify-center overflow-hidden h-56 sm:h-64">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="py-12">
                      <svg
                        className="w-14 h-14 text-gray-400"
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
                  )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div>
                <div className="pb-6 border-b border-gray-200">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                    {product.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-xl font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    {categoryName ? (
                      <span className="text-xs font-medium text-purple-700 border border-purple-200 bg-purple-50 rounded-full px-3 py-1">
                        {categoryName}
                      </span>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <dt className="text-xs font-medium text-gray-500">Categoría</dt>
                    <dd className="mt-1 text-sm text-gray-900">{categoryName || '—'}</dd>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <dt className="text-xs font-medium text-gray-500">Stock</dt>
                    <dd className={`mt-1 text-sm ${product.stock > 0 ? 'text-gray-900' : 'text-red-700'}`}>
                      {stockLabel}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <p className="text-xs font-medium text-gray-500">Descripción</p>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {product.description || 'Sin descripción.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  {product.stock > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                    >
                      Agregar al carrito
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-500 w-full sm:w-auto cursor-not-allowed"
                      disabled
                    >
                      Agotado
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* También compraron */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-baseline justify-between gap-4 mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Los clientes también compraron <span className="text-purple-600">·</span>
                </h2>
              </div>

              {relatedProducts.length === 0 ? (
                <p className="text-sm text-gray-600">Aún no hay productos relacionados.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {relatedProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/producto/${p.id}`}
                      className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-purple-300 transition-colors"
                    >
                      <div className="bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                            loading="lazy"
                          />
                        ) : (
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
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-900 line-clamp-2 group-hover:underline group-hover:decoration-purple-300">
                          {p.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;

