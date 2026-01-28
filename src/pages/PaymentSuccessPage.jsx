import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orderAPI } from '../services/api';

/**
 * Página de éxito del pago.
 * 
 * Esta página se muestra cuando el usuario regresa de Mercado Pago después de un pago exitoso.
 * Maneja los parámetros de URL que Mercado Pago envía:
 * - status: Estado del pago (success, pending, failure)
 * - payment_id: ID del pago en Mercado Pago
 * - preference_id: ID de la preferencia de pago
 * 
 * @see https://www.mercadopago.com.pe/developers/es/docs/checkout-pro/landing
 */
function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');

    // Si tenemos orderId, redirigir directamente al detalle de la orden
    if (orderId && status) {
      navigate(`/orden/${orderId}?status=${status}`, { replace: true });
      return;
    }

    // Validar que haya parámetros de retorno
    if (!status) {
      // Si no hay parámetros, redirigir a órdenes
      navigate('/ordenes');
      return;
    }

    setPaymentStatus(status);
    setLoading(false);

    // Si el pago está pendiente, mostrar mensaje apropiado
    if (status === 'pending') {
      // El webhook se encargará de actualizar el estado cuando se confirme
      console.log('Payment pending, waiting for webhook confirmation');
    }

    // Log para debugging (remover en producción)
    console.log('Payment return:', { status, orderId, paymentId, preferenceId });
  }, [searchParams, navigate]);

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full flex justify-center items-center">
        <div className="w-full max-w-md text-center px-4">
          {paymentStatus === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">¡Pago Exitoso!</h1>
              <p className="text-gray-600">
                Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación
                con los detalles de tu pedido.
              </p>
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => navigate('/ordenes')}
                  className="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ver Mis Órdenes
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Seguir Comprando
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-yellow-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v4m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Pago Pendiente</h1>
              <p className="text-gray-600">
                Tu pago está siendo procesado. Te notificaremos por correo electrónico
                cuando se confirme.
              </p>
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => navigate('/ordenes')}
                  className="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Ver Mis Órdenes
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'failure' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Pago Rechazado</h1>
              <p className="text-gray-600">
                No pudimos procesar tu pago. Por favor, verifica los datos de tu tarjeta
                o intenta con otro método de pago.
              </p>
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Intentar Nuevamente
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="w-full py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Volver a Productos
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PaymentSuccessPage;
