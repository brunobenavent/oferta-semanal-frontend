import { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';
import './CookieBanner.css';

const STORAGE_KEY = 'cookie-consent';

const defaultPreferences = {
  necessary: true,   // always true
  preferences: true,
  analytics: false,
  marketing: false,
};

function CookieBannerIcon({ onClick }) {
  return (
    <button
      className="cookie-config-btn"
      onClick={onClick}
      title="Configurar cookies"
      aria-label="Configurar cookies"
    >
      <Cookie size={18} />
    </button>
  );
}

function CookieBannerInner({ configOpen, setConfigOpen, preferences, setPreferences, acceptAll, rejectAll, saveConfig }) {
  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <div className="cookie-banner-header">
          <Cookie size={20} />
          <span>Configuración de cookies</span>
        </div>

        {!configOpen ? (
          <>
            <p className="cookie-banner-text">
              Utilizamos cookies propias y de terceros para el correcto funcionamiento del sitio web y, si nos autorizas, para analizar tu navegación y mostrarte publicidad personalizada.
            </p>
            <div className="cookie-banner-actions">
              <button className="cookie-btn cookie-btn-primary" onClick={acceptAll}>Aceptar todas</button>
              <button className="cookie-btn cookie-btn-secondary" onClick={rejectAll}>Rechazar todas</button>
              <button className="cookie-btn cookie-btn-link" onClick={() => setConfigOpen(true)}>
                Configurar
                <ChevronDown size={14} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-config">
              <label className="cookie-option disabled">
                <input type="checkbox" checked={preferences.necessary} disabled />
                <div>
                  <strong>Estrictamente necesarias</strong>
                  <span>Esenciales para la navegación y el funcionamiento del sitio.</span>
                </div>
              </label>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={() => setPreferences(p => ({ ...p, preferences: !p.preferences }))}
                />
                <div>
                  <strong>Cookies de preferencias</strong>
                  <span>Permiten recordar tus preferencias (idioma, favoritos, etc.).</span>
                </div>
              </label>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                />
                <div>
                  <strong>Cookies analíticas</strong>
                  <span>Nos ayudan a entender cómo interactúas con el sitio para mejorarlo.</span>
                </div>
              </label>

              <label className="cookie-option">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                />
                <div>
                  <strong>Cookies publicitarias</strong>
                  <span>Se utilizan para mostrarte anuncios personalizados.</span>
                </div>
              </label>
            </div>

            <div className="cookie-banner-actions">
              <button className="cookie-btn cookie-btn-primary" onClick={saveConfig}>Guardar preferencias</button>
              <button className="cookie-btn cookie-btn-secondary" onClick={rejectAll}>Rechazar todas</button>
              <button className="cookie-btn cookie-btn-link" onClick={() => setConfigOpen(false)}>
                Volver
                <ChevronUp size={14} />
              </button>
            </div>
          </>
        )}

        <button className="cookie-banner-close" onClick={rejectAll} aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setShowBanner(true);
    } else {
      setShowIcon(true);
    }
  }, []);

  const saveConsent = (prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
    setShowBanner(false);
    setShowIcon(true);
  };

  const openConfig = () => {
    setShowIcon(false);
    setConfigOpen(true);
    setShowBanner(true);
  };

  const acceptAll = () => {
    const all = { necessary: true, preferences: true, analytics: true, marketing: true };
    saveConsent(all);
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, preferences: false, analytics: false, marketing: false });
  };

  const saveConfig = () => {
    saveConsent(preferences);
  };

  if (showBanner) return (<CookieBannerInner
    configOpen={configOpen}
    setConfigOpen={setConfigOpen}
    preferences={preferences}
    setPreferences={setPreferences}
    acceptAll={acceptAll}
    rejectAll={rejectAll}
    saveConfig={saveConfig}
  />);

  if (showIcon) return (<CookieBannerIcon onClick={openConfig} />);

  return null;
}
