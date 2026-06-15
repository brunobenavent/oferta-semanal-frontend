import { useState, useEffect } from 'react';
import api from '../api/axios';
import CommercialCard from '../components/CommercialCard';
import './Contacto.css';

export default function Contacto() {
  const [commercials, setCommercials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/commercials')
      .then(({ data }) => {
        setCommercials(data.commercials || data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error al cargar comerciales');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="contacto-page">
        <div className="contacto-header">
          <h1>Contacto Comercial</h1>
          <p>Ponte en contacto con nuestro equipo</p>
        </div>
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-circle" />
              <div className="skeleton-line" style={{ width: '55%', height: '16px', margin: '0 auto' }} />
              <div className="skeleton-line" style={{ width: '40%', height: '12px', margin: '8px auto 0' }} />
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div className="skeleton-line" style={{ width: '65%', height: '12px' }} />
                <div className="skeleton-line" style={{ width: '50%', height: '12px' }} />
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <div className="skeleton-flag" />
                <div className="skeleton-flag" />
                <div className="skeleton-flag" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contacto-page">
        <div className="contacto-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="contacto-page">
      <div className="contacto-header">
        <h1>Contacto Comercial</h1>
        <p>Ponte en contacto con nuestro equipo</p>
      </div>
      <div className="contacto-grid">
        {commercials.map(c => (
          <CommercialCard key={c._id} commercial={c} />
        ))}
      </div>
    </div>
  );
}
