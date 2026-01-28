export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Configuración base para todas las peticiones fetch.
 * Incluye credentials: 'include' para enviar cookies HttpOnly automáticamente.
 */
export const defaultFetchOptions = {
  credentials: 'include', // CRÍTICO: incluir cookies en todas las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Headers para peticiones autenticadas.
 * Ya no incluye Authorization header - las cookies se envían automáticamente.
 */
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    // El token JWT se envía automáticamente en la cookie HttpOnly
  };
};

