import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAuthToken, orderAPI } from '../services/api';

function ProfilePage() {
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    setToken(storedToken);
    
    if (storedToken) {
      loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
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
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container section-sm">
          <div className="text-center">
            <h1 className="mb-md">Acceso Denegado</h1>
            <p className="text-secondary">Debes iniciar sesión para ver tu perfil</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 container section">
        <h1 className="mb-xl">Mi Perfil</h1>

        <div className="mb-3xl">
          <h2 className="mb-lg">Mis Órdenes</h2>
          
          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center py-3xl">
              <p className="text-secondary">No tienes órdenes aún</p>
            </div>
          ) : (
            <div className="space-y-md">
              {orders.map((order) => (
                <div key={order.id} className="card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
                    <div>
                      <h3 className="font-semibold text-primary mb-sm">
                        Orden #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-secondary">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-secondary mt-xs">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary mb-sm">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'PAID' 
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'PENDING_PAYMENT'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'PAID' ? 'Pagado' : order.status === 'PENDING_PAYMENT' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </div>
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

export default ProfilePage;
