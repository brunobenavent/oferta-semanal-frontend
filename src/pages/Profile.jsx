import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User, Shield, ShieldCheck, BadgeCheck, Briefcase, Mail, DollarSign, Store,
  FileText, Lock, CheckCircle2, Camera, Crop, MapPin,
} from 'lucide-react';
import PhotoCropOverlay from '../components/PhotoCropOverlay';
import './AuthPages.css';

const roleLabels = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  employee: 'Empleado',
};

const priceTierLabels = {
  1: 'T1',
  2: 'T2',
  3: 'T3',
};

export default function Profile() {
  const { user, isSuperadmin, isAdmin, isEmployee, changePassword, verifyMe, updateUser } = useAuth();

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ── Photo state ──
  const [cropFile, setCropFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [cropInitialZoom, setCropInitialZoom] = useState(1);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const initialized = useRef(false);

  // Set initial photo state once on mount
  useEffect(() => {
    if (user && !initialized.current) {
      const photo = user.photo || null;
      setPreviewUrl(photo);
      setOriginalPhotoUrl(photo);
      initialized.current = true;
    }
  }, [user]);

  if (!user) return null;

  const roleLabel = roleLabels[user.role] || user.role;
  const roleBadgeClass = isSuperadmin
    ? 'role-badge--superadmin'
    : isAdmin
      ? 'role-badge--admin'
      : isEmployee
        ? 'role-badge--employee'
        : 'role-badge--default';

  // ── Handlers ──────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageUrl(url);
    setCropInitialZoom(1);
    setShowCrop(true);
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile) => {
    // Revoke previous preview blob
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const blobUrl = URL.createObjectURL(croppedFile);
    setCropFile(croppedFile);
    setPreviewUrl(blobUrl);
    setShowCrop(false);
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  const handleAdjustPhoto = () => {
    if (previewUrl) {
      setCropImageUrl(previewUrl);
      setCropInitialZoom(1);
      setShowCrop(true);
    }
  };

  const handleRestoreOriginal = () => {
    if (!originalPhotoUrl) return;
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(originalPhotoUrl);
    setCropFile(null);
  };

  const handleSavePhoto = async () => {
    if (!cropFile) return;

    setPhotoSaving(true);
    setPhotoMsg('');
    try {
      const fd = new FormData();
      fd.append('photo', cropFile);
      const { data } = await api.post('/auth/me/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update local state
      setPreviewUrl(data.photo);
      setCropFile(null);
      // Set originalPhotoUrl on first upload so "Ajustar"/"Restaurar" work
      if (!originalPhotoUrl) setOriginalPhotoUrl(data.photo);

      // Update context so header reflects the change immediately
      updateUser({ photo: data.photo });

      setPhotoMsg('Foto actualizada correctamente');
      setTimeout(() => setPhotoMsg(''), 3000);
    } catch (err) {
      setPhotoMsg(err.response?.data?.message || 'Error al guardar la foto');
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCropFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    setSuccess('');
    try {
      await verifyMe();
      setSuccess('Email verificado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el email');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {/* Crop overlay */}
      {showCrop && cropImageUrl && (
        <PhotoCropOverlay
          imageUrl={cropImageUrl}
          initialZoom={cropInitialZoom}
          onCancel={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}

      <div className="profile-page">
        <div className="profile-card">
          {/* ── Header with photo ── */}
          <div className="profile-header">
            <div className="profile-avatar" style={{ position: 'relative' }}>
              {previewUrl ? (
                <div style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12)) drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
                }}>
                  <img
                    src={previewUrl}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ) : (
                <User size={28} />
              )}
            </div>
            <div className="profile-info">
              <h2>{user.nombre || 'Usuario'}</h2>
              <p>{user.email}</p>
            </div>
          </div>

          {/* ── Photo actions ── */}
          <div style={{
            padding: '0 0 var(--space-md)',
            borderBottom: '1px solid var(--color-border-light)',
            marginBottom: 'var(--space-md)',
          }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#fff',
                transition: 'all var(--transition-fast)',
              }}>
                <Camera size={15} />
                {previewUrl ? 'Cambiar foto' : 'Seleccionar imagen'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {previewUrl && originalPhotoUrl && (
                <button
                  onClick={handleAdjustPhoto}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Crop size={15} />
                  Ajustar
                </button>
              )}

              {originalPhotoUrl && (cropFile !== null || previewUrl === null) && (
                <button
                  onClick={handleRestoreOriginal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Crop size={15} />
                  Restaurar original
                </button>
              )}

              {previewUrl && (
                <button
                  onClick={handleRemovePhoto}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '4px 0',
                    textDecoration: 'underline',
                  }}
                >
                  Quitar foto
                </button>
              )}
            </div>

            {/* Save button + messages */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              {cropFile && (
                <button
                  onClick={handleSavePhoto}
                  disabled={photoSaving}
                  className="auth-btn"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.8125rem',
                    margin: 0,
                    opacity: photoSaving ? 0.6 : 1,
                  }}
                >
                  {photoSaving ? 'Guardando...' : 'Guardar foto'}
                </button>
              )}

              {photoMsg && (
                <span style={{
                  fontSize: '0.8125rem',
                  color: photoMsg.includes('correctamente') ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                  {photoMsg}
                </span>
              )}
            </div>
          </div>

          {/* ── Profile details ── */}
          <div className="profile-details">
            <div className="profile-row">
              <span className="profile-label">
                <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Email
              </span>
              <span className="profile-value">{user.email}</span>
            </div>

            <div className="profile-row">
              <span className="profile-label">
                {isSuperadmin ? (
                  <ShieldCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                ) : (
                  <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                )}
                Rol
              </span>
              <span className="profile-value">
                <span className={`role-badge ${roleBadgeClass}`}>
                  {roleLabel}
                </span>
              </span>
            </div>

            {user.isVerified !== undefined && (
              <div className="profile-row">
                <span className="profile-label">
                  <BadgeCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Email verificado
                </span>
                <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    color: user.isVerified ? 'var(--color-success)' : 'var(--color-warning)',
                    fontWeight: 600,
                    fontSize: '0.8125rem'
                  }}>
                    {user.isVerified ? 'Sí' : 'No'}
                  </span>
                  {!user.isVerified && (
                    <button
                      onClick={handleVerify}
                      disabled={verifying}
                      style={{
                        padding: '2px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        color: 'white',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: verifying ? 0.6 : 1,
                      }}
                    >
                      {verifying ? 'Verificando...' : 'Verificar'}
                    </button>
                  )}
                </span>
              </div>
            )}

            {user.role === 'client' && user.priceTier && (
              <div className="profile-row">
                <span className="profile-label">
                  <DollarSign size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Precio
                </span>
                <span className="profile-value">
                  {priceTierLabels[user.priceTier] || `Tier ${user.priceTier}`}
                </span>
              </div>
            )}

            {user.clientName && (
              <div className="profile-row">
                <span className="profile-label">
                  <Store size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Cliente
                </span>
                <span className="profile-value">{user.clientName}</span>
              </div>
            )}

            {user.role === 'client' && (user.cif || user.taxAddress) && (
              <>
                <div className="section-divider" />
                <h3 style={{
                  fontFamily: "'Archivo Narrow', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  margin: '0 0 var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  Información Fiscal
                </h3>
                {user.cif && (
                  <div className="profile-row">
                    <span className="profile-label">
                      <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      CIF / NIF
                    </span>
                    <span className="profile-value">{user.cif}</span>
                  </div>
                )}
                {user.taxAddress && (
                  <div className="profile-row">
                    <span className="profile-label">
                      <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Dirección Fiscal
                    </span>
                    <span className="profile-value">{user.taxAddress}</span>
                  </div>
                )}
              </>
            )}

            {user.role === 'client' && (user.authorizedName || user.authorizedPosition || user.authorizedEmail) && (
              <>
                <div className="section-divider" />
                <h3 style={{
                  fontFamily: "'Archivo Narrow', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  margin: '0 0 var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  Persona Autorizada
                </h3>
                {user.authorizedName && (
                  <div className="profile-row">
                    <span className="profile-label">
                      <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Nombre
                    </span>
                    <span className="profile-value">{user.authorizedName}</span>
                  </div>
                )}
                {user.authorizedPosition && (
                  <div className="profile-row">
                    <span className="profile-label">
                      <Briefcase size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Puesto
                    </span>
                    <span className="profile-value">{user.authorizedPosition}</span>
                  </div>
                )}
                {user.authorizedEmail && (
                  <div className="profile-row">
                    <span className="profile-label">
                      <Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Email
                    </span>
                    <span className="profile-value">{user.authorizedEmail}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Password change ── */}
          <div className="profile-actions">
            <h3 style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              margin: '0 0 var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Lock size={16} />
              Cambiar contraseña
            </h3>

            <form onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}
              {success && (
                <div className="auth-success" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.875rem',
                  color: 'var(--color-success)',
                  marginBottom: 'var(--space-md)',
                  padding: '10px 12px',
                  background: 'rgba(22, 163, 74, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(22, 163, 74, 0.2)',
                }}>
                  <CheckCircle2 size={18} />
                  {success}
                </div>
              )}

              <div className="auth-field">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  autoComplete="current-password"
                />
              </div>

              <div className="auth-field">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-field">
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="auth-btn"
                disabled={saving}
                style={{ marginTop: 'var(--space-sm)' }}
              >
                {saving ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
