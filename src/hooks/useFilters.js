import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useFilters() {
  const [options, setOptions] = useState({
    centros: [],
    familias: [],
    macetas: [],
    alturas: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/offers/filters')
      .then(({ data }) => setOptions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { ...options, loading };
}
