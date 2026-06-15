import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useOffers() {
  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1, limit: 100 });
  const [totalSinFiltros, setTotalSinFiltros] = useState(0);
  const [semana, setSemana] = useState(null);
  const [semanaAnio, setSemanaAnio] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    centro: '',
    familia: '',
    maceta: '',
    altura: '',
    sortBy: '',
    codigos: '',
    page: 1,
    limit: 100
  });
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
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      centro: '',
      familia: '',
      maceta: '',
      altura: '',
      sortBy: '',
      codigos: '',
      page: 1,
      limit: 100
    });
  }, []);

  const changePage = useCallback((page) => {
    updateFilter('page', page);
  }, [updateFilter]);

  return {
    offers, pagination, totalSinFiltros, semana, semanaAnio, filters, loading, error,
    updateFilter, clearFilters, changePage, refetch: () => fetchOffers(filters)
  };
}
