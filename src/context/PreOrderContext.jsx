import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { calcFromUnidades } from '../utils/calcPreorder';

const PreOrderContext = createContext(null);

const DEBOUNCE_MS = 1500;
const LS_PREFIX = 'preorder-draft-';

export function PreOrderProvider({ children }) {
  const { user, isAuthenticated, isClient, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [draft, setDraft] = useState(null);       // current PreOrder document
  const [draftItems, setDraftItems] = useState(new Map()); // codigo → item (mirrors draft.items)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const lastSavedRef = useRef(null); // updatedAt for staleness check

  const userId = user?._id || user?.id;

  // ── Load or create draft on mount ──
  useEffect(() => {
    if (authLoading || !isAuthenticated || !isClient || !userId) return;

    const loadDraft = async () => {
      setLoading(true);
      setError(null);
      try {
        const savedId = localStorage.getItem(`${LS_PREFIX}${userId}`);

        if (savedId) {
          const { data } = await api.get(`/preorders/${savedId}`);
          if (data && data.estado === 'borrador') {
            setDraft(data);
            lastSavedRef.current = data.updatedAt;
            setDraftItems(new Map(data.items.map(i => [i.codigoArticulo, i])));
            return;
          }
          // Draft was sent or deleted — clear localStorage
          localStorage.removeItem(`${LS_PREFIX}${userId}`);
        }

        // Create new borrador
        const { data } = await api.post('/preorders');
        setDraft(data);
        lastSavedRef.current = data.updatedAt;
        localStorage.setItem(`${LS_PREFIX}${userId}`, data._id);
        setDraftItems(new Map());
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        console.error('[PreOrderContext] Error loading draft:', msg);
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [authLoading, isAuthenticated, isClient, userId]);

  // ── Auto-save with debounce ──
  const scheduleSave = useCallback((items, updatedAt) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!draft?._id || draft.estado !== 'borrador') return;
      setSaving(true);
      try {
        const itemsArray = Array.from(items.values()).map(i => ({
          codigoArticulo: i.codigoArticulo,
          descripcionArticulo: i.descripcionArticulo || '',
          undsCarro: i.undsCarro || 0,
          undsTabla: i.undsTabla || 0,
          undsCaja: i.undsCaja || 0,
          unidades: i.unidades || 0,
          precio1: i.precio1 || 0,
          precio2: i.precio2 || 0,
          precio3: i.precio3 || 0,
        }));

        const { data } = await api.patch(`/preorders/${draft._id}/items`, {
          items: itemsArray,
          updatedAt,
        });
        setDraft(data);
        lastSavedRef.current = data.updatedAt;
        setDraftItems(new Map(data.items.map(i => [i.codigoArticulo, i])));
      } catch (err) {
        if (err.response?.status === 409) {
          addToast('El prepedido fue modificado en otro lugar. Recargando...', 'error');
          // Reload draft
          try {
            const { data } = await api.get(`/preorders/${draft._id}`);
            setDraft(data);
            lastSavedRef.current = data.updatedAt;
            setDraftItems(new Map(data.items.map(i => [i.codigoArticulo, i])));
          } catch {}
        } else {
          const msg = err.response?.data?.message || err.message;
          addToast(`Error al guardar: ${msg}`, 'error');
        }
      } finally {
        setSaving(false);
      }
    }, DEBOUNCE_MS);
  }, [draft, addToast]);

  // ── Update unidades for an item ──
  const updateUnidades = useCallback((codigo, unidades, offerData = {}) => {
    if (draft?.estado !== 'borrador') return;

    setDraftItems(prev => {
      const next = new Map(prev);
      const existing = next.get(codigo) || {};
      const calc = calcFromUnidades(unidades, {
        undsCarro: offerData.undsCarro || existing.undsCarro || 0,
        undsTabla: offerData.undsTabla || existing.undsTabla || 0,
      });

      next.set(codigo, {
        codigoArticulo: codigo,
        descripcionArticulo: offerData.descripcionArticulo || existing.descripcionArticulo || '',
        undsCarro: offerData.undsCarro || existing.undsCarro || 0,
        undsTabla: offerData.undsTabla || existing.undsTabla || 0,
        undsCaja: offerData.undsCaja || existing.undsCaja || 0,
        precio1: offerData.precio1 || existing.precio1 || 0,
        precio2: offerData.precio2 || existing.precio2 || 0,
        precio3: offerData.precio3 || existing.precio3 || 0,
        ...calc,
      });

      // Auto-save after state update
      const updatedAt = lastSavedRef.current;
      setTimeout(() => scheduleSave(next, updatedAt), 0);

      return next;
    });
  }, [draft, scheduleSave]);

  // ── Set unidades from karrys (reverse calc) ──
  const setFromKarrys = useCallback((codigo, karrys) => {
    if (draft?.estado !== 'borrador') return;

    setDraftItems(prev => {
      const next = new Map(prev);
      const existing = next.get(codigo);
      if (!existing) return prev;

      const UCC = existing.undsCarro || 1;
      const unidades = Math.max(0, karrys) * UCC;
      const calc = calcFromUnidades(unidades, {
        undsCarro: existing.undsCarro,
        undsTabla: existing.undsTabla,
      });

      next.set(codigo, { ...existing, ...calc });

      const updatedAt = lastSavedRef.current;
      setTimeout(() => scheduleSave(next, updatedAt), 0);

      return next;
    });
  }, [draft, scheduleSave]);

  // ── Set unidades from tablas (reverse calc) ──
  const setFromTablas = useCallback((codigo, tablas) => {
    if (draft?.estado !== 'borrador') return;

    setDraftItems(prev => {
      const next = new Map(prev);
      const existing = next.get(codigo);
      if (!existing) return prev;

      const UTA = existing.undsTabla || 1;
      const unidades = Math.max(0, tablas) * UTA;
      const calc = calcFromUnidades(unidades, {
        undsCarro: existing.undsCarro,
        undsTabla: existing.undsTabla,
      });

      next.set(codigo, { ...existing, ...calc });

      const updatedAt = lastSavedRef.current;
      setTimeout(() => scheduleSave(next, updatedAt), 0);

      return next;
    });
  }, [draft, scheduleSave]);

  // ── Remove an item from draft ──
  const removeItem = useCallback((codigo) => {
    if (draft?.estado !== 'borrador') return;

    setDraftItems(prev => {
      const next = new Map(prev);
      next.delete(codigo);

      const updatedAt = lastSavedRef.current;
      setTimeout(() => scheduleSave(next, updatedAt), 0);

      return next;
    });
  }, [draft, scheduleSave]);

  // ── Send preorder (borrador → enviado) ──
  const sendPreorder = useCallback(async () => {
    if (!draft?._id || draft.estado !== 'borrador') return;
    if (draftItems.size === 0) {
      addToast('No hay artículos para enviar', 'error');
      return;
    }

    setSaving(true);
    try {
      // Save pending changes first
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      await api.patch(`/preorders/${draft._id}/items`, {
        items: Array.from(draftItems.values()).map(i => ({
          codigoArticulo: i.codigoArticulo,
          descripcionArticulo: i.descripcionArticulo || '',
          undsCarro: i.undsCarro || 0,
          undsTabla: i.undsTabla || 0,
          undsCaja: i.undsCaja || 0,
          unidades: i.unidades || 0,
          precio1: i.precio1 || 0,
          precio2: i.precio2 || 0,
          precio3: i.precio3 || 0,
        })),
        updatedAt: lastSavedRef.current,
      });

      const { data } = await api.patch(`/preorders/${draft._id}/estado`, {
        estado: 'enviado',
      });

      addToast('Prepedido enviado correctamente', 'success');

      // Clear and create new draft
      localStorage.removeItem(`${LS_PREFIX}${userId}`);
      setDraft(null);
      setDraftItems(new Map());

      const newDraft = await api.post('/preorders');
      setDraft(newDraft.data);
      lastSavedRef.current = newDraft.data.updatedAt;
      localStorage.setItem(`${LS_PREFIX}${userId}`, newDraft.data._id);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addToast(`Error al enviar prepedido: ${msg}`, 'error');
    } finally {
      setSaving(false);
    }
  }, [draft, draftItems, userId, addToast]);

  // ── Totals ──
  const totals = {
    unidades: Array.from(draftItems.values()).reduce((sum, i) => sum + (i.unidades || 0), 0),
    karrys: Array.from(draftItems.values()).reduce((sum, i) => sum + (i.karrys || 0), 0),
    tablas: Array.from(draftItems.values()).reduce((sum, i) => sum + (i.tablas || 0), 0),
  };

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const value = {
    draft,
    draftItems,
    loading,
    saving,
    error,
    isDirty: draftItems.size > 0,
    totals,
    updateUnidades,
    setFromKarrys,
    setFromTablas,
    removeItem,
    sendPreorder,
  };

  return (
    <PreOrderContext.Provider value={value}>
      {children}
    </PreOrderContext.Provider>
  );
}

export function usePreOrder() {
  const ctx = useContext(PreOrderContext);
  if (!ctx) throw new Error('usePreOrder must be used within PreOrderProvider');
  return ctx;
}
