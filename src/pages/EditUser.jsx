import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import UserForm from '../components/UserForm';
import { useToast } from '../components/Toast';
import './EditUser.css';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  // User is passed via React Router state from Users.jsx (no GET /users/:id endpoint)
  const [user, setUser] = useState(location.state?.user || null);
  const [commercials, setCommercials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const source = location.state?.source;
  const backUrl = source === 'clientes' ? '/clientes' : '/users';
  const backLabel = source === 'clientes' ? 'Volver a clientes' : 'Volver a usuarios';
  const pageMode = source || (user?.roles?.includes('client') || user?.role === 'client' ? 'clientes' : 'empleados');

  useEffect(() => {
    if (!user) {
      // State was lost (page refresh) — redirect back
      setError('Usuario no encontrado. Volvé a la lista e intentá de nuevo.');
      setLoading(false);
      return;
    }
    api.get('/commercials')
      .then(r => setCommercials(r.data?.commercials || []))
      .catch(() => setCommercials([]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="edit-user-page"><p className="edit-user-loading">Cargando...</p></div>;
  if (error || !user) return (
    <div className="edit-user-page">
      <div className="edit-user-error">
        <h2>{error || 'Usuario no encontrado'}</h2>
        <Link to={backUrl} className="auth-btn-secondary" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none' }}>{backLabel}</Link>
      </div>
    </div>
  );

  return (
    <div className="edit-user-page">
      <div className="edit-user-header">
        <Link to={backUrl} className="edit-user-back">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
        <h2>Editar Usuario</h2>
        <div />
      </div>
      <UserForm
        mode="edit"
        user={user}
        pageMode={pageMode}
        commercials={commercials}
        onSaved={() => {
          addToast('Usuario actualizado', 'success');
          navigate(backUrl);
        }}
        onCancel={() => navigate('/users')}
      />
    </div>
  );
}
