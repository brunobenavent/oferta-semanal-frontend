import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Goodbye.css';

export default function Goodbye() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const goodbyeData = sessionStorage.getItem('goodbye');
    if (goodbyeData) {
      try {
        const { name: userName } = JSON.parse(goodbyeData);
        setName(userName || 'usuario');
        setVisible(true);
        sessionStorage.removeItem('goodbye');

        setTimeout(() => {
          setVisible(false);
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }, 2500);
      } catch (e) {
        console.error('Error parsing goodbye data:', e);
      }
    }
  }, [navigate]);

  if (!visible) return null;

  return (
    <div className="goodbye-modal-overlay">
      <div className="goodbye-modal-content">
        <div className="goodbye-modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.5 18A7 7 0 0 0 5 9l-1 10h14" />
            <circle cx="18" cy="18" r="4" />
            <circle cx="4" cy="9" r="4" />
          </svg>
        </div>
        <h2 className="goodbye-title">¡Hasta pronto!</h2>
        <p className="goodbye-message">Gracias por usar Oferta Semanal, {name}</p>
      </div>
    </div>
  );
}
