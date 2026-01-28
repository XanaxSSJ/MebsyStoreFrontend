import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { userAPI } from '../services/user';
import { orderAPI } from '../services/orders';
import { productAPI } from '../services/products';
import { useCart } from '../contexts/CartContext';

function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [userEmail, setUserEmail] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('estandar');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [products, setProducts] = useState({}); // Mapa de productos por ID
  const [existingOrderId, setExistingOrderId] = useState(null); // ID de orden pendiente a reutilizar
  const [existingOrder, setExistingOrder] = useState(null); // Orden pendiente a reutilizar

  useEffect(() => {
    // Verificar si hay un orderId en la URL (orden pendiente a reutilizar)
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setExistingOrderId(orderIdParam);
      // Cargar la orden existente para obtener la dirección de envío
      loadExistingOrder(orderIdParam);
    }

    loadUserData();
    loadProducts();
  }, [searchParams]);

  useEffect(() => {
    // Si solo hay una dirección, seleccionarla automáticamente
    if (addresses.length === 1 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Obtener email del perfil del usuario
      try {
        const profile = await userAPI.getProfile();
        setUserEmail(profile.email || '');
      } catch (err) {
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          navigate('/login');
          return;
        }
        console.error('Error loading user profile:', err);
      }

      // Load addresses
      const addressesData = await userAPI.getAddresses().catch(() => []);
      setAddresses(addressesData || []);
      
      if (addressesData && addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
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

  const loadExistingOrder = async (orderId) => {
    try {
      const order = await orderAPI.getById(orderId);
      // Guardar la orden en estado para reutilizarla
      setExistingOrder(order);
      // Si la orden tiene dirección de envío, seleccionarla automáticamente
      if (order.shippingAddress?.id) {
        setSelectedAddressId(order.shippingAddress.id);
      }
      // Verificar que la orden esté pendiente
      if (order.status !== 'PENDING_PAYMENT') {
        console.warn('La orden ya fue procesada, se creará una nueva');
        setExistingOrder(null);
        setExistingOrderId(null);
      }
    } catch (err) {
      console.error('Error loading existing order:', err);
      // Si hay error, continuar con flujo normal
      setExistingOrder(null);
      setExistingOrderId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const calculateShippingEstandar = () => {
    const subtotal = getTotalPrice();
    return subtotal * 0.08; // 8% del subtotal para estándar
  };

  const calculateShippingExpress = () => {
    const subtotal = getTotalPrice();
    return subtotal * 0.15; // 15% del subtotal para express
  };

  const calculateShipping = () => {
    if (deliveryMethod === 'express') {
      return calculateShippingExpress();
    }
    return calculateShippingEstandar();
  };

  const calculateTotal = () => {
    return getTotalPrice() + calculateShipping();
  };

  /**
   * Maneja el proceso de pago.
   * 
   * Este método:
   * 1. Si hay una orden existente (orderId en URL), reutiliza esa orden
   * 2. Si no, crea una nueva orden en el backend
   * 3. Crea/actualiza la preferencia de pago en Mercado Pago
   * 4. Redirige al usuario al checkout de Mercado Pago usando init_point
   */
  const handlePay = async () => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!selectedAddressId) {
      alert('Por favor selecciona una dirección de envío');
      return;
    }

    try {
      setProcessing(true);
      
      let order;
      
      // Si hay una orden existente pendiente, reutilizarla
      if (existingOrder && existingOrder.status === 'PENDING_PAYMENT') {
        // Usar la orden existente, no crear una nueva
        order = existingOrder;
        console.log('Reutilizando orden existente:', existingOrder.id);
      } else {
        // Si no hay orden existente válida, crear una nueva
        const orderData = {
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddressId,
        };
        order = await orderAPI.create(orderData);
        console.log('Nueva orden creada:', order.id);
      }
      
      // Calcular costo de envío
      const shippingCost = calculateShipping();
      
      // Crear/actualizar preferencia de pago en Mercado Pago
      const preferenceResponse = await orderAPI.createPaymentPreference(order.id, shippingCost);
      
      // Limpiar carrito antes de redirigir
      clearCart();
      
      // Redirigir a Mercado Pago usando init_point
      // El init_point es la URL oficial de Mercado Pago para Checkout Pro
      window.location.href = preferenceResponse.initPoint;
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert(`Error al procesar el pago: ${error.message}`);
      setProcessing(false);
    }
  };

  // La autenticación se verifica automáticamente mediante cookies HttpOnly
  // Si no hay cookie válida, el backend devolverá 401 y se redirigirá al login

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2">Tu carrito está vacío</h1>
            <p className="text-gray-600 mb-4">Agrega productos para continuar</p>
            <button
              onClick={() => navigate('/productos')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Ver Productos
            </button>
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
            <h1 className="mb-2">Checkout</h1>
            <p className="text-gray-600" style={{ fontSize: '0.95rem' }}>
              Completa tu información para finalizar tu compra
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda - Resumen del Pedido */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
                
                {/* Lista de Productos */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.productId}
                      className={`flex gap-4 ${index < cartItems.length - 1 ? 'pb-4 border-b border-gray-200' : ''}`}
                    >
                      {/* Imagen del Producto */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {products[item.productId]?.imageUrl ? (
                          <img
                            src={products[item.productId].imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
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

                      {/* Información del Producto */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {products[item.productId]?.description || 'Producto de calidad'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen de Precios */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Costo de envío</span>
                    <span className="font-semibold">{formatPrice(calculateShipping())}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                {/* Botón Pagar */}
                <button
                  onClick={handlePay}
                  disabled={processing || !selectedAddressId}
                  className="w-full mt-6 py-3 px-6 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Procesando...' : 'Ir a Pagar'}
                </button>
              </div>
            </div>

            {/* Columna Derecha - Información de Envío */}
            <div className="space-y-6">
              {/* Información de Contacto */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Información de Envío */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Envío</h2>
                
                {addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No tienes direcciones guardadas</p>
                    <button
                      onClick={() => navigate('/perfil')}
                      className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      Agregar Dirección
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex items-start gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors"
                        style={{
                          borderColor: selectedAddressId === address.id ? '#6d28d9' : '#e5e7eb',
                          backgroundColor: selectedAddressId === address.id ? '#f3f4f6' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{address.street}</p>
                          <p className="text-sm text-gray-600">{address.district}, {address.province}, {address.department}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Método de Entrega */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Método de Entrega</h2>
                <div className="space-y-3">
                  <label
                    className="flex items-center gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors"
                    style={{
                      borderColor: deliveryMethod === 'estandar' ? '#6d28d9' : '#e5e7eb',
                      backgroundColor: deliveryMethod === 'estandar' ? '#f3f4f6' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="estandar"
                      checked={deliveryMethod === 'estandar'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Estándar</p>
                      <p className="text-sm text-gray-600">Entrega en 5-7 días hábiles</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(calculateShippingEstandar())}</span>
                  </label>
                  <label
                    className="flex items-center gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors"
                    style={{
                      borderColor: deliveryMethod === 'express' ? '#6d28d9' : '#e5e7eb',
                      backgroundColor: deliveryMethod === 'express' ? '#f3f4f6' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryMethod === 'express'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Express</p>
                      <p className="text-sm text-gray-600">Entrega en 1-2 días hábiles</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(calculateShippingExpress())}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CheckoutPage;
