import { Filter, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFilters } from '../hooks/useFilters';

export default function FilterBar({ filters, onFilterChange, onClear }) {
  const { centros, familias, macetas, alturas } = useFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setFiltersOpen(false);
    }, 3000);
  }, [clearTimer]);

  useEffect(() => {
    if (filtersOpen) {
      resetTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [filtersOpen, resetTimer, clearTimer]);

  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
    if (filtersOpen) resetTimer();
  };

  const handleClear = () => {
    onClear();
    if (filtersOpen) resetTimer();
  };

  const hasActiveFilters = filters.search || filters.centro || filters.familia || filters.maceta || filters.altura;

  const filterLabels = {
    centro: 'Centro',
    familia: 'Familia',
    maceta: 'Maceta',
    altura: 'Altura',
  };

  const activeFilterEntries = Object.entries(filterLabels)
    .filter(([key]) => filters[key])
    .map(([key, label]) => ({ key, label, value: filters[key] }));

  return (
    <>
      <div className="filters-toggle-wrapper">
        <button className="filters-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
          <Filter size={16} />
          <span>Filtros</span>
          {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {hasActiveFilters && (
          <button className="filters-toggle-clear" onClick={handleClear} title="Limpiar filtros">
            <RotateCcw size={14} />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {activeFilterEntries.length > 0 && (
        <div className="filter-active-tags">
          {activeFilterEntries.map(({ key, label, value }) => (
            <span key={key} className="filter-tag">
              <span className="filter-tag-label">{label}:</span> {value}
              <button
                className="filter-tag-remove"
                onClick={() => handleFilterChange(key, '')}
                title={`Eliminar filtro ${label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={`filters-bar ${filtersOpen ? 'open' : ''}`}>
        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          <select value={filters.centro} onChange={(e) => handleFilterChange('centro', e.target.value)} className="filter-select">
            <option value="">Todos los centros</option>
            {centros.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.familia} onChange={(e) => handleFilterChange('familia', e.target.value)} className="filter-select">
            <option value="">Todas las familias</option>
            {familias.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filters.maceta} onChange={(e) => handleFilterChange('maceta', e.target.value)} className="filter-select">
            <option value="">Todas las macetas</option>
            {macetas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filters.altura} onChange={(e) => handleFilterChange('altura', e.target.value)} className="filter-select">
            <option value="">Todas las alturas</option>
            {alturas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {hasActiveFilters && (
            <button onClick={handleClear} className="filters-clear-inside btn btn-sm btn-ghost">
              <RotateCcw size={14} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
