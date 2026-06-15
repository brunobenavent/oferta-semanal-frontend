import { Eye, Flower, ArrowUpDown } from 'lucide-react';
import HeartIcon from './HeartIcon';
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

export default function OfferCard({ offer, onSelect }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const role = user?.role;
  const priceTier = user?.priceTier;
  const showPrice2 = role === 'employee' || role === 'admin' || role === 'superadmin' || (role === 'client' && priceTier === 2);
  const showPrice3 = role === 'employee' || role === 'admin' || role === 'superadmin' || (role === 'client' && priceTier === 3);
  const fav = isFavorite(offer.codigoArticulo);
  const activeCenters = OFFER_CENTERS.filter(c => offer[c.key]);

  const handleCardClick = () => {
    if (offer.imagenUrl && onSelect) {
      onSelect(offer);
    }
  };

  return (
    <div className="offer-card" onClick={handleCardClick}>
      <div className="offer-card-image">
        {offer.imagenUrl ? (
          <img src={getCloudinaryUrl(offer.imagenUrl, 'medium')} alt={offer.descripcionArticulo} loading="lazy" />
        ) : (
          <div className="offer-card-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <button
          className={`btn-fav ${fav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(offer.codigoArticulo); }}
          title={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <HeartIcon size={25} filled={fav} />
        </button>
      </div>
      <div className="offer-card-body">
        <div className="offer-card-code">{offer.codigoArticulo}</div>
        <h3 className="offer-name">{offer.descripcionArticulo}</h3>
        <div className="offer-details">
          {offer.descripcion && <span className="offer-tag">{offer.descripcion}</span>}
        </div>
        {activeCenters.length > 0 && (
          <div className="offer-centers">
            {activeCenters.map(c => (
              <span key={c.key} className={'offer-center-tag offer-center-tag--' + c.color}>{c.label}</span>
            ))}
          </div>
        )}
        <div className="offer-meta">
          {offer.maceta && <span className="meta-item"><Flower size={12} className="meta-icon" />{offer.maceta}</span>}
          {offer.presentacion && <span className="meta-item"><Eye size={12} className="meta-icon" />{offer.presentacion}</span>}
          {offer.altura && <span className="meta-item"><ArrowUpDown size={12} className="meta-icon" />{offer.altura}</span>}
          {offer.calibre && <span className="meta-item">{offer.calibre}</span>}
          {offer.ubicacion && <span className="meta-item">Ubic: {offer.ubicacion}</span>}
        </div>
        <div className="offer-prices">
          {offer.precio1 != null && (
            <div className="offer-price offer-price--pvp">
              <span className="offer-price-label">{role === 'client' ? 'PVP' : 'T1'}</span>
              <span className="offer-price-value">{offer.precio1.toFixed(2)} €</span>
            </div>
          )}
          {showPrice2 && offer.precio2 != null && (
            <div className="offer-price offer-price--secondary">
              <span className="offer-price-label">{role === 'client' ? 'Precio' : 'T2'}</span>
              <span className="offer-price-value">{offer.precio2.toFixed(2)} €</span>
            </div>
          )}
          {showPrice3 && offer.precio3 != null && (
            <div className="offer-price offer-price--secondary">
              <span className="offer-price-label">{role === 'client' ? 'Precio' : 'T3'}</span>
              <span className="offer-price-value">{offer.precio3.toFixed(2)} €</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}