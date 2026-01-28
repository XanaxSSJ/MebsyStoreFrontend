import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { userAPI } from '../../../services/user';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { useAddressesQuery } from '../hooks/useAddressesQuery';
import { useDepartmentsQuery, useProvincesQuery, useDistrictsQuery } from '../../locations/hooks/useLocationsQueries';

const EMPTY_ARRAY = [];

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    street: '',
    department: '',
    province: '',
    district: '',
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Queries
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery();

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useAddressesQuery();

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
  } = useDepartmentsQuery();

  const {
    data: provincesData,
    isLoading: provincesLoading,
  } = useProvincesQuery(addressForm.department);

  const {
    data: districtsData,
    isLoading: districtsLoading,
  } = useDistrictsQuery(addressForm.department, addressForm.province);

  const addresses = addressesData ?? EMPTY_ARRAY;
  const departments = departmentsData ?? EMPTY_ARRAY;
  const provinces = provincesData ?? EMPTY_ARRAY;
  const districts = districtsData ?? EMPTY_ARRAY;

  // Redirección a login si hay error 401
  useEffect(() => {
    const authError = profileError || addressesError;
    if (authError && (authError.message?.includes('401') || authError.message?.includes('Unauthorized'))) {
      navigate('/login');
    }
  }, [profileError, addressesError, navigate]);

  // Cargar datos del perfil en el formulario
  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Cargar datos de dirección en edición
  useEffect(() => {
    if (editingAddressId && addresses.length > 0) {
      const address = addresses.find((addr) => addr.id === editingAddressId);
      if (address) {
        setAddressForm({
          street: address.street || '',
          department: address.department || '',
          province: address.province || '',
          district: address.district || '',
        });
      }
    } else if (!editingAddressId) {
      // Reset form cuando no se está editando
      setAddressForm({
        street: '',
        department: '',
        province: '',
        district: '',
      });
    }
  }, [editingAddressId, addresses]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      });
      setSuccess('Perfil actualizado correctamente');
      // Refetch profile data
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setIsEditingProfile(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingAddressId) {
        await userAPI.updateAddress(editingAddressId, addressForm);
        setSuccess('Dirección actualizada correctamente');
      } else {
        await userAPI.createAddress(addressForm);
        setSuccess('Dirección creada correctamente');
      }
      // Refetch addresses
      await refetchAddresses();
      setEditingAddressId(null);
      setAddressForm({
        street: '',
        department: '',
        province: '',
        district: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al guardar dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await userAPI.deleteAddress(addressId);
      setSuccess('Dirección eliminada correctamente');
      // Refetch addresses
      await refetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setActiveTab('addresses');
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setAddressForm({
      street: '',
      department: '',
      province: '',
      district: '',
    });
  };

  const isLoading = profileLoading || addressesLoading || departmentsLoading;

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

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('profile');
                handleCancelEdit();
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => {
                setActiveTab('addresses');
                handleCancelEdit();
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'addresses'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Direcciones
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Cargando...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-0">Información Personal</h2>
                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 text-sm font-medium bg-white rounded-lg transition-colors"
                        style={{ border: '1px solid #8b5cf6', color: '#8b5cf6' }}
                      >
                        Editar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setError('');
                          setSuccess('');
                          if (profile) {
                            setProfileForm({
                              firstName: profile.firstName || '',
                              lastName: profile.lastName || '',
                              email: profile.email || '',
                              phone: profile.phone || '',
                            });
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium bg-white rounded-lg transition-colors"
                        style={{ border: '1px solid #8b5cf6', color: '#8b5cf6' }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nombre</p>
                        <p className="text-base font-semibold text-gray-900">
                          {profileForm.firstName || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Apellido</p>
                        <p className="text-base font-semibold text-gray-900">
                          {profileForm.lastName || 'No especificado'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Correo</p>
                        <p className="text-base font-semibold text-gray-900">
                          {profileForm.email || 'No disponible'}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                        <p className="text-base font-semibold text-gray-900">
                          {profileForm.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label htmlFor="firstName" className="form-label">
                            Nombre
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            className="form-input"
                            placeholder="Ingresa tu nombre"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="lastName" className="form-label">
                            Apellido
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            className="form-input"
                            placeholder="Ingresa tu apellido"
                          />
                        </div>

                        <div className="form-group sm:col-span-2">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            readOnly
                            disabled
                            className="form-input bg-gray-100 text-gray-500 cursor-not-allowed"
                            placeholder="tu@email.com"
                          />
                        </div>

                        <div className="form-group sm:col-span-2">
                          <label htmlFor="phone" className="form-label">
                            Teléfono
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={9}
                            value={profileForm.phone}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\\D/g, '').slice(0, 9);
                              setProfileForm({ ...profileForm, phone: digits });
                            }}
                            className="form-input"
                            placeholder="987654321"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: '#6d28d9' }}
                      >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              {/* Address Form */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingAddressId ? 'Editar Dirección' : 'Nueva Dirección'}
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-group">
                      <label htmlFor="street" className="form-label">
                        Calle
                      </label>
                      <input
                        id="street"
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                        className="form-input"
                        placeholder="Nombre de la calle"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label htmlFor="department" className="form-label">
                        Departamento
                      </label>
                      <select
                        id="department"
                        value={addressForm.department}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            department: e.target.value,
                            province: '',
                            district: '',
                          });
                        }}
                        required
                        className="form-input"
                        disabled={departmentsLoading}
                      >
                        <option value="">Seleccionar</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="province" className="form-label">
                        Provincia
                      </label>
                      <select
                        id="province"
                        value={addressForm.province}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            province: e.target.value,
                            district: '',
                          });
                        }}
                        required
                        className="form-input"
                        disabled={!addressForm.department || provincesLoading}
                      >
                        <option value="">Seleccionar</option>
                        {provinces.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="district" className="form-label">
                        Distrito
                      </label>
                      <select
                        id="district"
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        required
                        className="form-input"
                        disabled={!addressForm.province || districtsLoading}
                      >
                        <option value="">Seleccionar</option>
                        {districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: '#6d28d9' }}
                    >
                      {loading ? 'Guardando...' : editingAddressId ? 'Actualizar' : 'Crear Dirección'}
                    </button>
                    {editingAddressId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn btn-secondary text-sm font-medium bg-white rounded-lg transition-colors"
                        style={{ border: '1px solid #8b5cf6', color: '#8b5cf6' }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Addresses List */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mis Direcciones</h2>
                {addressesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando direcciones...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No tienes direcciones guardadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{address.street}</p>
                          <p className="text-sm text-gray-600">
                            {address.district}, {address.province}, {address.department}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProfilePage;
