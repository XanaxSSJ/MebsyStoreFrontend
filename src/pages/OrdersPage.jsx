import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAuthToken, orderAPI, productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({}); // Cache de productos por ID

  useEffect(() => {
    const storedToken = getAuthToken();
    setToken(storedToken);
    
    if (storedToken) {
      loadOrders();
      loadProducts();
    }

    // Verificar parámetros de retorno de Mercado Pago y redirigir a página de resultado
    const status = searchParams.get('status');
    if (status) {
      // Redirigir a la página de resultado del pago con todos los parámetros
      const params = new URLSearchParams(searchParams);
      navigate(`/pago-exitoso?${params.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Recargar órdenes cuando la ventana vuelve a estar visible (útil cuando el usuario regresa de otra pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token) {
        loadOrders();
      }
    };

    const handleFocus = () => {
      if (token) {
        loadOrders();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getMyOrders();
      // Ordenar órdenes: más recientes primero
      const sortedOrders = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA; // Más recientes primero
      });
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
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
      month: 'short',
      day: 'numeric',
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
        // Agregar la cantidad que tenía en la orden
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PENDING_PAYMENT':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container section-sm">
          <div className="text-center">
            <h1 className="mb-md">Acceso Denegado</h1>
            <p className="text-secondary">Debes iniciar sesión para ver tus órdenes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full flex justify-center">
        <div className="w-full max-w-6xl" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
          <div className="mb-8">
            <h1 className="mb-2">Order history</h1>
            <p className="text-gray-600" style={{ fontSize: '0.95rem' }}>
              Check the status of recent orders, manage returns, and discover similar products.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg text-center py-3xl">
              <p className="text-secondary">No tienes órdenes aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg" style={{ padding: '20px' }}>
                  {/* Resumen de la orden */}
                  <div className="flex flex-col gap-4 mb-4 border-b border-gray-300 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-10">
                        <div>
                          <p className="text-sm text-gray-600 !m-0">Order number</p>
                          <p className="text-base font-semibold text-gray-900">{order.id.slice(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 !m-0">Date placed</p>
                          <p className="text-base font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 !m-0">Total</p>
                          <p className="text-base font-semibold text-gray-900">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 !m-0">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/orden/${order.id}`)}
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
                        View Order
                      </button>
                      <button
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
                        View Invoice
                      </button>
                    </div>
                    </div>
                    {/* Dirección de envío */}
                    {order.shippingAddress && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">Dirección de envío:</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.street}, {order.shippingAddress.district}, {order.shippingAddress.province}, {order.shippingAddress.department}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lista de productos */}
                  <div className="space-y-6">
                    {order.items.map((item, itemIndex) => {
                      const product = products[item.productId];
                      return (
                        <div 
                          key={item.id} 
                          className="flex gap-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                          style={{ paddingLeft: '0', paddingRight: '0' }}
                        >
                          {/* Imagen del producto */}
                          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
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
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                                  {item.productName}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed !m-0">
                                  {product?.description || 'Producto de calidad premium'}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatPrice(item.unitPrice)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    x{item.quantity}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Estado de entrega y botones en la misma línea */}
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                {order.status === 'PAID' ? (
                                  <>
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-gray-700">
                                      Pagado - Delivered on {formatDeliveryDate(order.createdAt)}
                                    </span>
                                  </>
                                ) : order.status === 'CANCELLED' ? (
                                  <>
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-sm text-red-700 font-medium">
                                      Cancelado / Pago Rechazado
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">
                                      Pago Pendiente
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Botones de acción */}
                              <div className="flex gap-3">
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
                                  View product
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
                                  Buy again
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrdersPage;
