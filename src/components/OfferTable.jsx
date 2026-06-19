import { useState, useRef, useEffect } from 'react';
import { Download, Share2, ArrowUpDown, Link2, Camera, Trash2, Package, Truck, Columns } from 'lucide-react';
import api from '../api/axios';
import HeartIcon from './HeartIcon';
import Pagination from './Pagination';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { usePreOrder } from '../context/PreOrderContext';
import { getCloudinaryUrl } from '../utils/cloudinaryUrl';
import { useToast } from './Toast';
import { calcKarryProgress, calcTablaProgress } from '../utils/calcPreorder';

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

export default function OfferTable({ offers, onSelect, onExport, onShare, pagination, onPageChange, sortBy, onSortChange, loading, exporting, onRefresh }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user, isClient } = useAuth();
  const { draftItems, updateUnidades, setFromKarrys, setFromTablas } = usePreOrder();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploadingCodigo, setUploadingCodigo] = useState(null);
  const [deletingCodigo, setDeletingCodigo] = useState(null);
  const [confirmDeleteCodigo, setConfirmDeleteCodigo] = useState(null);
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const codigo = uploadingCodigo;
    if (!file || !codigo) return;
    
    const formData = new FormData();
    formData.append('imagen', file);
    
    try {
      await api.post(`/offers/${codigo}/imagen`, formData);
      addToast('Imagen subida correctamente', 'success');
      await onRefresh?.();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      addToast(`Error al subir imagen: ${msg}`, 'error');
    } finally {
      setUploadingCodigo(null);
      e.target.value = null; // reset input
    }
  };

  const handleDeleteImagen = async (codigo) => {
    setDeletingCodigo(codigo);
    setConfirmDeleteCodigo(null);
    try {
      await api.delete(`/offers/${codigo}/imagen`);
      addToast('Imagen restaurada — el ciclo automático la repondrá', 'success');
      await onRefresh?.();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      addToast(`Error al restaurar imagen: ${msg}`, 'error');
    } finally {
      setDeletingCodigo(null);
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
                      {exporting ? <span className="th-action-spinner" /> : <Download size={16} strokeWidth={1.5} />}
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
                    {exporting ? <span className="th-action-spinner" /> : <Download size={16} strokeWidth={1.5} />}
                  </button>
                )}
                <div className="th-dropdown-wrapper" ref={shareRef}>
                  <button className="th-action-btn" onClick={() => setShareOpen(prev => !prev)} title="Compartir">
                    <Share2 size={16} strokeWidth={1.5} />
                  </button>
                  {shareOpen && (
                    <div className="th-dropdown">
                      <button className="th-dropdown-item" onClick={() => { onShare?.(); setShareOpen(false); }}>
                        <Share2 size={16} strokeWidth={1.5} /> Compartir
                      </button>
                      <button className="th-dropdown-item" onClick={() => { copyLink(); setShareOpen(false); }}>
                        <Link2 size={16} strokeWidth={1.5} /> Copiar enlace
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
                  size={16}
                  strokeWidth={1.5}
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
            {isClient && <th className="th-pedido">Pedido</th>}
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
                {isClient && <td><div className="skeleton-cell" style={{ width: '30%' }} /></td>}
              </tr>
            ))
          ) : !offers || offers.length === 0 ? (
            <tr>
              <td colSpan={isClient ? 10 : 9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
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
                    {(uploadingCodigo === offer.codigoArticulo || deletingCodigo === offer.codigoArticulo) && (
                      <div className="img-loading-overlay">
                        <span className="th-action-spinner" />
                      </div>
                    )}
                    {pc.isStaff && offer.imagenUrl && (
                      <button
                        className="btn-delete-table"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteCodigo(offer.codigoArticulo); }}
                        title="Restaurar imagen original"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    {pc.isStaff && (
                      <button
                        className="btn-upload-table"
                        onClick={(e) => { e.stopPropagation(); setUploadingCodigo(offer.codigoArticulo); fileInputRef.current?.click(); }}
                        title="Cambiar imagen"
                      >
                        <Camera size={16} />
                      </button>
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
                {isClient && (
                  <td className="cell-pedido" onClick={e => e.stopPropagation()}>
                    <div className="pedido-cell-inner">
                      <div className="pedido-row">
                        <svg className="pedido-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Planta">
                          {/* tallo */}
                          <path d="M12 22 L12 13" />
                          {/* hojas izquierda y derecha */}
                          <path d="M12 13 C 12 8, 7 7, 6 4 C 10 4, 12 9, 12 13" />
                          <path d="M12 13 C 12 8, 17 7, 18 4 C 14 4, 12 9, 12 13" />
                          {/* maceta */}
                          <path d="M7 14 L17 14 L16 22 L8 22 Z" />
                        </svg>
                        <button
                          className="pedido-add-btn pedido-add-btn--minus"
                          onClick={() => {
                            const item = draftItems.get(offer.codigoArticulo);
                            if ((item?.unidades || 0) > 0) {
                              updateUnidades(offer.codigoArticulo, -1, offer);
                            }
                          }}
                          title="-1 unidad"
                          type="button"
                        >−</button>
                        <button
                          className="pedido-add-btn"
                          onClick={() => updateUnidades(offer.codigoArticulo, 1, offer)}
                          title="+1 unidad"
                          type="button"
                        >+</button>
                        <span className="pedido-uds-value">
                          {draftItems.get(offer.codigoArticulo)?.unidades || 0}
                        </span>
                      </div>
                      {(offer.undsTabla > 0) && (
                        <div className="pedido-row">
                          <svg className="pedido-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Tabla">
                            {/* rectángulo principal horizontal */}
                            <rect x="3" y="8" width="18" height="8" />
                            {/* 4 enganches (segmentos horizontales) en los vértices */}
                            <path d="M1 8 L4 8" />
                            <path d="M20 8 L23 8" />
                            <path d="M1 16 L4 16" />
                            <path d="M20 16 L23 16" />
                          </svg>
                          <input
                            type="number" min="0" max="9999"
                            className="pedido-input"
                            value={draftItems.get(offer.codigoArticulo)?.tablas || 0}
                            onChange={e => setFromTablas(offer.codigoArticulo, parseInt(e.target.value) || 0)}
                          />
                          <div className="pedido-progress">
                            <div className="pedido-progress-fill" style={{width: `${calcTablaProgress(draftItems.get(offer.codigoArticulo)?.unidades || 0, offer.undsTabla)}%`}} />
                          </div>
                        </div>
                      )}
                      {(offer.undsCarro > 0) && (
                        <div className="pedido-row">
                          <svg className="pedido-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Carrito">
                            {/* lados verticales (sin tapa arriba), más vertical/rectangular */}
                            <path d="M7 2 L7 15 L17 15 L17 2" />
                            {/* 3 baldas intermedias */}
                            <path d="M7 6 L17 6" />
                            <path d="M7 9.5 L17 9.5" />
                            <path d="M7 13 L17 13" />
                            {/* 2 ruedas */}
                            <circle cx="9" cy="19" r="1.8" />
                            <circle cx="15" cy="19" r="1.8" />
                          </svg>
                          <input
                            type="number" min="0" max="9999"
                            className="pedido-input"
                            value={draftItems.get(offer.codigoArticulo)?.karrys || 0}
                            onChange={e => setFromKarrys(offer.codigoArticulo, parseInt(e.target.value) || 0)}
                          />
                          <div className="pedido-progress">
                            <div className="pedido-progress-fill" style={{width: `${calcKarryProgress(draftItems.get(offer.codigoArticulo)?.unidades || 0, offer.undsCarro)}%`}} />
                          </div>
                        </div>
                      )}
                      {/* Resumen de unidades totales (karrys×UCC + tablas×UTA + uds sueltas) */}
                      {(() => {
                        const item = draftItems.get(offer.codigoArticulo);
                        if (!item) return null;
                        const k = item.karrys || 0;
                        const t = item.tablas || 0;
                        const u = item.unidades || 0;
                        const UCC = offer.undsCarro || 0;
                        const UTA = offer.undsTabla || 0;
                        const total = k * UCC + t * UTA + u;
                        if (total === 0) return null;
                        return (
                          <div className="pedido-summary" title={`${k}×${UCC} + ${t}×${UTA} + ${u} = ${total} uds`}>
                            <span className="pedido-summary-total">{total} ud{total > 1 ? 's' : ''}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="offer-table-footer">
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>

      {confirmDeleteCodigo && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 'var(--space-md)'
        }}
          onClick={() => setConfirmDeleteCodigo(null)}
        >
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            maxWidth: 400,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 var(--space-sm)', fontSize: '1.125rem' }}>Restaurar imagen original</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-lg)' }}>
              ¿Seguro que querés restaurar la imagen original de <strong>{confirmDeleteCodigo}</strong>?
              Se va a perder la imagen que subiste manualmente.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDeleteCodigo(null)}
              >
                Cancelar
              </button>
              <button
                className="btn"
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  opacity: deletingCodigo === confirmDeleteCodigo ? 0.6 : 1,
                  width: 'auto', padding: '8px 16px', fontSize: '0.8125rem'
                }}
                onClick={() => handleDeleteImagen(confirmDeleteCodigo)}
                disabled={deletingCodigo === confirmDeleteCodigo}
              >
                {deletingCodigo === confirmDeleteCodigo ? 'Restaurando...' : 'Sí, restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleUpload} style={{display: 'none'}} />
    </div>
  );
}
