import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, ArrowLeft } from 'lucide-react';
import { PreOrderContext } from '../context/PreOrderContext';
import { useAuth } from '../context/AuthContext';
import './DraftCart.css';

export default function DraftCart() {
  const { isClient } = useAuth();
  const preOrderCtx = useContext(PreOrderContext);
  const draftItems = preOrderCtx?.draftItems || new Map();
  const updateUnidades = preOrderCtx?.updateUnidades || (() => {});
  const setFromKarrys = preOrderCtx?.setFromKarrys || (() => {});
  const setFromTablas = preOrderCtx?.setFromTablas || (() => {});
  const removeItem = preOrderCtx?.removeItem || (() => {});

  const items = Array.from(draftItems.values()).filter(
    item => (item.karrys || 0) * (item.undsCarro || 0) + (item.tablas || 0) * (item.undsTabla || 0) + (item.unidades || 0) > 0
  );
  
  const grandTotal = items.reduce((sum, item) => 
    sum + (item.karrys || 0) * (item.undsCarro || 0) + (item.tablas || 0) * (item.undsTabla || 0) + (item.unidades || 0), 0
  );

  if (!isClient) return null;
  
  if (items.length === 0) {
    return (
      <div className="draft-cart-page">
        <div className="draft-cart-empty">
          <h2>Tu pedido está vacío</h2>
          <p>Agregá artículos desde el listado para empezar tu pedido.</p>
          <Link to="/" className="btn btn-primary">Ir al listado</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="draft-cart-page">
      <div className="draft-cart-header">
        <Link to="/" className="draft-cart-back">
          <ArrowLeft size={16} /> Seguir comprando
        </Link>
        <h2>Mi Pedido</h2>
        <div />
      </div>

      <div className="draft-cart-card">
        <table className="draft-cart-table">
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Código</th>
              <th>Karrys</th>
              <th>Tablas</th>
              <th>Uds</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const total = (item.karrys || 0) * (item.undsCarro || 0) + (item.tablas || 0) * (item.undsTabla || 0) + (item.unidades || 0);
              return (
                <tr key={item.codigoArticulo}>
                  <td className="draft-cart-name">{item.descripcionArticulo}</td>
                  <td className="draft-cart-code">{item.codigoArticulo}</td>
                  <td>
                    {item.undsCarro > 0 ? (
                      <div className="draft-cart-btns">
                        <button className="draft-cart-btn" onClick={() => setFromKarrys(item.codigoArticulo, Math.max(0, (item.karrys || 0) - 1), item)}>−</button>
                        <span className="draft-cart-val">{item.karrys || 0}</span>
                        <button className="draft-cart-btn draft-cart-btn--add" onClick={() => setFromKarrys(item.codigoArticulo, (item.karrys || 0) + 1, item)}>+</button>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    {item.undsTabla > 0 ? (
                      <div className="draft-cart-btns">
                        <button className="draft-cart-btn" onClick={() => setFromTablas(item.codigoArticulo, Math.max(0, (item.tablas || 0) - 1), item)}>−</button>
                        <span className="draft-cart-val">{item.tablas || 0}</span>
                        <button className="draft-cart-btn draft-cart-btn--add" onClick={() => setFromTablas(item.codigoArticulo, (item.tablas || 0) + 1, item)}>+</button>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="draft-cart-btns">
                      <button className="draft-cart-btn" onClick={() => updateUnidades(item.codigoArticulo, -1, item)}>−</button>
                      <span className="draft-cart-val">{item.unidades || 0}</span>
                      <button className="draft-cart-btn draft-cart-btn--add" onClick={() => updateUnidades(item.codigoArticulo, 1, item)}>+</button>
                      {item.undsCarro === 0 && item.undsTabla === 0 && (
                        <>
                          <button className="draft-cart-btn draft-cart-btn--muted" onClick={() => updateUnidades(item.codigoArticulo, -10, item)}>−10</button>
                          <button className="draft-cart-btn draft-cart-btn--muted" onClick={() => updateUnidades(item.codigoArticulo, 10, item)}>+10</button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="draft-cart-total">{total} uds</td>
                  <td>
                    <button className="draft-cart-remove" title="Eliminar artículo" onClick={() => removeItem(item.codigoArticulo)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="draft-cart-footer">
          <div className="draft-cart-grand-total">{grandTotal} uds totales</div>
          <Link to="/pedidos/enviar" className="btn btn-primary">
            <Send size={18} />
            ENVIAR PEDIDO
          </Link>
        </div>
      </div>
    </div>
  );
}
