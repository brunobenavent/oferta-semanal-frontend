import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

export default function Cookies() {
  const navigate = useNavigate();
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="legal-back" onClick={() => navigate(-1)}>← Volver</button>
        <h1>Política de Cookies</h1>

        <section>
          <h2>1. ¿Qué son las Cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en el navegador del usuario cuando visita un sitio web. Permiten al sitio web recordar las preferencias del usuario y analizar su comportamiento de navegación.</p>
        </section>

        <section>
          <h2>2. Tipos de Cookies Utilizadas</h2>

          <h3>Cookies Estrictamente Necesarias (técnicas)</h3>
          <p>Son esenciales para el funcionamiento del sitio web y no pueden desactivarse. Permiten la navegación y el uso de las funcionalidades básicas.</p>
          <table className="cookie-table">
            <thead>
              <tr><th>Cookie</th><th>Finalidad</th><th>Duración</th></tr>
            </thead>
            <tbody>
              <tr><td>cookie-consent</td><td>Recordar la configuración de cookies aceptada</td><td>1 año</td></tr>
              <tr><td>connect.sid*</td><td>Cookie de sesión (cuando el usuario inicie sesión)</td><td>Sesión</td></tr>
            </tbody>
          </table>
          <p className="cookie-table-note">* Solo se utiliza si el usuario inicia sesión.</p>

          <h3>Cookies de Preferencias</h3>
          <p>Permiten recordar las preferencias del usuario, como el idioma o la vista seleccionada.</p>
          <table className="cookie-table">
            <thead>
              <tr><th>Cookie</th><th>Finalidad</th><th>Duración</th></tr>
            </thead>
            <tbody>
              <tr><td>favoritos (localStorage)</td><td>Almacenar los artículos favoritos del usuario</td><td>Persistente</td></tr>
            </tbody>
          </table>

          <h3>Cookies Analíticas</h3>
          <p>Nos permiten analizar cómo los usuarios interactúan con el sitio web, para mejorar su funcionamiento. Actualmente no utilizamos este tipo de cookies.</p>

          <h3>Cookies Publicitarias</h3>
          <p>No utilizamos cookies publicitarias en este sitio web.</p>
        </section>

        <section>
          <h2>3. Gestión de Cookies</h2>
          <p>El usuario puede gestionar las cookies a través de:</p>
          <ul>
            <li>El panel de configuración de cookies disponible en el sitio web.</li>
            <li>La configuración de su navegador (Chrome, Firefox, Safari, Edge, etc.).</li>
          </ul>
          <p>Al deshabilitar cookies estrictamente necesarias, algunas funcionalidades del sitio web podrían verse afectadas.</p>
        </section>

        <section>
          <h2>4. Cookies de Terceros</h2>
          <p>Actualmente no utilizamos cookies de terceros. En caso de incorporar servicios que las utilicen (Google Analytics, incrustaciones de vídeo, etc.), se actualizará esta política y se informará al usuario.</p>
        </section>

        <section>
          <h2>5. Actualización de la Política de Cookies</h2>
          <p>Esta política de cookies puede ser actualizada en cualquier momento para reflejar cambios en las cookies utilizadas o en la normativa aplicable. Se recomienda al usuario revisarla periódicamente.</p>
        </section>

        <p className="legal-actualizacion">Última actualización: junio 2026</p>
      </div>
    </div>
  );
}
