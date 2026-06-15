import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function Privacidad() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="legal-back" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Política de Privacidad</h1>

        <section>
          <h2>1. Responsable del Tratamiento</h2>
          <p><strong>Identidad:</strong> Viveros Guzmán S.L.U.</p>
          <p><strong>CIF/NIF:</strong> ESB29745411</p>
          <p><strong>Dirección:</strong> Camino de Joaquín Blume s/n</p>
          <p><strong>Correo electrónico:</strong> viverosguzman@viverosguzman.es</p>
        </section>

        <section>
          <h2>2. Datos Personales Recogidos</h2>
          <p>En función de los servicios que el usuario utilice, podremos recoger los siguientes datos personales:</p>
          <ul>
            <li><strong>Datos de identificación:</strong> nombre, apellidos, dirección de correo electrónico.</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas.</li>
            <li><strong>Datos de cuenta:</strong> nombre de usuario y contraseña (en caso de registro).</li>
          </ul>
        </section>

        <section>
          <h2>3. Finalidad del Tratamiento</h2>
          <p>Los datos personales serán tratados con las siguientes finalidades:</p>
          <ul>
            <li>Gestionar el acceso y uso del Sitio Web.</li>
            <li>Gestionar la cuenta de usuario (cuando esté disponible).</li>
            <li>Permitir la gestión de ofertas y productos semanales.</li>
            <li>Atender consultas y solicitudes de información.</li>
            <li>Cumplir con obligaciones legales aplicables.</li>
          </ul>
        </section>

        <section>
          <h2>4. Base Legal del Tratamiento</h2>
          <p>La base legal para el tratamiento de los datos personales es:</p>
          <ul>
            <li>La ejecución de las condiciones generales del servicio.</li>
            <li>El consentimiento del usuario, prestado mediante la aceptación de esta política.</li>
            <li>El cumplimiento de obligaciones legales aplicables.</li>
          </ul>
        </section>

        <section>
          <h2>5. Plazo de Conservación</h2>
          <p>Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos, y mientras exista una relación contractual o comercial con el usuario. Una vez finalizada dicha relación, los datos se mantendrán bloqueados durante los plazos legales de prescripción aplicables.</p>
        </section>

        <section>
          <h2>6. Destinatarios de los Datos</h2>
          <p>No se cederán datos personales a terceros, salvo obligación legal o prestadores de servicios necesarios para el funcionamiento del Sitio Web (alojamiento web, servicios de mensajería, etc.), con quienes se han suscrito los correspondientes contratos de encargo de tratamiento conforme al RGPD.</p>
        </section>

        <section>
          <h2>7. Derechos del Usuario</h2>
          <p>El usuario puede ejercer en cualquier momento sus derechos de:</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos personales estamos tratando.</li>
            <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de sus datos.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos.</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado.</li>
            <li><strong>Limitación:</strong> solicitar la limitación del tratamiento.</li>
          </ul>
          <p>Para ejercer estos derechos, el usuario puede dirigirse a viverosguzman@viverosguzman.es. Adicionalmente, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).</p>
        </section>

        <section>
          <h2>8. Medidas de Seguridad</h2>
          <p>Viveros Guzmán S.L.U. adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad e integridad de los datos personales, y evitar su alteración, pérdida, tratamiento o acceso no autorizado.</p>
        </section>

        <p className="legal-actualizacion">Última actualización: junio 2026</p>
      </div>
    </div>
  );
}
