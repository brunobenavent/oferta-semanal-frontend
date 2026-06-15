import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function AvisoLegal() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="legal-back" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Aviso Legal</h1>

        <section>
          <h2>1. Identificación del Titular</h2>
          <p><strong>Razón Social:</strong> Viveros Guzmán S.L.U.</p>
          <p><strong>CIF/NIF:</strong> ESB29745411</p>
          <p><strong>Domicilio Social:</strong> Camino de Joaquín Blume s/n</p>
          <p><strong>Correo Electrónico:</strong> viverosguzman@viverosguzman.es</p>
          <p><strong>Teléfono:</strong> 952 41 13 51</p>
        </section>

        <section>
          <h2>2. Objeto</h2>
          <p>Las presentes condiciones generales regulan el acceso y uso del sitio web oferta-semanal.viverosguzman.es (en adelante, "el Sitio Web"), puesto a disposición de los usuarios por Viveros Guzmán S.L.U.</p>
          <p>La navegación por el Sitio Web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.</p>
        </section>

        <section>
          <h2>3. Acceso y Uso del Sitio Web</h2>
          <p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios del Sitio Web, y a no emplearlos para incurrir en actividades ilícitas o contrarias a la buena fe y al orden público.</p>
        </section>

        <section>
          <h2>4. Propiedad Intelectual e Industrial</h2>
          <p>Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseño, etc.) son propiedad de Viveros Guzmán S.L.U. o de terceros con los que se haya alcanzado un acuerdo de uso, y están protegidos por la legislación vigente en materia de propiedad intelectual e industrial.</p>
          <p>Queda prohibida la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin la autorización expresa del titular.</p>
        </section>

        <section>
          <h2>5. Exclusión de Responsabilidad</h2>
          <p>Viveros Guzmán S.L.U. no se hace responsable de los daños y perjuicios que pudieran derivarse de:</p>
          <ul>
            <li>Interrupciones del servicio por causas técnicas, de mantenimiento o fuerza mayor.</li>
            <li>La existencia de virus, malware o cualquier otro elemento dañino en el Sitio Web.</li>
            <li>El uso que terceros puedan hacer de la información publicada.</li>
          </ul>
        </section>

        <section>
          <h2>6. Legislación Aplicable y Jurisdicción</h2>
          <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia que pudiera derivarse del acceso o uso del Sitio Web, las partes se someten a los juzgados y tribunales de Alhaurín de la Torre (Málaga), renunciando expresamente a cualquier otro fuero que pudiera corresponderles.</p>
        </section>

        <p className="legal-actualizacion">Última actualización: junio 2026</p>
      </div>
    </div>
  );
}
