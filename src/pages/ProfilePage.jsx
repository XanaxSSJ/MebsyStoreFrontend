import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { userAPI, locationAPI } from '../services/api';

function ProfilePage() {
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', department: '', province: '', district: '' });
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para ubicaciones
  const [departments, setDepartments] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await locationAPI.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const loadProvinces = async (department) => {
    if (!department) {
      setProvinces([]);
      setDistricts([]);
      return;
    }
    try {
      setLoadingLocations(true);
      const provs = await locationAPI.getProvinces(department);
      setProvinces(provs);
      setDistricts([]); // Reset districts when department changes
    } catch (err) {
      console.error('Error loading provinces:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadDistricts = async (department, province) => {
    if (!department || !province) {
      setDistricts([]);
      return;
    }
    try {
      setLoadingLocations(true);
      const dists = await locationAPI.getDistricts(department, province);
      setDistricts(dists);
    } catch (err) {
      console.error('Error loading districts:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load user profile from backend
      const profile = await userAPI.getProfile();
      if (profile) {
        setUserEmail(profile.email || '');
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setPhone(profile.phone || '');
      }

      // Load addresses from backend
      const addressesData = await userAPI.getAddresses();
      setAddresses(addressesData || []);
    } catch (err) {
      console.error('Error loading profile:', err);
      // If profile doesn't exist yet, that's okay
      if (err.message && !err.message.includes('404')) {
        console.error('Unexpected error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    try {
      setSaving(true);
      await userAPI.updateProfile({
        firstName,
        lastName,
        phone,
      });
      setIsEditingName(false);
      // Reload profile to get updated data
      await loadUserProfile();
    } catch (err) {
      console.error('Error saving name:', err);
      alert('Error al guardar el perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (newAddress.street && newAddress.department && newAddress.province && newAddress.district) {
      try {
        setSaving(true);
        await userAPI.createAddress(newAddress);
        setNewAddress({ street: '', department: '', province: '', district: '' });
        setProvinces([]);
        setDistricts([]);
        setIsAddingAddress(false);
        // Reload addresses
        await loadUserProfile();
      } catch (err) {
        console.error('Error adding address:', err);
        alert('Error al agregar dirección: ' + err.message);
      } finally {
        setSaving(false);
      }
    } else {
      alert('Por favor completa todos los campos de la dirección');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }
    try {
      setSaving(true);
      await userAPI.deleteAddress(addressId);
      // Reload addresses
      await loadUserProfile();
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Error al eliminar dirección: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAddress = async (addressId, updatedAddress) => {
    try {
      setSaving(true);
      await userAPI.updateAddress(addressId, updatedAddress);
      setEditingAddressIndex(null);
      // Reload addresses
      await loadUserProfile();
    } catch (err) {
      console.error('Error updating address:', err);
      alert('Error al actualizar dirección: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      // TODO: Call backend API to change password
      alert('Funcionalidad de cambio de contraseña pendiente de implementar en el backend');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  // La autenticación se verifica automáticamente mediante cookies HttpOnly
  // Si no hay cookie válida, el backend devolverá 401 y se redirigirá al login
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center container section-sm">
          <div className="text-center">
            <p className="text-secondary">Cargando perfil...</p>
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
            <h1 className="mb-2">Mi Perfil</h1>
            <p className="text-gray-600" style={{ fontSize: '0.95rem' }}>
              Administra tu información personal, direcciones y configuración de cuenta.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-3xl">
              <p className="text-secondary">Cargando perfil...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-0">Información Personal</h2>
                  {!isEditingName && (
                    <button
                      onClick={() => setIsEditingName(true)}
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
                      Editar
                    </button>
                  )}
                </div>

                {isEditingName ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu nombre"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Apellido</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu apellido"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono de Contacto</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ingresa tu teléfono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ 
                          background: '#6d28d9'
                        }}
                        onMouseEnter={(e) => {
                          if (!saving) e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          if (!saving) e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={async () => {
                          setIsEditingName(false);
                          // Reload original values from backend
                          await loadUserProfile();
                        }}
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
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nombre</p>
                      <p className="text-base font-semibold text-gray-900">{firstName || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Apellido</p>
                      <p className="text-base font-semibold text-gray-900">{lastName || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Teléfono de Contacto</p>
                      <p className="text-base font-semibold text-gray-900">{phone || 'No especificado'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Direcciones */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-0">Direcciones</h2>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
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
                      Agregar Dirección
                    </button>
                  )}
                </div>

                {isAddingAddress && (
                  <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Dirección</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Dirección exacta</label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ej: Av. Principal 123, Mz A Lt 5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Departamento</label>
                        <select
                          value={newAddress.department}
                          onChange={async (e) => {
                            const dept = e.target.value;
                            setNewAddress({ ...newAddress, department: dept, province: '', district: '' });
                            await loadProvinces(dept);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Selecciona un departamento</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Provincia</label>
                        <select
                          value={newAddress.province}
                          onChange={async (e) => {
                            const prov = e.target.value;
                            setNewAddress({ ...newAddress, province: prov, district: '' });
                            await loadDistricts(newAddress.department, prov);
                          }}
                          disabled={!newAddress.department || loadingLocations}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Selecciona una provincia</option>
                          {provinces.map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Distrito</label>
                        <select
                          value={newAddress.district}
                          onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                          disabled={!newAddress.province || loadingLocations}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Selecciona un distrito</option>
                          {districts.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddAddress}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
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
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingAddress(false);
                          setNewAddress({ street: '', department: '', province: '', district: '' });
                          setProvinces([]);
                          setDistricts([]);
                        }}
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
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !isAddingAddress ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No tienes direcciones guardadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address, index) => (
                      <div key={address.id || index} className="p-4 bg-white rounded-lg border border-gray-200">
                        {editingAddressIndex === index ? (
                          <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Dirección exacta</label>
                                <input
                                  type="text"
                                  value={address.street}
                                  onChange={(e) => {
                                    const updated = [...addresses];
                                    updated[index] = { ...updated[index], street: e.target.value };
                                    setAddresses(updated);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Departamento</label>
                                <select
                                  value={address.department || ''}
                                  onChange={async (e) => {
                                    const dept = e.target.value;
                                    const updated = [...addresses];
                                    updated[index] = { ...updated[index], department: dept, province: '', district: '' };
                                    setAddresses(updated);
                                    await loadProvinces(dept);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">Selecciona un departamento</option>
                                  {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Provincia</label>
                                <select
                                  value={address.province || ''}
                                  onChange={async (e) => {
                                    const prov = e.target.value;
                                    const updated = [...addresses];
                                    updated[index] = { ...updated[index], province: prov, district: '' };
                                    setAddresses(updated);
                                    await loadDistricts(address.department, prov);
                                  }}
                                  disabled={!address.department || loadingLocations}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">Selecciona una provincia</option>
                                  {provinces.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Distrito</label>
                                <select
                                  value={address.district || ''}
                                  onChange={(e) => {
                                    const updated = [...addresses];
                                    updated[index] = { ...updated[index], district: e.target.value };
                                    setAddresses(updated);
                                  }}
                                  disabled={!address.province || loadingLocations}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">Selecciona un distrito</option>
                                  {districts.map(dist => (
                                    <option key={dist} value={dist}>{dist}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleUpdateAddress(address.id, addresses[index])}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                                style={{ 
                                  background: '#6d28d9'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                              >
                                Guardar
                              </button>
                              <button
                                onClick={async () => {
                                  setEditingAddressIndex(null);
                                  await loadUserProfile();
                                }}
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
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-base font-semibold text-gray-900 mb-1">{address.street}</p>
                              <p className="text-sm text-gray-600">
                                {address.district}, {address.province}, {address.department}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  setEditingAddressIndex(index);
                                  // Load provinces and districts for this address
                                  if (address.department) {
                                    await loadProvinces(address.department);
                                    if (address.province) {
                                      await loadDistricts(address.department, address.province);
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-sm font-medium bg-white rounded-lg transition-colors"
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
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white rounded-lg transition-colors"
                                style={{ 
                                  border: '1px solid #ef4444'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fee2e2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Información de Cuenta */}
              <div className="bg-gray-50 rounded-lg" style={{ padding: '28px' }}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-0">Información de Cuenta</h2>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Correo Electrónico</p>
                    <p className="text-base font-semibold text-gray-900">{userEmail || 'No disponible'}</p>
                  </div>

                  {/* Cambiar Contraseña */}
                  {!isChangingPassword ? (
                    <div>
                      <button
                        onClick={() => setIsChangingPassword(true)}
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
                        Cambiar Contraseña
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Contraseña Actual</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ingresa tu contraseña actual"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Nueva Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ingresa tu nueva contraseña"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Confirmar Nueva Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Confirma tu nueva contraseña"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleChangePassword}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                            style={{ 
                              background: '#6d28d9'
                            }}
                            onMouseEnter={(e) => {
                              if (!saving) e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                              if (!saving) e.currentTarget.style.opacity = '1';
                            }}
                          >
                            {saving ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
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
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
