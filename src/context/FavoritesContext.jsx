import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

const STORAGE_KEY = 'oferta-favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((codigoArticulo) => {
    setFavorites(prev =>
      prev.includes(codigoArticulo)
        ? prev.filter(f => f !== codigoArticulo)
        : [...prev, codigoArticulo]
    );
  }, []);

  const replaceFavorites = useCallback((newFavorites) => {
    setFavorites(newFavorites);
  }, []);

  const isFavorite = useCallback((codigoArticulo) => {
    return favorites.includes(codigoArticulo);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, replaceFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}
