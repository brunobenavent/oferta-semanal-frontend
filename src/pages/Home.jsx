import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Image as ImageIcon, SlidersHorizontal, ChevronsDown } from 'lucide-react';
import { getCloudinaryUrl } from '../utils/cloudinaryUrl';
import { useOffers } from '../hooks/useOffers';
import { useFavorites } from '../context/FavoritesContext';
import HeartIcon from '../components/HeartIcon';
import FilterBar from '../components/FilterBar';
import ViewToggle from '../components/ViewToggle';
import OfferCard from '../components/OfferCard';
import OfferTable from '../components/OfferTable';
import Pagination from '../components/Pagination';
import './Home.css';

export default function Home({ onExport, onShare, onSemana, onCounts }) {
  const { offers, pagination, totalSinFiltros, semana, semanaAnio, filters, loading, error, updateFilter, clearFilters, changePage } = useOffers();
  const { favorites, replaceFavorites } = useFavorites();
  const [view, setView] = useState('list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [filterBarVisible, setFilterBarVisible] = useState(true);
  const [paginationVisible, setPaginationVisible] = useState(true);
  const filterBarRef = useRef(null);
  const paginationRef = useRef(null);

  // Track mobile-nav height for sticky tfooter offset
  useEffect(() => {
    const nav = document.querySelector('.mobile-nav');
    if (!nav) return;
    const updateHeight = () => {
      document.documentElement.style.setProperty('--mobile-nav-height', `${nav.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (onSemana && semana) onSemana(semana);
  }, [semana, onSemana]);

  useEffect(() => {
    if (onCounts && totalSinFiltros > 0) {
      onCounts(totalSinFiltros, pagination.total);
    }
  }, [totalSinFiltros, pagination.total, onCounts]);

  useEffect(() => {
    if (!selectedOffer) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedOffer]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page]);

  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFilterBarVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = paginationRef.current;
    if (!el || pagination.pages <= 1) {
      setPaginationVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPaginationVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pagination.pages]);

  const openLightbox = (offer) => {
    setClosing(false);
    setImageLoading(true);
    setSelectedOffer(offer);
  };

  const closeLightbox = () => {
    setClosing(true);
    setTimeout(() => {
      setSelectedOffer(null);
      setClosing(false);
    }, 200);
  };

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  const handleClearAll = useCallback(() => {
    clearFilters();
    setShowFavoritesOnly(false);
  }, [clearFilters]);

  // Sync favorites → codigos filter: cuando cambian los favoritos o se togglea el modo
  useEffect(() => {
    if (showFavoritesOnly) {
      if (favorites.length > 0) {
        updateFilter('codigos', favorites.join(','));
      } else {
        // No hay favoritos, salir del modo
        setShowFavoritesOnly(false);
        updateFilter('codigos', '');
      }
    } else if (filters.codigos) {
      updateFilter('codigos', '');
    }
  }, [showFavoritesOnly, favorites]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side filter: cuando se togglean favoritos y la API está cargando,
  // mostramos instantáneamente las ofertas visibles que coinciden
  const displayOffers = showFavoritesOnly && loading
    ? offers.filter(o => favorites.includes(o.codigoArticulo))
    : offers;

  // Pagination instantánea para favoritos: mientras la API carga, computamos
  // total/páginas desde localStorage para que no se vea la paginación vieja
  const displayPagination = showFavoritesOnly && loading
    ? { ...pagination, total: favorites.length, pages: Math.ceil(favorites.length / pagination.limit) || 1 }
    : pagination;

  const displayTotal = showFavoritesOnly && loading ? favorites.length : pagination.total;

  // Clean up stale favorites (códigos que ya no existen en la oferta actual)
  useEffect(() => {
    if (!showFavoritesOnly || !offers.length || !favorites.length || !filters.codigos || loading) return;
    const matched = new Set(offers.map(o => o.codigoArticulo));
    const stale = favorites.filter(f => !matched.has(f));
    if (stale.length > 0) {
      replaceFavorites(favorites.filter(f => matched.has(f)));
    }
  }, [showFavoritesOnly, offers, favorites, replaceFavorites, filters.codigos, loading]);

  return (
    <div className="dashboard">
      <div className="dashboard-topbar">
          <div className="dashboard-title">
            <h1>Oferta de la Semana <span className="week-highlight">{semana || ''}</span></h1>
            <p>Explora las ofertas semanales de Viveros Guzmán</p>
            <p className="dashboard-count-label">
              {totalSinFiltros > 0
                ? showFavoritesOnly
                  ? `${displayTotal.toLocaleString('es')} favoritos`
                  : totalSinFiltros === displayTotal
                    ? `${totalSinFiltros.toLocaleString('es')} artículos`
                    : `${displayTotal.toLocaleString('es')} de ${totalSinFiltros.toLocaleString('es')} artículos encontrados`
                : '\u00A0'
              }
            </p>
          </div>
        <div className="search-toolbar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por código o nombre..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            {filters.search && (
              <button type="button" className="search-clear-btn" onClick={() => updateFilter('search', '')}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="header-actions">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </div>

      <div className="filters-row">
        <button
          className={`btn-fav-filter${showFavoritesOnly ? ' active' : ''}`}
          onClick={handleToggleFavorites}
          title={showFavoritesOnly ? 'Mostrar todas' : 'Solo favoritos'}
        >
          <HeartIcon size={20} filled={showFavoritesOnly} />
          <span>Favoritos</span>
          <span className="fav-count">{favorites.length}</span>
        </button>

        <div ref={filterBarRef} className="filter-bar-wrap">
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onClear={handleClearAll}
          />
        </div>
      </div>

      {error ? (
        <div className="dashboard-empty">
          <ImageIcon size={48} />
          <h3>Error al cargar las ofertas</h3>
          <p>{error}</p>
        </div>
      ) : view === 'list' ? (
        <OfferTable
          offers={displayOffers}
          onSelect={openLightbox}
          onExport={onExport}
          onShare={onShare}
          pagination={displayPagination}
          onPageChange={changePage}
          sortBy={filters.sortBy}
          onSortChange={() => updateFilter('sortBy', filters.sortBy === 'nombre' ? '' : 'nombre')}
          loading={loading}
        />
      ) : (
        <>
          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-preview" />
                  <div style={{ padding: 'var(--space-md)' }}>
                    <div className="skeleton-line" style={{ width: '60%', height: '14px' }} />
                    <div className="skeleton-line" style={{ width: '40%', height: '12px', marginTop: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !displayOffers.length ? (
            <div className="dashboard-empty">
              <ImageIcon size={48} />
              <h3>No se encontraron resultados</h3>
              <p>Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="offer-grid">
              {displayOffers.map(offer => (
                <OfferCard key={offer.codigoArticulo} offer={offer} onSelect={openLightbox} />
              ))}
            </div>
          )}
          <Pagination pagination={displayPagination} onPageChange={changePage} />
        </>
      )}

      {/* Sentinel para FAB de paginación — detecta si el fondo del contenido es visible */}
      <div ref={paginationRef} className="pagination-sentinel" aria-hidden="true" />

      <button
        className={`fab fab-filters${!filterBarVisible ? ' fab-visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir a filtros"
      >
        <SlidersHorizontal size={20} />
      </button>

      <button
        className={`fab fab-pagination${!paginationVisible && pagination.pages > 1 ? ' fab-visible' : ''}`}
        onClick={() => paginationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        aria-label="Ir a paginación"
      >
        <ChevronsDown size={20} />
      </button>

      {selectedOffer && (
        <div className={'modal-overlay' + (closing ? ' closing' : '')} onClick={closeLightbox}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeLightbox}>
              <X size={24} />
            </button>
            {imageLoading && (
              <div className="modal-spinner">
                <ImageIcon size={48} />
              </div>
            )}
            <img
              src={getCloudinaryUrl(selectedOffer.imagenUrl, 'real')}
              alt={selectedOffer.codigoArticulo}
              className="modal-full-image"
              style={{ display: imageLoading ? 'none' : 'block' }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            <div className="modal-info">
              <h3>{selectedOffer.codigoArticulo}</h3>
              <p>{selectedOffer.descripcionArticulo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
