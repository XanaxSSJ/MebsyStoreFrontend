import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

function ProfileDropdown({ isOpen, onClose, userEmail }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    setAuthToken(null);
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={dropdownRef}
        className="fixed top-16 right-4 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-200 flex flex-col z-50"
      >
        {/* Header */}
        <div className="border-b border-gray-200 flex items-center justify-between" style={{ padding: '10px 20px' }}>
          <h2 className="text-lg font-semibold text-gray-900 m-0 leading-tight">Mi Perfil</h2>
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
            aria-label="Cerrar perfil"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '8px 20px 14px' }}>
          <div className="py-2">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dashed border-gray-200">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{userEmail || 'Usuario'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Mi cuenta</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                onClose();
                navigate('/perfil');
              }}
              className="w-full text-left py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3 rounded-lg px-2"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Ver Perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 rounded-lg px-2"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileDropdown;
