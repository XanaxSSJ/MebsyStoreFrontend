import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { orderAPI, getAuthToken, userAPI } from '../services/api';

function CartDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const token = getAuthToken();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (token) {
        loadUserData();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, token]);

  const loadUserData = async () => {
    try {
      setLoadingProfile(true);
      const [profileData, addressesData] = await Promise.all([
        userAPI.getProfile().catch(() => null),
        userAPI.getAddresses().catch(() => [])
      ]);
      setProfile(profileData);
      setAddresses(addressesData || []);
      if (addressesData && addressesData.length > 0) {
        setSelectedAddressId(addressesData[0].id);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

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

    // Validar perfil completo
    if (!profile || !profile.firstName || !profile.lastName || !profile.phone) {
      alert('Por favor completa tu perfil (nombre, apellido y teléfono) antes de realizar una compra');
      onClose();
      navigate('/perfil');
      return;
    }

    // Validar que tenga direcciones
    if (addresses.length === 0) {
      alert('Por favor agrega al menos una dirección de envío antes de realizar una compra');
      onClose();
      navigate('/perfil');
      return;
    }

    // Si no hay dirección seleccionada, mostrar selector
    if (!selectedAddressId) {
      setShowAddressSelector(true);
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddressId,
      };

      const order = await orderAPI.create(orderData);
      
      clearCart();
      onClose();
      setShowAddressSelector(false);
      
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
        <div className="border-b border-gray-200 flex items-center justify-center" style={{ padding: '8px 20px' }}>
          <h2 className="text-lg font-semibold text-gray-900 m-0 leading-tight !m-0">Shopping cart</h2>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '50vh', padding: '0px 20px 0px' }}>
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

        {/* Address Selector */}
        {showAddressSelector && addresses.length > 0 && (
          <div className="border-t border-gray-200" style={{ padding: '12px 20px' }}>
            <p className="text-sm font-medium text-gray-900 mb-2">Selecciona dirección de envío:</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ border: selectedAddressId === address.id ? '1px solid #6d28d9' : '1px solid #e5e7eb' }}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-gray-900">{address.street}</p>
                    <p className="text-gray-600">{address.city}, {address.postalCode}, {address.country}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowAddressSelector(false)}
                className="flex-1 px-3 py-1.5 text-sm font-medium bg-white rounded-lg transition-colors"
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
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                disabled={!selectedAddressId}
                className="flex-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ 
                  background: '#6d28d9'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1';
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Footer with Subtotal and Checkout */}
        {cartItems.length > 0 && !showAddressSelector && (
          <div className="border-t border-gray-200 flex flex-col gap-3" style={{ padding: '8px 20px 8px' }}>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-900">Subtotal</span>
              <span className="text-purple-800 ">{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleCheckout}
                disabled={loadingProfile}
                className="border-none rounded-xl text-white tracking-wide cursor-pointer transition-all disabled:opacity-50"
                style={{
                  background: '#6d28d9',
                  letterSpacing: '0.4px',
                  padding: '8px 24px',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loadingProfile ? 'Cargando...' : 'CHECKOUT'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDropdown;
