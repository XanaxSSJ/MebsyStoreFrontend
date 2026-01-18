import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className="card card-sm transition-all hover:-translate-y-1 hover:shadow-lg border-2 border-gray-200 hover:border-gray-900 relative"
    >
      <div className="mb-md">
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-md">
          <svg
            className="w-16 h-16 text-gray-400"
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
        <h3 className="font-semibold text-primary mb-xs line-clamp-2" style={{ minHeight: '2.5rem' }}>
          {product.name}
        </h3>
        <p className="text-sm text-secondary line-clamp-2 mb-md" style={{ minHeight: '2.5rem' }}>
          {product.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-md border-t border-gray-200">
        <span className="text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          product.stock > 0 
            ? 'bg-gray-100 text-gray-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
        </span>
      </div>

      {product.stock > 0 && (
        <button
          onClick={handleAddToCart}
          className="absolute top-2 right-2 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg"
          aria-label="Agregar al carrito"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      )}
    </Link>
  );
}

export default ProductCard;
