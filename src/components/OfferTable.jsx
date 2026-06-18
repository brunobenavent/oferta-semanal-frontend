import { useState, useRef, useEffect } from 'react';
import { Download, Share2, ArrowUpDown, Link2 } from 'lucide-react';
import HeartIcon from './HeartIcon';
import Pagination from './Pagination';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { getCloudinaryUrl } from '../utils/cloudinaryUrl';
import { useToast } from './Toast';

const OFFER_CENTERS = [
  { key: 'ofertaNuevoEspacio', label: 'Nuevo Espacio', color: 'verde-botella' },
  { key: 'ofertaEuroPlanta', label: 'Europlantas', color: 'rojo' },
  { key: 'ofertaCortijo', label: 'Cortijo Blanco', color: 'blanco-roto' },
  { key: 'ofertaFinca', label: 'Finca', color: 'azul' },
  { key: 'ofertaArroyo', label: 'Arroyo', color: 'morado' },
  { key: 'ofertaGamera', label: 'Gamera', color: 'azul-marino' },
  { key: 'ofertaGarden', label: 'Garden', color: 'verde-alegre' },
  { key: 'ofertaMarbella', label: 'Marbella', color: '' },
  { key: 'ofertaEstacion', label: 'Estación', color: 'naranja' },
];

function getPriceConfig(roles, priceTier) {
  if (!roles || roles.length === 0) {
    return { p1: true, l1: 'PVP', p2: false, p3: false, isStaff: false, highlightLine: null };
  }
  if (roles.includes('client')) {
    const activeTier = priceTier || 2;
    return {
      p1: true, l1: 'PVP',
      p2: activeTier === 2, l2: 'Precio',
      p3: activeTier === 3, l3: 'Precio',
      isStaff: false,
      highlightLine: activeTier,
    };
  }
  return { p1: true, l1: 'T1', p2: true, l2: 'T2', p3: true, l3: 'T3', isStaff: true, highlightLine: null };
}

export default function OfferTable({ offers, onSelect, onExport, onShare, pagination, onPageChange, sortBy, onSortChange, loading, exporting }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { addToast } = useToast();
  const pc = getPriceConfig(user?.roles || [user?.role].filter(Boolean), user?.priceTier);

  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Close share dropdown on outside click
  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

  // Close export dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Enlace copiado al portapapeles', 'success');
    } catch (err) {
      addToast('No se pudo copiar el enlace', 'error');
    }
  };

  const handleRowClick = (offer) => {
    if (offer.imagenUrl && onSelect) {
      onSelect(offer);
    }
  };

  return (
    <div className="offer-table-wrapper">
      <table className="offer-table">
        <thead>
          <tr>
            <th className="th-img">
              <div className="th-img-actions">
                {pc.isStaff ? (
                  <div className="th-dropdown-wrapper" ref={exportRef}>
                    <button className="th-action-btn" onClick={() => setExportOpen(prev => !prev)} title="Exportar a Excel" disabled={exporting}>
                      {exporting ? <span className="th-action-spinner" /> : <Download size={14} />}
                    </button>
                    {exportOpen && (
                      <div className="th-dropdown">
                        <button className="th-dropdown-item" onClick={() => { onExport?.('full'); setExportOpen(false); }}>
                          T1 + T2 + T3
                        </button>
                        <button className="th-dropdown-item" onClick={() => { onExport?.('pvp+pt2'); setExportOpen(false); }}>
                          PVP + T2
                        </button>
                        <button className="th-dropdown-item" onClick={() => { onExport?.('pvp+pt3'); setExportOpen(false); }}>
                          PVP + T3
                        </button>
                        <button className="th-dropdown-item" onClick={() => { onExport?.('pvp'); setExportOpen(false); }}>
                          Solo PVP
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="th-action-btn" onClick={() => onExport?.()} title="Exportar a Excel" disabled={exporting}>
                    {exporting ? <span className="th-action-spinner" /> : <Download size={14} />}
                  </button>
                )}
                <div className="th-dropdown-wrapper" ref={shareRef}>
                  <button className="th-action-btn" onClick={() => setShareOpen(prev => !prev)} title="Compartir">
                    <Share2 size={14} />
                  </button>
                  {shareOpen && (
                    <div className="th-dropdown">
                      <button className="th-dropdown-item" onClick={() => { onShare?.(); setShareOpen(false); }}>
                        <Share2 size={14} /> Compartir
                      </button>
                      <button className="th-dropdown-item" onClick={() => { copyLink(); setShareOpen(false); }}>
                        <Link2 size={14} /> Copiar enlace
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </th>
            <th
              className="th-art"
              onClick={() => onSortChange && onSortChange()}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Artículo
                <ArrowUpDown
                  size={14}
                  style={{
                    opacity: sortBy === 'nombre' ? 1 : 0.3,
                    color: sortBy === 'nombre' ? 'var(--color-primary)' : undefined,
                    transition: 'opacity 0.2s',
                  }}
                />
              </span>
            </th>
            <th className="th-info">INFO</th>
            <th className="th-ubic">Ubic</th>
            <th className="th-mp">Mac/Pres</th>
            <th className="th-ac">Alt/Cal</th>
            <th className="th-uds">Uds</th>
            <th className="th-fam">Familia</th>
            <th className="th-precios">€€€</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="skeleton-row">
                <td><div className="skeleton-cell" style={{ width: 40, height: 40, borderRadius: '50%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '70%' }} /></td>
                <td className="cell-info"><div className="skeleton-cell" style={{ width: '50%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '30%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '40%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '35%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '25%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '50%' }} /></td>
                <td><div className="skeleton-cell" style={{ width: '40%' }} /></td>
              </tr>
            ))
          ) : !offers || offers.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            offers.map(offer => (
              <tr key={offer.codigoArticulo} className="offer-row" onClick={() => handleRowClick(offer)}>
                <td className="cell-img">
                  <div className="img-frame">
                    {offer.imagenUrl ? (
                      <img src={getCloudinaryUrl(offer.imagenUrl, 'small')} alt={offer.descripcionArticulo} className="img-tumblr" />
                    ) : (
                      <div className="img-placeholder">
                        <svg className="img-placeholder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span className="img-placeholder-code">{offer.codigoArticulo}</span>
                      </div>
                    )}
                    <button
                      className="btn-fav-table"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(offer.codigoArticulo); }}
                      title={isFavorite(offer.codigoArticulo) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <HeartIcon size={16} filled={isFavorite(offer.codigoArticulo)} />
                    </button>
                  </div>
                </td>
                <td className="cell-name">
                  <div className="cell-name-inner">
                    <span className="cell-art-name">{offer.descripcionArticulo}</span>
                    <span className="cell-art-code">{offer.codigoArticulo}</span>
                    <span className="cell-art-meta">
                      {offer.ean || ''}
                    </span>
                    <div className="cell-offers">
                      {OFFER_CENTERS.filter(c => offer[c.key]).map(c => (
                        <span key={c.key} className={'list-tag list-tag-offer list-tag-' + c.color}>{c.label}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="cell-info">
                  <div className="info-stacked">
                    <span className="info-line info-maceta">
                      {offer.maceta || '—'} · {offer.presentacion || '—'}
                    </span>
                    <span className="info-line info-altcal">
                      {offer.altura || '—'} / {offer.calibre || '—'}
                    </span>
                    <span className="info-line info-familia">
                      {offer.descripcion && <span className="list-tag-sm">{offer.descripcion}</span>}
                    </span>
                    <div className="precios-stacked">
                      {pc.p1 && offer.precio1 != null && (
                        <span className="precio-line">
                          <span className="precio-label">{pc.l1}</span>
                          <span className="precio-valor">{offer.precio1.toFixed(2)} €</span>
                        </span>
                      )}
                      {pc.p2 && offer.precio2 != null && (
                        <span className={`precio-line${pc.highlightLine === 2 ? ' precio-destacado' : ''}`}>
                          <span className="precio-label">{pc.l2}</span>
                          <span className="precio-valor">{offer.precio2.toFixed(2)} €</span>
                        </span>
                      )}
                      {pc.p3 && offer.precio3 != null && (
                        <span className={`precio-line${pc.highlightLine === 3 ? ' precio-destacado' : ''}`}>
                          <span className="precio-label">{pc.l3}</span>
                          <span className="precio-valor">{offer.precio3.toFixed(2)} €</span>
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="cell-ubic">
                  {offer.ubicacion || '—'}
                </td>
                <td className="cell-stacked">
                  <div className="cell-stacked-inner">
                    <span>{offer.maceta || '—'}</span>
                    <span className="stacked-sub">{offer.presentacion || '—'}</span>
                  </div>
                </td>
                <td className="cell-stacked">
                  <div className="cell-stacked-inner">
                    <span>{offer.altura || '—'}</span>
                    <span className="stacked-sub">{offer.calibre || '—'}</span>
                  </div>
                </td>
                <td className="cell-stacked cell-uds">
                  <div className="cell-stacked-inner">
                    <span>UCC {offer.undsCarro ?? '—'}</span>
                    <span>UTA {offer.undsTabla ?? '—'}</span>
                    <span>UCA {offer.undsCaja ?? '—'}</span>
                  </div>
                </td>
                <td className="cell-fam">
                  {offer.descripcion && <span className="list-tag">{offer.descripcion}</span>}
                </td>
                <td className="cell-precios">
                  <div className="precios-stacked">
                    {pc.p1 && offer.precio1 != null && (
                      <span className="precio-line">
                        <span className="precio-label">{pc.l1}</span>
                        <span className="precio-valor">{offer.precio1.toFixed(2)} €</span>
                      </span>
                    )}
                    {pc.p2 && offer.precio2 != null && (
                      <span className={`precio-line${pc.highlightLine === 2 ? ' precio-destacado' : ''}`}>
                        <span className="precio-label">{pc.l2}</span>
                        <span className="precio-valor">{offer.precio2.toFixed(2)} €</span>
                      </span>
                    )}
                    {pc.p3 && offer.precio3 != null && (
                      <span className={`precio-line${pc.highlightLine === 3 ? ' precio-destacado' : ''}`}>
                        <span className="precio-label">{pc.l3}</span>
                        <span className="precio-valor">{offer.precio3.toFixed(2)} €</span>
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="offer-table-footer">
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
