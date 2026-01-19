import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthToken, orderAPI, productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const paymentStatus = searchParams.get('status'); // success, pending, failure

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    loadOrder();
    loadProducts();
  }, [orderId, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderAPI.getById(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const allProducts = await productAPI.getAll();
      const productsMap = {};
      allProducts.forEach(product => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDeliveryDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBuyAgain = (orderItems) => {
    orderItems.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });
    navigate('/checkout');
  };

  const handleCompletePayment = () => {
    // Limpiar carrito primero para evitar duplicados
    clearCart();
    
    // Agregar productos de la orden pendiente al carrito
    order.items.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });
    
    // Navegar a checkout con el orderId para reutilizar la orden existente
    navigate(`/checkout?orderId=${order.id}`);
  };

  const getStatusDisplay = () => {
    // Priorizar el estado del pago de Mercado Pago si está disponible
    if (paymentStatus === 'success' || order?.status === 'PAID') {
      return {
        text: 'Pago Exitoso',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    } else if (paymentStatus === 'pending' || order?.status === 'PENDING_PAYMENT') {
      return {
        text: 'Pago Pendiente',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        icon: (
          <svg className="w-6 h-6 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    } else if (paymentStatus === 'failure' || order?.status === 'CANCELLED') {
      return {
        text: 'Pago Rechazado',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    }
    return {
      text: 'Estado desconocido',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      icon: null,
    };
  };

  if (!getAuthToken()) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container section-sm">
          <div className="text-center">
            <p className="text-secondary">Cargando orden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container section-sm">
          <div className="text-center">
            <h1 className="mb-md">Orden no encontrada</h1>
            <button
              onClick={() => navigate('/ordenes')}
              className="btn btn-secondary"
            >
              Volver a Órdenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-4xl" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
          {/* Header con botón de volver */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/ordenes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Órdenes
            </button>
            <h1 className="mb-2">Detalle de Orden</h1>
            <p className="text-gray-600" style={{ fontSize: '0.95rem' }}>
              Información completa de tu pedido
            </p>
          </div>

          {/* Estado del pago */}
          <div className={`${statusDisplay.bgColor} ${statusDisplay.textColor} rounded-lg p-6 mb-6 flex items-center gap-4`}>
            <div className="flex-shrink-0">
              {statusDisplay.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">{statusDisplay.text}</h2>
              <p className="text-sm opacity-90">
                {paymentStatus === 'success' && 'Tu pago ha sido procesado correctamente.'}
                {paymentStatus === 'pending' && 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'}
                {paymentStatus === 'failure' && 'No pudimos procesar tu pago. Por favor, intenta nuevamente.'}
              </p>
            </div>
          </div>

          {/* Información de la orden */}
          <div className="bg-gray-50 rounded-lg" style={{ padding: '24px' }}>
            {/* Resumen de la orden */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-300">
              <div>
                <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
                <p className="text-base font-semibold text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha de Pedido</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
              </div>
            </div>

            {/* Dirección de envío */}
            {order.shippingAddress && (
              <div className="mb-6 pb-6 border-b border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dirección de Envío</h3>
                <p className="text-gray-700">
                  {order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.province}, {order.shippingAddress.department}
                </p>
              </div>
            )}

            {/* Lista de productos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
              <div className="space-y-6">
                {order.items.map((item) => {
                  const product = products[item.productId];
                  return (
                    <div
                      key={item.id}
                      className="flex gap-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                    >
                      {/* Imagen del producto */}
                      <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <svg
                            className="w-12 h-12 text-gray-400"
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

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {product?.description || 'Producto de calidad premium'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.unitPrice)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-500 mt-1">
                                Subtotal: {formatPrice(item.subtotal)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => navigate(`/producto/${item.productId}`)}
                            className="px-4 py-2 text-sm font-medium bg-white rounded-lg transition-colors"
                            style={{
                              border: '1px solid #8b5cf6',
                              color: '#8b5cf6'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            Ver Producto
                          </button>
                          <button
                            onClick={() => handleBuyAgain([item])}
                            className="px-4 py-2 text-sm font-medium bg-white rounded-lg transition-colors"
                            style={{
                              border: '1px solid #8b5cf6',
                              color: '#8b5cf6'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            Comprar Nuevamente
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="border-t border-gray-300 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900 font-semibold">
                  {formatPrice(order.items.reduce((sum, item) => sum + item.subtotal, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-gray-300">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Botones de acción principales */}
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-300">
              {order.status === 'PENDING_PAYMENT' && (
                <button
                  onClick={handleCompletePayment}
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Completar Pago
                </button>
              )}
              {order.status !== 'PENDING_PAYMENT' && (
                <button
                  onClick={() => handleBuyAgain(order.items)}
                  className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Comprar Todo Nuevamente
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderDetailPage;
