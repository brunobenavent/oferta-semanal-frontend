import UserForm from './UserForm';

export default function UserFormModal({ pageMode = 'empleados', mode, user, onClose, onSaved, commercials = [] }) {
  return (
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
        <UserForm
          mode={mode}
          user={user}
          pageMode={pageMode}
          commercials={commercials}
          onSaved={() => { onSaved?.(); onClose?.(); }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
