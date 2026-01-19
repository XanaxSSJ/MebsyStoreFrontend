const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al iniciar sesión' }));
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    return await response.json();
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al registrar usuario' }));
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return await response.json();
  },
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener categorías' }));
      throw new Error(error.message || 'Error al obtener categorías');
    }

    return await response.json();
  },
};

export const productAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener productos' }));
      throw new Error(error.message || 'Error al obtener productos');
    }

    return await response.json();
  },

  getByCategory: async (categoryId) => {
    const allProducts = await productAPI.getAll();
    return allProducts.filter(product => product.categoryId === categoryId);
  },
};

export const orderAPI = {
  create: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear la orden' }));
      throw new Error(error.error || error.message || 'Error al crear la orden');
    }

    return await response.json();
  },

  getMyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener órdenes' }));
      throw new Error(error.message || 'Error al obtener órdenes');
    }

    return await response.json();
  },

  getById: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener la orden' }));
      throw new Error(error.message || 'Error al obtener la orden');
    }

    return await response.json();
  },

  createPaymentPreference: async (orderId, shippingCost) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment/preference`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        shippingCost: shippingCost
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Error al crear preferencia de pago (${response.status})` 
      }));
      throw new Error(error.error || error.message || `Error al crear preferencia de pago (${response.status})`);
    }

    return await response.json();
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener perfil' }));
      throw new Error(error.message || 'Error al obtener perfil');
    }

    return await response.json();
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar perfil' }));
      throw new Error(error.error || error.message || 'Error al actualizar perfil');
    }

    return await response.json();
  },

  getAddresses: async () => {
    const response = await fetch(`${API_BASE_URL}/user/addresses`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener direcciones' }));
      throw new Error(error.message || 'Error al obtener direcciones');
    }

    return await response.json();
  },

  createAddress: async (addressData) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear dirección' }));
      throw new Error(error.error || error.message || 'Error al crear dirección');
    }

    return await response.json();
  },

  updateAddress: async (addressId, addressData) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al actualizar dirección' }));
      throw new Error(error.error || error.message || 'Error al actualizar dirección');
    }

    return await response.json();
  },

  deleteAddress: async (addressId) => {
    const response = await fetch(`${API_BASE_URL}/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar dirección' }));
      throw new Error(error.error || error.message || 'Error al eliminar dirección');
    }
  },
};

export const locationAPI = {
  getDepartments: async () => {
    const response = await fetch(`${API_BASE_URL}/user/locations/departments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener departamentos' }));
      throw new Error(error.message || 'Error al obtener departamentos');
    }

    return await response.json();
  },

  getProvinces: async (department) => {
    const response = await fetch(`${API_BASE_URL}/user/locations/provinces?department=${encodeURIComponent(department)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener provincias' }));
      throw new Error(error.message || 'Error al obtener provincias');
    }

    return await response.json();
  },

  getDistricts: async (department, province) => {
    const response = await fetch(`${API_BASE_URL}/user/locations/districts?department=${encodeURIComponent(department)}&province=${encodeURIComponent(province)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al obtener distritos' }));
      throw new Error(error.message || 'Error al obtener distritos');
    }

    return await response.json();
  },
};
