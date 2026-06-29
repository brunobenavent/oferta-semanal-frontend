import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users as UsersIcon, Search, X, RefreshCw, Trash, Pencil, UserCheck, Power, PowerOff, Plus } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import './AuthPages.css';

export default function UsersPage({ mode = 'empleados' }) {
  const { isSuperadminOrAdmin, isCommercial, isEmployee, fetchUsers, updateUserById, deleteUser, resendVerification, adminVerifyUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [commercials, setCommercials] = useState([]);

  // ── Unified form modal: null | 'add' ──
  const [formModal, setFormModal] = useState(null);

  // ── Delete modal ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canAccessEmpleados = isSuperadminOrAdmin || isEmployee || isCommercial;
  const canAccessClientes = isSuperadminOrAdmin || isCommercial;
  const canAccess = mode === 'clientes' ? canAccessClientes : canAccessEmpleados;

  useEffect(() => {
    if (authLoading) return;
    if (!canAccess) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [canAccess, navigate, authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data.users || data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Load commercials list for the multi-select in the form ──
  const loadCommercials = async () => {
    try {
      const { data } = await api.get('/commercials');
      const list = data.commercials || data || [];
      setCommercials(list);
    } catch (err) {
      console.error('Error loading commercials:', err);
    }
  };

  useEffect(() => {
    loadCommercials();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await updateUserById(user._id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u =>
        u._id === user._id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err) {
      console.error('Error toggling user active state:', err);
    }
  };

  const handleResendVerification = async (user) => {
    try {
      await resendVerification(user._id);
      alert('Correo de verificación reenviado');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al reenviar verificación');
    }
  };

  const handleAdminVerify = async (user) => {
    try {
      await adminVerifyUser(user._id);
      setUsers(prev => prev.map(u =>
        u._id === user._id ? { ...u, isVerified: true } : u
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al verificar usuario');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !deletePassword) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteUser(deleteTarget._id, deletePassword);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
      setDeletePassword('');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSaved = () => {
    setFormModal(null);
    loadUsers();
  };

  const filteredUsers = users.filter(u => {
    // Pre-filter by mode
    const userRoles = u.roles || [u.role || 'client'];
    if (mode === 'clientes' && !userRoles.includes('client')) return false;
    if (mode === 'empleados' && userRoles.includes('client')) return false;

    const matchesSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nombre?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (roleFilter === 'all') return true;
    if (roleFilter === 'admin') return userRoles.includes('admin') || userRoles.includes('superadmin');
    if (roleFilter === 'employee') return userRoles.includes('employee');
    if (roleFilter === 'commercial') return userRoles.includes('commercial');
    if (roleFilter === 'client-tier2') return userRoles.includes('client') && u.priceTier === 2;
    if (roleFilter === 'client-tier3') return userRoles.includes('client') && u.priceTier === 3;
    return true;
  });

  const roleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin': return 'role-badge--superadmin';
      case 'admin': return 'role-badge--admin';
      case 'employee': return 'role-badge--employee';
      case 'commercial': return 'role-badge--commercial';
      case 'client': return 'role-badge--client';
      default: return 'role-badge--default';
    }
  };

  const roleLabel = (role) => {
    switch (role) {
      case 'superadmin': return 'Superadmin';
      case 'admin': return 'Admin';
      case 'employee': return 'Empleado';
      case 'client': return 'Cliente';
      case 'commercial': return 'Comercial';
      default: return role;
    }
  };

  const renderAssignedCommercials = (user) => {
    if (!user.assignedCommercials || !Array.isArray(user.assignedCommercials) || user.assignedCommercials.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }
    const names = user.assignedCommercials.map(c => {
      if (typeof c === 'object' && c.nombre) return c.nombre;
      const found = commercials.find(com => com._id === c);
      return found ? (found.nombre || found.name) : null;
    }).filter(Boolean);
    if (names.length === 0) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {names.map((name, i) => (
          <span key={i} className="role-badge role-badge--commercial" style={{ fontSize: '0.75rem' }}>
            {name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
        <div className="auth-header">
          <UsersIcon size={32} />
          <h1>{mode === 'clientes' ? 'Clientes' : 'Empleados'}</h1>
          <p>{mode === 'clientes' ? 'Gestiona los clientes del sistema' : 'Gestiona los empleados del sistema'}</p>
        </div>

        <div className="users-content">
        {/* ── Toolbar: search + actions ── */}
        <div className="users-toolbar">
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 4
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            <button
              onClick={loadUsers}
              className="auth-btn-secondary"
              style={{
                width: 'auto',
                padding: '8px 12px',
                display: 'inline-flex',
                fontSize: '0.8125rem'
              }}
              title="Recargar"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setFormModal('add')}
              className="auth-btn"
              style={{
                display: 'inline-flex',
                width: 'auto',
                padding: '8px 16px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                marginTop: 0
              }}
            >
              <Plus size={16} />
              Nuevo
            </button>
          </div>
        </div>

        {/* ── Role tabs ── */}
        <div className="role-tabs">
          {(mode === 'clientes'
            ? [
                { key: 'all', label: 'Todos' },
                { key: 'client-tier2', label: 'T2' },
                { key: 'client-tier3', label: 'T3' },
              ]
            : [
                { key: 'all', label: 'Todos' },
                { key: 'admin', label: 'Administradores' },
                { key: 'employee', label: 'Empleados' },
                { key: 'commercial', label: 'Comerciales' },
              ]
          ).map(tab => {
            const count = tab.key === 'all'
              ? users.length
              : tab.key === 'admin'
                ? users.filter(u => (u.roles || [u.role]).includes('admin') || (u.roles || [u.role]).includes('superadmin')).length
                : tab.key === 'employee'
                  ? users.filter(u => (u.roles || [u.role]).includes('employee')).length
                  : tab.key === 'client-tier2'
                    ? users.filter(u => (u.roles || [u.role]).includes('client') && u.priceTier === 2).length
                    : tab.key === 'client-tier3'
                      ? users.filter(u => (u.roles || [u.role]).includes('client') && u.priceTier === 3).length
                      : users.filter(u => (u.roles || [u.role]).includes('commercial')).length;

            return (
              <button
                key={tab.key}
                className={`role-tab${roleFilter === tab.key ? ' role-tab--active' : ''}`}
                onClick={() => setRoleFilter(tab.key)}
              >
                {tab.label}
                <span className="role-tab__count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <>
            <div className="users-table">
              <table key={mode}>
                <colgroup>
                  <col className="col-foto" />
                  <col className="col-nombre" />
                  <col className="col-email" />
                  {mode === 'empleados' && <col className="col-rol" />}
                  <col className="col-telefono" />
                  {mode === 'empleados' && <col className="col-puesto" />}
                  {mode === 'empleados' && <col className="col-idiomas" />}
                  {mode === 'clientes' && <col className="col-cif" />}
                  {mode === 'clientes' && <col className="col-autorizado" />}
                  {mode === 'clientes' && <col className="col-comerciales" />}
                  {mode === 'clientes' && <col className="col-tarifa" />}
                  <col className="col-estado" />
                  <col className="col-acciones" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>{mode === 'clientes' ? 'Empresa' : 'Nombre'}</th>
                    <th>Email</th>
                    {mode === 'empleados' && <th>Rol</th>}
                    <th>Teléfono</th>
                    {mode === 'empleados' && <th>Puesto</th>}
                    {mode === 'empleados' && <th>Idiomas</th>}
                    {mode === 'clientes' && <th>CIF</th>}
                    {mode === 'clientes' && <th>Autorizado</th>}
                    {mode === 'clientes' && <th>Comerciales</th>}
                    {mode === 'clientes' && <th>Tarifa</th>}
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td><div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} /></td>
                      <td><div className="skeleton" style={{ width: 100, height: 16, borderRadius: 4 }} /></td>
                      <td><div className="skeleton" style={{ width: 160, height: 16, borderRadius: 4 }} /></td>
                      {mode === 'empleados' && <td><div className="skeleton" style={{ width: 70, height: 22, borderRadius: 999 }} /></td>}
                      <td><div className="skeleton" style={{ width: 100, height: 16, borderRadius: 4 }} /></td>
                      {mode === 'empleados' && <td><div className="skeleton" style={{ width: 90, height: 16, borderRadius: 4 }} /></td>}
                      {mode === 'empleados' && <td><div className="skeleton" style={{ width: 60, height: 16, borderRadius: 4 }} /></td>}
                      {mode === 'clientes' && <td><div className="skeleton" style={{ width: 80, height: 16, borderRadius: 4 }} /></td>}
                      {mode === 'clientes' && <td><div className="skeleton" style={{ width: 110, height: 16, borderRadius: 4 }} /></td>}
                      {mode === 'clientes' && <td><div className="skeleton" style={{ width: 100, height: 16, borderRadius: 4 }} /></td>}
                      {mode === 'clientes' && <td><div className="skeleton" style={{ width: 50, height: 16, borderRadius: 4 }} /></td>}
                      <td><div className="skeleton" style={{ width: 60, height: 16, borderRadius: 4 }} /></td>
                      <td><div className="skeleton" style={{ width: 130, height: 32, borderRadius: 6 }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="users-cards">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="user-card">
                  <div className="user-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 4 }} />
                    </div>
                    <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 999 }} />
                  </div>
                    <div className="user-card-body">
                      <div className="skeleton" style={{ width: '60%', height: 14, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: '50%', height: 14, borderRadius: 4 }} />
                    </div>
                  <div className="user-card-actions">
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="users-table">
              <table key={mode}>
                <colgroup>
                  <col className="col-foto" />
                  <col className="col-nombre" />
                  <col className="col-email" />
                  {mode === 'empleados' && <col className="col-rol" />}
                  <col className="col-telefono" />
                  {mode === 'empleados' && <col className="col-puesto" />}
                  {mode === 'empleados' && <col className="col-idiomas" />}
                  {mode === 'clientes' && <col className="col-cif" />}
                  {mode === 'clientes' && <col className="col-autorizado" />}
                  {mode === 'clientes' && <col className="col-comerciales" />}
                  {mode === 'clientes' && <col className="col-tarifa" />}
                  <col className="col-estado" />
                  <col className="col-acciones" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>{mode === 'clientes' ? 'Empresa' : 'Nombre'}</th>
                    <th>Email</th>
                    {mode === 'empleados' && <th>Rol</th>}
                    <th>Teléfono</th>
                    {mode === 'empleados' && <th>Puesto</th>}
                    {mode === 'empleados' && <th>Idiomas</th>}
                    {mode === 'clientes' && <th>CIF</th>}
                    {mode === 'clientes' && <th>Autorizado</th>}
                    {mode === 'clientes' && <th>Comerciales</th>}
                    {mode === 'clientes' && <th>Tarifa</th>}
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={mode === 'clientes' ? 10 : 9} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                        {search ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr
                        key={u._id}
                        onClick={() => navigate(`/users/${u._id || u.id}/edit`, { state: { user: u, source: mode } })}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt={u.nombre || u.name}
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', maxWidth: 'none' }}
                            />
                          ) : (
                            <span style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'var(--color-surface)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color: 'var(--color-text-muted)',
                            }}>
                              {(u.nombre || u.name || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>{mode === 'clientes' ? (u.clientName || '—') : (u.nombre || u.name || '—')}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '—'}</td>
                        {mode === 'empleados' && (
                          <td>
                            {(u.roles || [u.role || 'client'])
                              .sort((a, b) => ['superadmin','admin','commercial','employee','client'].indexOf(a) - ['superadmin','admin','commercial','employee','client'].indexOf(b))
                              .map(r => (
                                <span key={r} className={`role-badge ${roleBadgeClass(r)}`} style={{ marginRight: 4 }}>
                                  {roleLabel(r)}
                                </span>
                              ))}
                          </td>
                        )}
                        <td style={{ whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                        {mode === 'empleados' && <td>{u.position || '—'}</td>}
                        {mode === 'clientes' && <td>{u.cif ? u.cif : '—'}</td>}
                        {mode === 'empleados' && (
                          <td>
                            {u.languages && u.languages.length > 0 ? (
                              <div style={{ display: 'flex', gap: 4 }}>
                                {u.languages.map(lang => (
                                  <span
                                    key={lang.code}
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#fff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    }}
                                  >
                                    <span
                                      className={`fi fi-${lang.code}`}
                                      style={{ fontSize: 16, lineHeight: 1, transform: 'scale(1.6)', display: 'inline-block' }}
                                    />
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                            )}
                          </td>
                        )}
                        {mode === 'clientes' && (
                          <td>{u.authorizedName ? u.authorizedName : '—'}</td>
                        )}
                        {mode === 'clientes' && <td>{renderAssignedCommercials(u)}</td>}
                        {mode === 'clientes' && <td><strong>T{u.priceTier || 2}</strong></td>}
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.8125rem',
                            color: !u.isActive ? 'var(--color-text-muted)' : u.isVerified ? 'var(--color-success)' : 'var(--color-warning)'
                          }}>
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: !u.isActive ? 'var(--color-text-muted)' : u.isVerified ? 'var(--color-success)' : 'var(--color-warning)',
                              display: 'inline-block'
                            }} />
                            {!u.isActive ? 'Inactivo' : u.isVerified ? 'Activo' : 'Pendiente'}
                          </span>
                        </td>
                        <td>
                          <div className="user-actions">
                            {!(u.roles || [u.role]).includes('superadmin') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/users/${u._id || u.id}/edit`, { state: { user: u, source: mode } }); }}
                                className="user-action-btn"
                                title="Editar"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            {!(u.roles || [u.role]).includes('superadmin') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleActive(u); }}
                                className={`user-action-btn ${!u.isActive ? 'user-action-btn--success' : ''}`}
                                title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {u.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                              </button>
                            )}
                            {!u.isVerified && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAdminVerify(u); }}
                                  className="user-action-btn user-action-btn--success"
                                  title="Verificar usuario"
                                >
                                  <UserCheck size={15} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleResendVerification(u); }}
                                  className="user-action-btn"
                                  title="Reenviar verificación"
                                >
                                  <RefreshCw size={15} />
                                </button>
                              </>
                            )}
                            {!(u.roles || [u.role]).includes('superadmin') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                                className="user-action-btn user-action-btn--danger"
                                title="Eliminar permanentemente"
                              >
                                <Trash size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="users-cards">
              {filteredUsers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </p>
              ) : (
                filteredUsers.map(u => (
                  <div key={u._id} className="user-card">
                    <div className="user-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        {u.photo ? (
                          <img src={u.photo} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', maxWidth: 'none' }} />
                        ) : (
                          <span style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--color-surface)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--color-text-muted)',
                          }}>
                            {(u.nombre || u.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                        <strong>{u.nombre || u.name || 'Sin nombre'}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(u.roles || [u.role || 'client'])
                          .sort((a, b) => ['superadmin','admin','commercial','employee','client'].indexOf(a) - ['superadmin','admin','commercial','employee','client'].indexOf(b))
                          .map(r => (
                            <span key={r} className={`role-badge ${roleBadgeClass(r)}`}>
                              {roleLabel(r)}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="user-card-body">
                      <p>{u.email || '—'}</p>
                      {u.phone && <p>Tel: {u.phone}</p>}
                      {u.position && !(u.roles || [u.role]).includes('client') && <p>Puesto: {u.position}</p>}
                      {(u.roles || [u.role]).includes('client') && <p>Cliente: {u.clientName || '—'} (<strong>T{u.priceTier || 2}</strong>)</p>}
                      {(u.roles || [u.role]).includes('client') && u.cif && <p>CIF: {u.cif}</p>}
                      {(u.roles || [u.role]).includes('client') && u.taxAddress && <p>Dir. Fiscal: {u.taxAddress}</p>}
                      {(u.roles || [u.role]).includes('client') && u.authorizedName && <p>Autorizado: {u.authorizedName}</p>}
                      {(u.roles || [u.role]).includes('client') && u.assignedCommercials && Array.isArray(u.assignedCommercials) && u.assignedCommercials.length > 0 && (
                        <p>
                          Comerciales:{' '}
                          {u.assignedCommercials.map(c => {
                            if (typeof c === 'object' && c.nombre) return c.nombre;
                            const found = commercials.find(com => com._id === c);
                            return found ? (found.nombre || found.name) : null;
                          }).filter(Boolean).join(', ')}
                        </p>
                      )}
                      {u.languages && u.languages.length > 0 && !(u.roles || [u.role]).includes('client') && (
                        <p>Idiomas: {u.languages.map(l => l.name).join(', ')}</p>
                      )}
                      <p>
                        Estado:{' '}
                        <span style={{
                          color: !u.isActive ? 'var(--color-text-muted)' : u.isVerified ? 'var(--color-success)' : 'var(--color-warning)',
                          fontWeight: 500
                        }}>
                          {!u.isActive ? 'Inactivo' : u.isVerified ? 'Activo' : 'Pendiente'}
                        </span>
                      </p>
                    </div>
                    <div className="user-card-actions">
                      {!(u.roles || [u.role]).includes('superadmin') && (
                        <button
                        onClick={() => navigate(`/users/${u._id || u.id}/edit`, { state: { user: u, source: mode } })}
                          className="user-action-btn"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {!(u.roles || [u.role]).includes('superadmin') && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`user-action-btn ${!u.isActive ? 'user-action-btn--success' : ''}`}
                          title={u.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                      )}
                      {!u.isVerified && (
                        <>
                          <button
                            onClick={() => handleAdminVerify(u)}
                            className="user-action-btn user-action-btn--success"
                            title="Verificar usuario"
                          >
                            <UserCheck size={15} />
                          </button>
                          <button
                            onClick={() => handleResendVerification(u)}
                            className="user-action-btn"
                            title="Reenviar verificación"
                          >
                            <RefreshCw size={15} />
                          </button>
                        </>
                      )}
                      {!(u.roles || [u.role]).includes('superadmin') && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="user-action-btn user-action-btn--danger"
                          title="Eliminar permanentemente"
                        >
                          <Trash size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        </div>

      {/* ── UserFormModal (add only) ── */}
      {formModal === 'add' && (
        <UserFormModal
          pageMode={mode}
          mode="add"
          user={null}
          onClose={() => setFormModal(null)}
          onSaved={handleFormSaved}
          commercials={commercials}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 'var(--space-md)'
        }}
          onClick={() => { setDeleteTarget(null); setDeletePassword(''); setDeleteError(''); }}
        >
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            maxWidth: 420,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 var(--space-sm)', fontSize: '1.125rem' }}>Eliminar usuario</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-md)' }}>
              ¿Eliminar permanentemente a <strong>{deleteTarget.nombre}</strong> ({deleteTarget.email})?
              Esta acción no se puede deshacer.
            </p>
            <div style={{ marginBottom: 'var(--space-sm)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                Tu contraseña para confirmar
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${deleteError ? '#dc2626' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  outline: 'none'
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleDeleteConfirm(); }}
              />
              {deleteError && (
                <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: '4px 0 0' }}>{deleteError}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDeleteTarget(null); setDeletePassword(''); setDeleteError(''); }}
                className="auth-btn-secondary"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!deletePassword || deleting}
                className="auth-btn"
                style={{
                  width: 'auto',
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  background: '#dc2626',
                  opacity: (!deletePassword || deleting) ? 0.6 : 1
                }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
