import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import '../pages/AuthPages.css';

function formatCount(n) {
  return n.toLocaleString('es');
}

export default function Navbar({ semana, totalSinFiltros, filteredCount }) {
  const { user, isAuthenticated, isSuperadminOrAdmin, isCommercial, isEmployee, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showFiltered = totalSinFiltros > 0 && filteredCount !== totalSinFiltros;
  const countText = totalSinFiltros > 0
    ? showFiltered
      ? `${formatCount(filteredCount)} de ${formatCount(totalSinFiltros)} artículos encontrados`
      : `${formatCount(totalSinFiltros)} artículos`
    : '';

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    sessionStorage.setItem('goodbye', JSON.stringify({ name: user.nombre }));
    logout();
    navigate('/');
  };

  const userRoles = user?.roles || [user?.role || 'client'];
  const sortedRoles = [...userRoles].sort(
    (a, b) => ['superadmin','admin','commercial','employee','client'].indexOf(a) - ['superadmin','admin','commercial','employee','client'].indexOf(b)
  );

  const roleBadgeClass = userRoles.includes('superadmin')
    ? 'role-badge--superadmin'
    : userRoles.includes('admin')
      ? 'role-badge--admin'
      : userRoles.includes('employee')
        ? 'role-badge--employee'
        : 'role-badge--default';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <img src="/logo-guzman.svg" alt="Viveros Guzmán" className="nav-logo-img" />
            </Link>
          </div>
          <div className="navbar-right">
            <div className="nav-links-row">
              <Link to="/" className={`nav-link nav-link-uppercase${pathname === '/' ? ' nav-link--active' : ''}`}>LISTADO</Link>
              <span className="nav-link-sep">|</span>
              <Link to="/contact" className={`nav-link nav-link-uppercase${pathname.startsWith('/contact') ? ' nav-link--active' : ''}`}>CONTACTO</Link>
              {(isSuperadminOrAdmin || isEmployee || isCommercial) && (
                <>
                  <span className="nav-link-sep">|</span>
                  <Link to="/users" className={`nav-link nav-link-uppercase${pathname.startsWith('/users') ? ' nav-link--active' : ''}`}>EMPLEADOS</Link>
                </>
              )}
              {(isSuperadminOrAdmin || isCommercial) && (
                <>
                  <span className="nav-link-sep">|</span>
                  <Link to="/clientes" className={`nav-link nav-link-uppercase${pathname.startsWith('/clientes') ? ' nav-link--active' : ''}`}>CLIENTES</Link>
                </>
              )}
            </div>
            {loading ? (
              <div style={{ width: 120, height: 36 }} />
            ) : !isAuthenticated ? (
              <Link to="/login" className="nav-login-link">Acceder</Link>
            ) : (
              <div className="nav-user-info">
                <Link to="/profile" className="nav-user-avatar">
                  {user.photo ? (
                    <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    user.nombre?.charAt(0).toUpperCase() || '?'
                  )}
                </Link>
                <Link to="/profile" className="nav-user-name">{user.nombre}</Link>
                <div style={{ display: 'flex', gap: 4 }}>
                  {sortedRoles.map(r => (
                    <span key={r} className={`role-badge ${roleBadgeClass}`}>
                      {r === 'superadmin' ? 'Superadmin' : r === 'admin' ? 'Admin' : r === 'employee' ? 'Empleado' : r === 'commercial' ? 'Comercial' : r === 'client' ? 'Cliente' : r}
                    </span>
                  ))}
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="nav-logout-btn">
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav className="mobile-nav">
        <Link to="/" className="mobile-nav-week" style={{ textDecoration: 'none' }}>
          <span className="nav-week-label">SEMANA <span className="mobile-week-highlight">{semana || ''}</span></span>
          {countText && <span className="nav-count-label-mobile">{countText}</span>}
        </Link>
        <div className="mobile-nav-right">
          {loading ? (
            <div style={{ width: 100, height: 32 }} />
          ) : !isAuthenticated ? (
            <>
              <Link to="/contact" className={`mobile-icon-btn${pathname.startsWith('/contact') ? ' mobile-icon-btn--active' : ''}`} title="Contacto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </Link>
              <Link to="/login" className="mobile-login-link">Acceder</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className={`mobile-icon-btn${pathname.startsWith('/profile') ? ' mobile-icon-btn--active' : ''}`} title="Perfil">
                <span style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {user.photo ? (
                    <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    user.nombre?.charAt(0).toUpperCase() || '?'
                  )}
                </span>
              </Link>
              <Link to="/contact" className={`mobile-icon-btn${pathname.startsWith('/contact') ? ' mobile-icon-btn--active' : ''}`} title="Contacto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </Link>
              {(isSuperadminOrAdmin || isEmployee || isCommercial) && (
                <Link to="/users" className={`mobile-icon-btn${pathname.startsWith('/users') ? ' mobile-icon-btn--active' : ''}`} title="Empleados">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </Link>
              )}
              {(isSuperadminOrAdmin || isCommercial) && (
                <Link to="/clientes" className={`mobile-icon-btn${pathname.startsWith('/clientes') ? ' mobile-icon-btn--active' : ''}`} title="Clientes">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </Link>
              )}
              <button onClick={() => setShowLogoutConfirm(true)} className="mobile-icon-btn" title="Cerrar sesión">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal-content" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3>¿Cerrar sesión?</h3>
            <p>¿Estás seguro de que quieres salir de la aplicación?</p>
            <div className="logout-modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleLogout}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
