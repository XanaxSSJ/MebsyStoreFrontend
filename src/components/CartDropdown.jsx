import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI, getAuthToken } from '../services/api';

function CartDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const token = getAuthToken();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!token) {
      alert('Debes iniciar sesión para realizar una compra');
      onClose();
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
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
      
      clearCart();
      onClose();
      
      alert(`Orden creada exitosamente! ID: ${order.id}`);
      navigate('/');
    } catch (error) {
      alert(`Error al crear la orden: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="fixed top-16 right-4 w-[560px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-200 flex flex-col max-h-[calc(100vh-5rem)] z-50"
      >
        {/* Header */}
        <div className="border-b border-gray-200 flex items-center justify-between" style={{ padding: '10px 20px' }}>
          <h2 className="text-lg font-semibold text-gray-900 m-0 leading-tight">Shopping cart</h2>
          <button
            onClick={onClose}
            className="border-none bg-transparent text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center"
            style={{ 
              fontSize: '24px', 
              lineHeight: '1',
              padding: '4px',
              width: '28px',
              height: '28px'
            }}
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '50vh', padding: '8px 20px 4px' }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500">Agrega productos para comenzar</p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={item.productId} className={`grid grid-cols-[1fr_auto] gap-4 py-3.5 ${index < cartItems.length - 1 ? 'border-b border-dashed border-gray-200' : ''}`}>
                {/* Product Info */}
                <div className="flex flex-col gap-1.5">
                  <div className="font-semibold text-gray-900">
                    {item.productName}
                  </div>
                  <div className="text-sm text-gray-500">Producto de calidad</div>
                  <div className="flex gap-3 items-center">
                    <span className="text-[13px] text-gray-500">Precio:</span>
                    <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                    aria-label="Decrementar"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-8 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                    aria-label="Incrementar"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal and Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 flex flex-col gap-3" style={{ padding: '14px 20px 14px' }}>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-900">Subtotal</span>
              <span className="text-purple-800 ">{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCheckout}
                className="border-none rounded-xl text-white tracking-wide cursor-pointer transition-all"
                style={{
                  background: '#6d28d9',
                  letterSpacing: '0.4px',
                  padding: '8px 24px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDropdown;
