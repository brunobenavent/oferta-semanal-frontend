import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';
import './AuthPages.css';

export default function UserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { isSuperadminOrAdmin, createUser, fetchUsers, updateUserById, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    nombre: '',
    role: 'client',
    priceTier: 2,
    clientName: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(isEdit);
  const [isSuperadminUser, setIsSuperadminUser] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isSuperadminOrAdmin) {
      navigate('/');
      return;
    }
    if (isEdit && id) {
      loadUser();
    }
  }, [isSuperadminOrAdmin, id, isEdit, navigate, authLoading]);

  const loadUser = async () => {
    try {
      setLoadingUser(true);
      const data = await fetchUsers();
      const user = (data.users || data).find(u => u._id === id);
      if (user) {
        // Superadmin cannot be edited
        if (user.role === 'superadmin') {
          setIsSuperadminUser(true);
          setError('No puedes modificar al superadmin');
          setLoadingUser(false);
          return;
        }
        setForm({
          email: user.email || '',
          nombre: user.nombre || '',
          role: user.role || 'client',
          priceTier: user.priceTier || 2,
          clientName: user.clientName || '',
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      setError('Error al cargar usuario');
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await updateUserById(id, form);
      } else {
        await createUser(form);
      }
      navigate('/users');
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data?.error
        || 'Error al guardar usuario';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="auth-page">
        <div className="auth-spinner">
          <div className="spinner" />
          <p>Cargando usuario...</p>
        </div>
      </div>
    );
  }

  // Superadmin cannot be edited — show error with back button
  if (isSuperadminUser) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '520px' }}>
          <div className="auth-header">
            <UserPlus size={32} />
            <h1>Editar Usuario</h1>
          </div>
          <div className="auth-error">{error}</div>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="auth-btn"
            style={{ marginTop: 'var(--space-md)' }}
          >
            <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Volver a Usuarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          {isEdit ? <UserPlus size={32} /> : <UserPlus size={32} />}
          <h1>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
          <p>{isEdit ? 'Modifica los datos del usuario' : 'Crea un nuevo usuario en el sistema'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              required
              disabled={isEdit}
              placeholder="usuario@ejemplo.com"
            />
            {isEdit && (
              <span className="field-hint">El email no se puede modificar</span>
            )}
          </div>

          <div className="auth-field">
            <label>Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              required
              placeholder="Nombre completo"
            />
          </div>

          <div className="auth-field">
            <label>Rol</label>
            <select
              value={form.role}
              onChange={e => handleChange('role', e.target.value)}
              className="auth-select"
            >
              <option value="admin">Admin</option>
              <option value="employee">Empleado</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          {form.role === 'client' && (
            <>
              <div className="auth-field">
                <label>Tier de Precio</label>
                <select
                  value={form.priceTier}
                  onChange={e => handleChange('priceTier', parseInt(e.target.value))}
                  className="auth-select"
                >
                  <option value={2}>Precio 2</option>
                  <option value={3}>Precio 3</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Nombre del Cliente (Empresa)</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={e => handleChange('clientName', e.target.value)}
                  placeholder="Viveros Ejemplo S.L."
                />
                <span className="field-hint">Nombre de la empresa o cliente asociado</span>
              </div>
            </>
          )}

          {isEdit && (
            <div className="auth-field">
              <label className="toggle-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                <span className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => handleChange('isActive', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{form.isActive ? 'Activo' : 'Inactivo'}</span>
              </label>
              <span className="field-hint" style={{ marginTop: 4 }}>
                Si está inactivo, el usuario no podrá acceder al sistema
              </span>
            </div>
          )}

          {!isEdit && (
            <div className="auth-info" style={{ fontSize: '0.8125rem' }}>
              <Save size={16} />
              <span>Se enviará un email de verificación al nuevo usuario</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="auth-btn-secondary"
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              Cancelar
            </button>
            <button type="submit" className="auth-btn" disabled={saving} style={{ flex: 1, marginTop: 0, border: '1px solid transparent' }}>
              {saving ? (
                <>Guardando...</>
              ) : isEdit ? (
                <>Actualizar Usuario</>
              ) : (
                <>Crear Usuario</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
