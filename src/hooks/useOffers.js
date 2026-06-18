import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export function useOffers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [codigos, setCodigos] = useState('');
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Filters derived from URL params + codigos (never in URL)
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    centro: searchParams.get('centro') || '',
    familia: searchParams.get('familia') || '',
    maceta: searchParams.get('maceta') || '',
    altura: searchParams.get('altura') || '',
    sortBy: searchParams.get('sortBy') || '',
    page: parseInt(searchParams.get('page'), 10) || 1,
    limit: 100,
    codigos,
  }), [searchParams, codigos]);

  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1, limit: 100 });
  const [totalSinFiltros, setTotalSinFiltros] = useState(0);
  const [semana, setSemana] = useState(null);
  const [semanaAnio, setSemanaAnio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOffers = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...f };
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== undefined)
      );
      const { data } = await api.get('/offers', { params: cleanParams });
      setOffers(data.offers);
      setPagination(data.pagination);
      setTotalSinFiltros(data.totalSinFiltros);
      setSemana(data.semana);
      setSemanaAnio(data.semanaAnio);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers(filters);
  }, [filters, fetchOffers]);

  const updateFilter = useCallback((key, value) => {
    // codigos stays local — never written to URL
    if (key === 'codigos') {
      setCodigos(value);
      return;
    }

    const next = new URLSearchParams(searchParamsRef.current);
    if (!value || value === '') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    // Reset page when any non-page filter changes
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setCodigos('');
  }, [setSearchParams]);

  const changePage = useCallback((page) => {
    updateFilter('page', page);
  }, [updateFilter]);

  return {
    offers, pagination, totalSinFiltros, semana, semanaAnio, filters, loading, error,
    updateFilter, clearFilters, changePage, refetch: () => fetchOffers(filters),
  };
}
