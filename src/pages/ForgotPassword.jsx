import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, CheckCircle } from 'lucide-react';
import './AuthPages.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-success">
            <CheckCircle size={48} />
            <h2>Correo enviado</h2>
            <p>
              Si el correo <strong>{email}</strong> existe en nuestro sistema,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', marginTop: 'var(--space-md)' }}>
              Volver a iniciar sesión
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
          <Mail size={32} />
          <h1>Recuperar contraseña</h1>
          <p>Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-info" style={{ marginBottom: 0 }}>
            Si el correo existe, recibirás un enlace para restablecer tu contraseña.
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <div className="auth-links auth-links-center">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
