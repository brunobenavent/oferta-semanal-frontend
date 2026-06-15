import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, Building2, Save, ArrowLeft, Camera, Crop } from 'lucide-react';
import PhotoCropOverlay from './PhotoCropOverlay';

const LANGUAGE_NAMES = {
  es: 'Español', gb: 'Inglés', de: 'Alemán', fr: 'Francés',
  it: 'Italiano', pt: 'Portugués', dk: 'Danés', nl: 'Neerlandés',
  cn: 'Chino', jp: 'Japonés', ru: 'Ruso', sa: 'Árabe',
};
const NAME_TO_CODE = Object.fromEntries(
  Object.entries(LANGUAGE_NAMES).map(([code, name]) => [name.toLowerCase(), code])
);

const emptyForm = {
  email: '', nombre: '', role: 'client', priceTier: 2, clientName: '',
  phone: '', position: '', languages: '', isActive: true,
};

export default function UserFormModal({ mode, user, onClose, onSaved }) {
  const { createUser, updateUserById, fetchUsers } = useAuth();
  const isEdit = mode === 'edit';

  const [formType, setFormType] = useState('user'); // 'user' | 'commercial'
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Photo state
  const [cropFile, setCropFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [cropInitialZoom, setCropInitialZoom] = useState(1);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState(null);

  // ── Init ──────────────────────────────────────────────────────

  useEffect(() => {
    if (isEdit && user) {
      setFormType(user.role === 'commercial' ? 'commercial' : 'user');
      setForm({
        email: user.email || '',
        nombre: user.nombre || user.name || '',
        role: user.role || 'client',
        priceTier: user.priceTier || 2,
        clientName: user.clientName || '',
        phone: user.phone || '',
        position: user.position || '',
        languages: (user.languages || []).map(l => l.name).join(', '),
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
      if (user.photo) {
        setPreviewUrl(user.photo);
        setOriginalPhotoUrl(user.photo);
      }
    }
  }, [isEdit, user]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('[UserFormModal] File selected:', file.name, file.type, file.size);
    const url = URL.createObjectURL(file);
    console.log('[UserFormModal] Blob URL:', url);
    setCropImageUrl(url);
    setCropInitialZoom(1);
    setShowCrop(true);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile) => {
    console.log('[UserFormModal] Crop complete, file:', croppedFile.size, 'bytes, type:', croppedFile.type);
    // Revoke previous preview blob to avoid leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const blobUrl = URL.createObjectURL(croppedFile);
    console.log('[UserFormModal] Preview blob URL:', blobUrl);
    setCropFile(croppedFile);
    setPreviewUrl(blobUrl);
    setShowCrop(false);
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  const handleRestoreOriginal = () => {
    if (!originalPhotoUrl) return;
    console.log('[UserFormModal] Restoring original photo:', originalPhotoUrl);
    // Revoke blob preview if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(originalPhotoUrl);
    setCropFile(null);
  };

  const handleCropCancel = () => {
    setShowCrop(false);
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  const handleAdjustPhoto = () => {
    // Open the current preview in the crop overlay to adjust zoom/position
    if (previewUrl) {
      setCropImageUrl(previewUrl);
      setCropInitialZoom(1);
      setShowCrop(true);
    }
  };

  const parseLanguages = () => {
    return form.languages
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => {
        const normalized = name.toLowerCase();
        const found = NAME_TO_CODE[normalized];
        return found
          ? { code: found, name: LANGUAGE_NAMES[found] }
          : { code: normalized, name };
      });
  };

  const uploadPhoto = async (userId) => {
    if (!cropFile) return;
    const fd = new FormData();
    fd.append('photo', cropFile);
    await api.post(`/auth/users/${userId}/photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleSave = async () => {
    if (!form.nombre) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!form.email) {
      setError('El email es obligatorio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const languages = form.role === 'commercial' ? parseLanguages() : [];
      const payload = {
        nombre: form.nombre,
        email: form.email,
        role: form.role,
        priceTier: form.role !== 'commercial' ? form.priceTier : undefined,
        clientName: form.role !== 'commercial' ? (form.clientName || null) : undefined,
        phone: form.role === 'commercial' ? form.phone : undefined,
        position: form.role === 'commercial' ? form.position : undefined,
        languages: form.role === 'commercial' ? languages : undefined,
        isActive: isEdit ? form.isActive : undefined,
      };

      if (isEdit) {
        await updateUserById(user._id, payload);
        if (cropFile) await uploadPhoto(user._id);
      } else {
        const result = await createUser(payload);
        const newId = result.user?._id || result._id;
        if (cropFile && newId) await uploadPhoto(newId);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* Crop overlay on top of everything */}
      {showCrop && cropImageUrl && (
        <PhotoCropOverlay
          imageUrl={cropImageUrl}
          initialZoom={cropInitialZoom}
          onCancel={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}

      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 'var(--space-md)',
      }}
        onClick={onClose}
      >
        <div style={{
          background: 'var(--color-surface-elevated)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="auth-header" style={{ marginBottom: 'var(--space-lg)' }}>
            {isEdit ? <UserPlus size={32} /> : <UserPlus size={32} />}
            <h1>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
          </div>

          {/* Type selector (only in add mode) */}
          {!isEdit && (
            <div style={{
              display: 'flex',
              gap: 0,
              marginBottom: 'var(--space-lg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => { setFormType('user'); handleChange('role', 'client'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: formType === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: formType === 'user' ? '#fff' : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <UserPlus size={16} />
                Usuario
              </button>
              <button
                onClick={() => { setFormType('commercial'); handleChange('role', 'commercial'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: formType === 'commercial' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: formType === 'commercial' ? '#fff' : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Building2 size={16} />
                Comercial
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="auth-form">
            {/* Shared: Email */}
            <div className="auth-field">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                disabled={isEdit}
                placeholder="usuario@ejemplo.com"
              />
              {isEdit && (
                <span className="field-hint">El email no se puede modificar</span>
              )}
            </div>

            {/* Shared: Nombre */}
            <div className="auth-field">
              <label>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            {/* ── Photo ── */}
            <div className="auth-field">
              <label>Foto de perfil</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                {/* Preview — matches Contacto styling */}
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
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Camera size={24} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 20px',
                      background: 'var(--color-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#fff',
                      transition: 'all var(--transition-fast)',
                    }}>
                      <Camera size={16} />
                      {previewUrl ? 'Cambiar foto' : 'Seleccionar imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {isEdit && previewUrl && originalPhotoUrl && (
                      <button
                        onClick={handleAdjustPhoto}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 20px',
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <Crop size={16} />
                        Ajustar
                      </button>
                    )}

                    {isEdit && originalPhotoUrl && (cropFile !== null || previewUrl === null) && (
                      <button
                        onClick={handleRestoreOriginal}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 20px',
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--color-text-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <Crop size={16} />
                        Restaurar original
                      </button>
                    )}
                  </div>

                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {isEdit && originalPhotoUrl
                      ? (cropFile
                        ? 'Usa "Restaurar original" para deshacer el recorte, o "Ajustar" para reajustarlo'
                        : 'Usa "Ajustar" para recortar la foto actual, o "Cambiar foto" para subir una nueva')
                      : 'JPG, PNG o WebP · Se abrirá un editor para recortar'}
                  </p>

                  {previewUrl && (
                    <button
                      onClick={() => {
                        // Revoke blob preview if any
                        if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        setCropFile(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '4px 0',
                        marginTop: 4,
                        textDecoration: 'underline',
                      }}
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Role selector (always in edit, only for 'user' tab in add) ── */}
            {(formType === 'user' || isEdit) && (
              <>
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
                    <option value="commercial">Comercial</option>
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
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── Commercial-specific fields (based on selected role) ── */}
            {form.role === 'commercial' && (
              <>
                <div className="auth-field">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+34 649 893 050"
                  />
                </div>

                <div className="auth-field">
                  <label>Puesto</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={e => handleChange('position', e.target.value)}
                    placeholder="Ej: Production manager"
                  />
                </div>

                <div className="auth-field">
                  <label>Idiomas (separados por coma)</label>
                  <input
                    type="text"
                    value={form.languages}
                    onChange={e => handleChange('languages', e.target.value)}
                    placeholder="Español, Inglés, Alemán"
                  />
                  <span className="field-hint">Ej: Español, Inglés, Alemán, Francés</span>
                </div>
              </>
            )}

            {/* ── Active toggle (edit only) ── */}
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
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {form.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            )}

            {/* ── Creation info ── */}
            {!isEdit && (
              <div className="auth-info" style={{ fontSize: '0.8125rem' }}>
                <Save size={16} />
                <span>
                  {formType === 'commercial'
                    ? 'El comercial se creará sin necesidad de verificar email'
                    : 'Se enviará un email de verificación al nuevo usuario'
                  }
                </span>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
            <button
              onClick={onClose}
              className="auth-btn-secondary"
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.nombre}
              className="auth-btn"
              style={{
                flex: 1,
                marginTop: 0,
                opacity: (saving || !form.nombre) ? 0.6 : 1,
              }}
            >
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
