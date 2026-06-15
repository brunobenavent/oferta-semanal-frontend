import { Download, Share2, ArrowUpDown } from 'lucide-react';
import HeartIcon from './HeartIcon';
import Pagination from './Pagination';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { getCloudinaryUrl } from '../utils/cloudinaryUrl';

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

export default function OfferTable({ offers, onSelect, onExport, onShare, pagination, onPageChange, sortBy, onSortChange }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const role = user?.role;
  const priceTier = user?.priceTier;

  const showPrice2 = role === 'employee' || role === 'admin' || role === 'superadmin' || (role === 'client' && priceTier === 2);
  const showPrice3 = role === 'employee' || role === 'admin' || role === 'superadmin' || (role === 'client' && priceTier === 3);

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
                <button className="th-action-btn" onClick={onExport} title="Exportar a Excel">
                  <Download size={14} />
                </button>
                <button className="th-action-btn" onClick={onShare} title="Compartir">
                  <Share2 size={14} />
                </button>
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
          {offers.map(offer => (
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
                    <span className="precio-line precio-pvp">
                      <span className="precio-label">{role === 'client' ? 'PVP' : 'T1'}</span>
                      <span className="precio-valor">{offer.precio1?.toFixed(2)} €</span>
                    </span>
                    {showPrice2 && offer.precio2 != null && (
                      <span className="precio-line">
                        <span className="precio-label">{role === 'client' ? 'Precio' : 'T2'}</span>
                        <span className="precio-valor">{offer.precio2.toFixed(2)} €</span>
                      </span>
                    )}
                    {showPrice3 && offer.precio3 != null && (
                      <span className="precio-line">
                        <span className="precio-label">{role === 'client' ? 'Precio' : 'T3'}</span>
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
                  <span className="precio-line precio-pvp">
                    <span className="precio-label">{role === 'client' ? 'PVP' : 'T1'}</span>
                    <span className="precio-valor">{offer.precio1?.toFixed(2)} €</span>
                  </span>
                  {showPrice2 && offer.precio2 != null && (
                    <span className="precio-line">
                      <span className="precio-label">{role === 'client' ? 'Precio' : 'T2'}</span>
                      <span className="precio-valor">{offer.precio2.toFixed(2)} €</span>
                    </span>
                  )}
                  {showPrice3 && offer.precio3 != null && (
                    <span className="precio-line">
                      <span className="precio-label">{role === 'client' ? 'Precio' : 'T3'}</span>
                      <span className="precio-valor">{offer.precio3.toFixed(2)} €</span>
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="offer-table-footer">
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
