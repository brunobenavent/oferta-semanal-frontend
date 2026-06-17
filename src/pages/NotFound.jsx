import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        {/* ── Decorative vine SVG ── */}
        <svg className="not-found-vine" width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 110 C30 80, 50 90, 70 60 C90 30, 110 40, 130 20 C140 10, 150 15, 155 25"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="vine-path"
          />
          {/* Leaves */}
          <ellipse cx="45" cy="75" rx="10" ry="6" transform="rotate(-30 45 75)" fill="var(--color-primary)" opacity="0.7" className="leaf leaf-1" />
          <ellipse cx="95" cy="40" rx="9" ry="5" transform="rotate(20 95 40)" fill="var(--color-primary)" opacity="0.6" className="leaf leaf-2" />
          <ellipse cx="135" cy="18" rx="8" ry="4.5" transform="rotate(-10 135 18)" fill="var(--color-primary)" opacity="0.8" className="leaf leaf-3" />
        </svg>

        <h1 className="not-found-code">404</h1>
        <p className="not-found-message">
          Esta página no está en nuestro catálogo
        </p>
        <p className="not-found-sub">
          Parece que la ruta que buscas no existe o ha sido trasplantada a otro lugar.
        </p>
        <Link to="/" className="not-found-btn">
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
