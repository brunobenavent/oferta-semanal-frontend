import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PreOrderContext } from '../context/PreOrderContext';
import { useToast } from '../components/Toast';
import './SendPreorder.css';

export default function SendPreorder() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const preOrderCtx = useContext(PreOrderContext);

  const draftItems = preOrderCtx?.draftItems || new Map();
  const sendPreorder = preOrderCtx?.sendPreorder || (() => {});

  const [allCommercials, setAllCommercials] = useState([]);
  const [sendCommercials, setSendCommercials] = useState([]);
  const [sendMedio, setSendMedio] = useState('email');
  const [sendObservaciones, setSendObservaciones] = useState('');
  const [commercialSearch, setCommercialSearch] = useState('');
  const [sending, setSending] = useState(false);

  const assignedCommercials = user?.assignedCommercials || [];
  const assignedIds = new Set(assignedCommercials.map(c => c._id));

  // Load all commercials
  useEffect(() => {
    api.get('/commercials')
      .then(res => {
        const list = res.data?.commercials || [];
        setAllCommercials(list);
        // Pre-select assigned ones
        setSendCommercials(
          list.filter(c => assignedIds.has(c._id)).map(c => c._id)
        );
      })
      .catch(() => {});
  }, []);

  // Build items array from draftItems Map
  const items = Array.from(draftItems.values()).filter(
    i => (i.unidades || 0) > 0 || (i.karrys || 0) > 0 || (i.tablas || 0) > 0
  );

  const totalUds = items.reduce((sum, i) => {
    return sum + (i.karrys || 0) * (i.undsCarro || 0)
      + (i.tablas || 0) * (i.undsTabla || 0)
      + (i.unidades || 0);
  }, 0);

  const filteredCommercials = allCommercials.filter(c => {
    if (!commercialSearch) return true;
    const q = commercialSearch.toLowerCase();
    return (c.name || c.nombre || '').toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q);
  });

  const handleSend = async () => {
    setSending(true);
    try {
      await sendPreorder({
        comerciales: sendCommercials,
        medio: sendMedio,
        observaciones: sendObservaciones,
      });
      // sendPreorder handles toast + draft clearing internally
      navigate('/pedidos');
    } catch (err) {
      addToast('Error al enviar el pedido', 'error');
    } finally {
      setSending(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="send-preorder-page">
        <div className="send-preorder-empty">
          <h3>No hay artículos en tu pedido</h3>
          <p>Agregá artículos desde el listado antes de enviar.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Ir al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="send-preorder-page">
      <div className="send-preorder-header">
        <Link to="/pedidos" className="send-preorder-back">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h2>Enviar pedido</h2>
        <div />{/* spacer */}
      </div>

      <div className="send-preorder-grid">
        {/* Left column: items + medium + notes */}
        <div>
          <div className="send-preorder-col">
            <h3>Resumen del pedido</h3>
            <table className="send-items-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th className="send-items-num">Karrys</th>
                  <th className="send-items-num">Tablas</th>
                  <th className="send-items-num">Uds</th>
                  <th className="send-items-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const total = (item.karrys || 0) * (item.undsCarro || 0)
                    + (item.tablas || 0) * (item.undsTabla || 0)
                    + (item.unidades || 0);
                  return (
                    <tr key={item.codigoArticulo || i}>
                      <td>
                        <span className="send-items-name">{item.descripcionArticulo}</span>
                        <span className="send-items-code">{item.codigoArticulo}</span>
                      </td>
                      <td className="send-items-num">{item.karrys || 0}</td>
                      <td className="send-items-num">{item.tablas || 0}</td>
                      <td className="send-items-num">{item.unidades || 0}</td>
                      <td className="send-items-num">{total}</td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td colSpan={4}>Total</td>
                  <td className="send-items-num">{totalUds} uds</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="send-preorder-col" style={{ marginTop: '1.5rem' }}>
            <h3>Medio de notificación</h3>
            <select className="send-medium-select" value={sendMedio} onChange={e => setSendMedio(e.target.value)}>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="send-preorder-col" style={{ marginTop: '1.5rem' }}>
            <h3>Notas (opcional)</h3>
            <textarea
              className="send-notes-textarea"
              value={sendObservaciones}
              onChange={e => setSendObservaciones(e.target.value)}
              placeholder="Observaciones para el comercial..."
              rows={3}
            />
          </div>
        </div>

        {/* Right column: commercials */}
        <div>
          <div className="send-preorder-col">
            <h3>Comerciales</h3>
            <input
              type="text"
              className="send-commercial-search"
              placeholder="Buscar comercial..."
              value={commercialSearch}
              onChange={e => setCommercialSearch(e.target.value)}
            />
            <div className="send-commercial-list">
              <label className="send-commercial-select-all">
                <input
                  type="checkbox"
                  checked={filteredCommercials.length > 0 && sendCommercials.length === allCommercials.length}
                  onChange={e => {
                    if (e.target.checked) {
                      setSendCommercials(allCommercials.map(c => c._id));
                    } else {
                      setSendCommercials([]);
                    }
                  }}
                />
                Seleccionar todos
              </label>
              {filteredCommercials.map(c => (
                <label key={c._id} className="send-commercial-row">
                  <input
                    type="checkbox"
                    checked={sendCommercials.includes(c._id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSendCommercials(prev => [...prev, c._id]);
                      } else {
                        setSendCommercials(prev => prev.filter(id => id !== c._id));
                      }
                    }}
                  />
                  <div className="send-commercial-info">
                    <span className="send-commercial-name">{c.name || c.nombre}</span>
                    <span className="send-commercial-email">{c.email}</span>
                  </div>
                </label>
              ))}
              {filteredCommercials.length === 0 && (
                <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted, #999)', fontSize: '0.8rem' }}>
                  Sin resultados
                </p>
              )}
            </div>
            {assignedCommercials.length > 0 && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted, #aaa)' }}>
                Tus comerciales asignados ya están marcados.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="send-preorder-footer">
        <Link to="/pedidos" className="btn btn-secondary">Cancelar</Link>
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={sending || items.length === 0}
        >
          <Send size={16} /> {sending ? 'Enviando...' : 'Enviar pedido'}
        </button>
      </div>
    </div>
  );
}
