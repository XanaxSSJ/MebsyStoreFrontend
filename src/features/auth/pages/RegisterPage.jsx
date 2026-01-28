import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../../services/auth';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center container section-sm">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="text-center mb-xl">
              <h1 className="mb-sm">Crear Cuenta</h1>
              <p className="text-secondary">Únete a nosotros</p>
            </div>

            {error && (
              <div className="alert alert-error mb-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-lg">
                <p className="text-sm">
                  ¡Registro exitoso! Redirigiendo al login...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                />
                <span className="form-help">La contraseña debe tener al menos 8 caracteres</span>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Confirma tu contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="btn btn-primary w-full"
              >
                {loading ? 'Registrando...' : success ? '¡Registrado!' : 'Registrarse'}
              </button>
            </form>

            <div className="mt-xl text-center">
              <p className="text-sm text-secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

