import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, CheckCircle } from 'lucide-react';
import './AuthPages.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperación no proporcionado. Asegúrate de usar el enlace completo del correo.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password, email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">
            <CheckCircle size={48} />
            <h2>Contraseña restablecida</h2>
            <p>Tu contraseña se ha actualizado correctamente.</p>
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', marginTop: 'var(--space-md)' }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Lock size={32} />
          <h1>Nueva contraseña</h1>
          <p>Elige una nueva contraseña para tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {email && (
            <div className="auth-info" style={{ marginBottom: 0 }}>
              Restableciendo contraseña para <strong>{email}</strong>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Actualizando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <div className="auth-links auth-links-center">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
