import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI } from '../services/api';

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  // Ya no necesitamos verificar token - las cookies se envían automáticamente

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleCheckout = async () => {

    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const order = await orderAPI.create(orderData);
      
      // Limpiar carrito después de crear la orden
      clearCart();
      
      // Redirigir a una página de éxito o mostrar mensaje
      alert(`Orden creada exitosamente! ID: ${order.id}`);
      navigate('/');
    } catch (error) {
      alert(`Error al crear la orden: ${error.message}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container section">
          <div className="card max-w-2xl mx-auto text-center">
            <h1 className="mb-md">Carrito de Compras</h1>
            <p className="text-secondary mb-xl">Tu carrito está vacío</p>
            <button
              onClick={() => navigate('/productos')}
              className="btn btn-primary"
            >
              Explorar Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container section">
        <h1 className="mb-3xl text-3xl font-bold text-gray-900">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.productId}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="w-28 h-28 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1.5 text-lg">
                      {item.productName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {formatPrice(item.price)} c/u
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="relative">
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Eliminar producto"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-gray-500">Calculado al pagar</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-xl mb-6">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatPrice(getTotalPrice())}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg uppercase tracking-wide mb-4 hover:opacity-90"
                style={{
                  background: 'linear-gradient(to right, #a855f7, #7c3aed)',
                }}
              >
                {token ? 'Checkout' : 'Iniciar Sesión para Comprar'}
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
