import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-quality">
        <img src="/images/quality/eco.svg" alt="Certificación ecológica ES-ECO-002-AN" className="footer-quality-logo" />
        <img src="/images/quality/mps.svg" alt="Certificación MPS" className="footer-quality-logo" />
        <img src="/images/quality/iso.svg" alt="Certificación ISO" className="footer-quality-logo" />
      </div>
      <div className="footer-links">
        <Link to="/aviso-legal">Aviso Legal</Link>
        <span className="footer-sep">|</span>
        <Link to="/condiciones-generales">Condiciones Generales</Link>
        <span className="footer-sep">|</span>
        <Link to="/privacidad">Política de Privacidad</Link>
        <span className="footer-sep">|</span>
        <Link to="/cookies">Política de Cookies</Link>
      </div>
      <p>Viveros Guzmán {new Date().getFullYear()} &copy; Todos los derechos reservados</p>
    </footer>
  );
}
