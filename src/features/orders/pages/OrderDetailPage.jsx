import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useCart } from '../../../contexts/CartContext';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useOrderByIdQuery } from '../hooks/useOrderByIdQuery';

const EMPTY_ARRAY = [];

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, clearCart } = useCart();
  const paymentStatus = searchParams.get('status'); // success, pending, failure

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderByIdQuery(orderId);

  const {
    data: productsData,
    isLoading: productsLoading,
  } = useProductsQuery();

  const loading = orderLoading || productsLoading;

  const productsDataSafe = productsData ?? EMPTY_ARRAY;

  const products = useMemo(() => {
    const map = {};
    productsDataSafe.forEach((product) => {
      map[product.id] = product;
    });
    return map;
  }, [productsDataSafe]);

  useEffect(() => {
    if (orderError) {
      console.error('Error loading order:', orderError);
      navigate('/ordenes');
    }
  }, [orderError, navigate]);

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
    // Priorizar el estado de la orden sobre el paymentStatus de Mercado Pago
    if (order?.status === 'SHIPPED') {
      return {
        text: 'Orden Enviada',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    } else if (paymentStatus === 'success' || order?.status === 'PAID') {
      return {
        text: 'Pago Exitoso',
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <div className="w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header con botón de volver */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/ordenes')}
              className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-3 sm:mb-4"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Órdenes
            </button>
            <h1 className="mb-2 text-2xl sm:text-3xl">Detalle de Orden</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Información completa de tu pedido
            </p>
          </div>

          {/* Estado del pago */}
          <div className={`${statusDisplay.bgColor} ${statusDisplay.textColor} rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4`}>
            <div className="flex-shrink-0">
              {statusDisplay.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold mb-1">{statusDisplay.text}</h2>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                {order?.status === 'SHIPPED' && `Tu orden fue enviada el ${formatDeliveryDate(order.updatedAt || order.createdAt)}. Deberías recibirla pronto.`}
                {order?.status === 'PAID' && 'Tu pago ha sido procesado correctamente. Tu orden está en preparación y será enviada pronto.'}
                {order?.status === 'PENDING_PAYMENT' && 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'}
                {order?.status === 'CANCELLED' && 'No pudimos procesar tu pago. Por favor, intenta nuevamente.'}
                {!order?.status && paymentStatus === 'success' && 'Tu pago ha sido procesado correctamente.'}
                {!order?.status && paymentStatus === 'pending' && 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'}
                {!order?.status && paymentStatus === 'failure' && 'No pudimos procesar tu pago. Por favor, intenta nuevamente.'}
              </p>
            </div>
          </div>

          {/* Información de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            {/* Resumen de la orden */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-300">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Número de Orden</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Fecha de Pedido</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
              </div>
            </div>

            {/* Dirección de envío */}
            {order.shippingAddress && (
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Dirección de Envío</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.province}, {order.shippingAddress.department}
                </p>
              </div>
            )}

            {/* Lista de productos */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Productos</h3>
              <div className="space-y-4 sm:space-y-6 mb-6">
                {order.items.map((item) => {
                  const product = products[item.productId];
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                    >
                      {/* Imagen del producto */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <svg
                            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg break-words">
                              {item.productName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 leading-relaxed line-clamp-2">
                              {product?.description || 'Producto de calidad premium'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Cantidad: {item.quantity}
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 mt-2 sm:hidden">
                              {formatPrice(item.unitPrice)}
                              {item.quantity > 1 && (
                                <span className="text-xs text-gray-500 ml-2">
                                  Subtotal: {formatPrice(item.subtotal)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 hidden sm:block">
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
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                          <button
                            onClick={() => navigate(`/producto/${item.productId}`)}
                            className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-medium bg-white rounded-lg transition-colors"
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
                            className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-medium bg-white rounded-lg transition-colors"
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

              {/* Resumen de totales */}
              <div className="border-t border-gray-300 pt-4 sm:pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base text-gray-700">Subtotal:</span>
                  <span className="text-sm sm:text-base text-gray-900 font-semibold">
                    {formatPrice(order.items.reduce((sum, item) => sum + item.subtotal, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold pt-3 sm:pt-4 border-t border-gray-300">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Botones de acción principales */}
              <div className="flex justify-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-300">
                {order.status === 'PENDING_PAYMENT' && (
                  <button
                    onClick={handleCompletePayment}
                    className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Completar Pago
                  </button>
                )}
                {order.status !== 'PENDING_PAYMENT' && (
                  <button
                    onClick={() => handleBuyAgain(order.items)}
                    className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Comprar Todo Nuevamente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetailPage;

