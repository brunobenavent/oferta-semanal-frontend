import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import './AuthPages.css';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState('loading'); // loading | success | error | already_verified
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-mount
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no proporcionado.');
      return;
    }

    api.get(`/auth/verify/${token}`, { params: { email } })
      .then(res => {
        if (res.data.alreadyVerified) {
          setStatus('already_verified');
          setMessage(res.data.message || 'El email ya estaba verificado.');
        } else {
          setStatus('success');
          setMessage(res.data.message || 'Email verificado correctamente.');
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Token inválido o expirado.');
      });
  }, [token, email]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && (
          <>
            <div className="auth-header">
              <h1>Verificando cuenta</h1>
            </div>
            <div className="auth-spinner">
              <div className="spinner" />
              <p>Verificando tu email...</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-header">
              <div className="verify-icon-container success">
                <CheckCircle size={40} />
              </div>
              <h1>Email verificado</h1>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              marginBottom: 'var(--space-lg)'
            }}>
              {message}
            </p>
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none' }}>
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="auth-header">
              <div className="verify-icon-container info">
                <Info size={40} />
              </div>
              <h1>Ya verificado</h1>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              marginBottom: 'var(--space-lg)'
            }}>
              {message}
            </p>
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none' }}>
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-header">
              <div className="verify-icon-container error">
                <XCircle size={40} />
              </div>
              <h1>Error de verificación</h1>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              marginBottom: 'var(--space-lg)'
            }}>
              {message}
            </p>
            <div className="auth-links auth-links-center">
              <Link to="/login">Volver a iniciar sesión</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
