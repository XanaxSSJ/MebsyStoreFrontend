import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function ProfileDropdown({ isOpen, onClose, userEmail }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authAPI.logout();
      onClose();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aún así redirigir al login
      onClose();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="fixed top-16 right-4 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-200 flex flex-col z-50"
        style={{ width: 'fit-content' }}
      >
        {/* Menu Items */}
        <div style={{ padding: '10px 0' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/perfil');
            }}
            className="text-left py-3 text-base text-gray-900 hover:bg-gray-50 transition-colors font-medium whitespace-nowrap block w-full"
            style={{ letterSpacing: '0.01em', paddingLeft: '20px', paddingRight: '20px' }}
          >
            Perfil
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate('/ordenes');
            }}
            className="text-left py-3 text-base text-gray-900 hover:bg-gray-50 transition-colors font-medium whitespace-nowrap block w-full"
            style={{ letterSpacing: '0.01em', paddingLeft: '20px', paddingRight: '20px' }}
          >
            Órdenes
          </button>
          
          <button
            onClick={() => {
              onClose();
            }}
            className="text-left py-3 text-base text-gray-900 hover:bg-gray-50 transition-colors font-medium whitespace-nowrap block w-full"
            style={{ letterSpacing: '0.01em', paddingLeft: '20px', paddingRight: '20px' }}
          >
            Help & support
          </button>
          
          <div className="border-t border-gray-200 my-1" style={{ marginLeft: '20px', marginRight: '20px' }}></div>
          
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-left py-3 text-base text-red-600 hover:bg-red-50 transition-colors font-medium whitespace-nowrap block w-full disabled:opacity-50"
            style={{ letterSpacing: '0.01em', paddingLeft: '20px', paddingRight: '20px' }}
          >
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </div>
    </>
  );
}

export default ProfileDropdown;
