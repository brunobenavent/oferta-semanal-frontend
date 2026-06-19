/**
 * Cálculos bidireccionales para el sistema de prepedidos.
 * 
 * Fórmulas:
 *   karrys_llenos = Math.floor(unidades / UCC)        // UCC > 0
 *   progreso_karry = (unidades % UCC) / UCC * 100      // UCC > 0
 *   tablas_llenas = Math.floor(unidades / UTA)         // UTA > 0
 *   progreso_tabla = (unidades % UTA) / UTA * 100      // UTA > 0
 * 
 * Si cambian KARRYS → unidades = karrys * UCC
 * Si cambian TABLAS → unidades = tablas * UTA
 */

/**
 * Calcula karrys llenos desde unidades
 */
export function calcKarrys(unidades, UCC) {
  if (!UCC || UCC <= 0) return 0;
  return Math.floor(unidades / UCC);
}

/**
 * Calcula progreso hacia el siguiente karry (0-100)
 */
export function calcKarryProgress(unidades, UCC) {
  if (!UCC || UCC <= 0) return 0;
  return ((unidades % UCC) / UCC) * 100;
}

/**
 * Calcula tablas llenas desde unidades
 */
export function calcTablas(unidades, UTA) {
  if (!UTA || UTA <= 0) return 0;
  return Math.floor(unidades / UTA);
}

/**
 * Calcula progreso hacia la siguiente tabla (0-100)
 */
export function calcTablaProgress(unidades, UTA) {
  if (!UTA || UTA <= 0) return 0;
  return ((unidades % UTA) / UTA) * 100;
}

/**
 * Dado unidades, devuelve el estado completo (unidades + karrys + tablas)
 */
export function calcFromUnidades(unidades, { undsCarro, undsTabla }) {
  return {
    unidades: Math.max(0, Math.floor(unidades)),
    karrys: calcKarrys(unidades, undsCarro),
    karryProgress: calcKarryProgress(unidades, undsCarro),
    tablas: calcTablas(unidades, undsTabla),
    tablaProgress: calcTablaProgress(unidades, undsTabla),
  };
}

/**
 * Dado karrys, recalcula unidades y tablas
 */
export function calcFromKarrys(karrys, { undsCarro, undsTabla }) {
  const unidades = Math.max(0, karrys) * (undsCarro > 0 ? undsCarro : 1);
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}

/**
 * Dado tablas, recalcula unidades y karrys
 */
export function calcFromTablas(tablas, { undsCarro, undsTabla }) {
  const unidades = Math.max(0, tablas) * (undsTabla > 0 ? undsTabla : 1);
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}
