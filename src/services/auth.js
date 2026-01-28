import { API_BASE_URL, defaultFetchOptions } from './http/client';

export const authAPI = {
  /**
   * Inicia sesión y establece cookie HttpOnly con JWT.
   * El token también se devuelve en el body para compatibilidad temporal.
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    return await response.json();
  },

  /**
   * Registra un nuevo usuario.
   */
  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      ...defaultFetchOptions,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return await response.json();
  },

  /**
   * Cierra sesión eliminando la cookie HttpOnly.
   */
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      ...defaultFetchOptions,
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }
  },

  /**
   * Verifica si el usuario está autenticado haciendo una petición ligera.
   * Útil para verificar el estado de autenticación sin leer la cookie.
   */
  checkAuth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        ...defaultFetchOptions,
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

