import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function CondicionesGenerales() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="legal-back" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Condiciones Generales</h1>

        <section>
          <h2>1. Ámbito de Aplicación</h2>
          <p>Las presentes Condiciones Generales regulan la relación entre Viveros Guzmán S.L.U. y los usuarios del sitio web oferta-semanal.viverosguzman.es, así como el acceso y uso de los servicios ofrecidos a través del mismo.</p>
        </section>

        <section>
          <h2>2. Registro y Cuenta de Usuario</h2>
          <p>Para acceder a determinados servicios del Sitio Web, el usuario deberá registrarse creando una cuenta. El usuario se compromete a:</p>
          <ul>
            <li>Proporcionar información veraz y actualizada durante el proceso de registro.</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta.</li>
          </ul>
          <p>Viveros Guzmán S.L.U. se reserva el derecho de cancelar cuentas que incumplan estas condiciones.</p>
        </section>

        <section>
          <h2>3. Uso de los Servicios</h2>
          <p>El usuario se compromete a utilizar los servicios del Sitio Web conforme a la ley, la moral, el orden público y las presentes Condiciones Generales. Queda expresamente prohibido:</p>
          <ul>
            <li>Realizar actividades fraudulentas o ilícitas.</li>
            <li>Intentar acceder a áreas restringidas sin autorización.</li>
            <li>Interferir en el funcionamiento del Sitio Web.</li>
          </ul>
        </section>

        <section>
          <h2>4. Limitación de Responsabilidad</h2>
          <p>Viveros Guzmán S.L.U. no garantiza la disponibilidad continuada del Sitio Web ni se responsabiliza de los daños derivados de:</p>
          <ul>
            <li>La imposibilidad de acceso por causas ajenas a su control.</li>
            <li>Errores u omisiones en la información publicada.</li>
            <li>El uso que el usuario haga de los contenidos del Sitio Web.</li>
          </ul>
        </section>

        <section>
          <h2>5. Modificaciones</h2>
          <p>Viveros Guzmán S.L.U. se reserva el derecho de modificar estas Condiciones Generales en cualquier momento. Los cambios serán notificados a través del Sitio Web y, en caso de registro, mediante comunicación a la dirección de correo electrónico del usuario.</p>
        </section>

        <section>
          <h2>6. Legislación Aplicable</h2>
          <p>Estas Condiciones Generales se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Alhaurín de la Torre (Málaga).</p>
        </section>

        <p className="legal-actualizacion">Última actualización: junio 2026</p>
      </div>
    </div>
  );
}
