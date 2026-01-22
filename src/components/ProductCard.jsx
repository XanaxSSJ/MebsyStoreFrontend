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
    <div className="card card-sm transition-all hover:-translate-y-1 hover:shadow-lg border-2 border-gray-200 hover:border-gray-900 flex flex-col" style={{ padding: '14px' }}>
      {/* Foto */}
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
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
        )}
      </div>

      {/* Nombre del producto */}
      <div className="text-center">
        <h3 className="text-base text-gray-800 tracking-tight line-clamp-2 font-normal">
          {product.name}
        </h3>
      </div>

      {/* Precio */}
      <div className="mb-4 text-center">
        <span className="text-xl font-bold text-gray-900">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Ver Detalles */}
      <div className="mb-4 text-center">
        <Link
          to={`/producto/${product.id}`}
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors underline decoration-gray-400 hover:decoration-gray-900"
        >
          Ver Detalles
          <span className="text-gray-400">&gt;</span>
        </Link>
      </div>

      {/* Botón ADD TO CART */}
      <div className="flex justify-center">
        {product.stock > 0 ? (
          <button
            onClick={handleAddToCart}
            className="border-none rounded-xl text-white tracking-wide cursor-pointer transition-all text-sm"
            style={{
              background: '#6d28d9',
              letterSpacing: '0.4px',
              padding: '8px 20px',
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ADD TO CART
          </button>
        ) : (
          <button
            disabled
            className="border-none rounded-xl text-gray-400 tracking-wide cursor-not-allowed bg-gray-200 text-sm"
            style={{
              letterSpacing: '0.4px',
              padding: '8px 20px',
              fontSize: '0.875rem',
            }}
          >
            AGOTADO
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
