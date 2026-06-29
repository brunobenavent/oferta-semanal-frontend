import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import UserForm from '../components/UserForm';
import { useToast } from '../components/Toast';
import './EditUser.css';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [commercials, setCommercials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`).then(r => r.data?.user || r.data),
      api.get('/commercials').then(r => r.data?.commercials || [])
    ]).then(([userData, commList]) => {
      setUser(userData);
      setCommercials(commList);
      setLoading(false);
    }).catch(err => {
      setError('Usuario no encontrado');
      setLoading(false);
    });
  }, [id]);

  const pageMode = user?.roles?.includes('client') || user?.role === 'client' ? 'clientes' : 'empleados';

  if (loading) return <div className="edit-user-page"><p className="edit-user-loading">Cargando...</p></div>;
  if (error || !user) return (
    <div className="edit-user-page">
      <div className="edit-user-error">
        <h2>{error || 'Usuario no encontrado'}</h2>
        <Link to="/users" className="auth-btn-secondary" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none' }}>Volver a usuarios</Link>
      </div>
    </div>
  );

  return (
    <div className="edit-user-page">
      <div className="edit-user-header">
        <Link to="/users" className="edit-user-back">
          <ArrowLeft size={16} /> Volver a usuarios
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
          navigate('/users');
        }}
        onCancel={() => navigate('/users')}
      />
    </div>
  );
}
