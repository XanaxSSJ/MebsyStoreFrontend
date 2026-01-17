import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className="card card-sm transition-all hover:-translate-y-1 hover:shadow-lg border-2 border-gray-200 hover:border-gray-900"
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
    </Link>
  );
}

export default ProductCard;
