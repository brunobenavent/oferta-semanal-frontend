/**
 * Cálculos bidireccionales para el sistema de prepedidos.
 *
 * Modelo de rollover (Uds → karrys → tablas):
 *   - El input principal es Uds. El valor escrito se SUMA al remanente actual.
 *   - El TOTAL (remanente + delta) se reparte: karrys primero (si undsCarro > 0),
 *     lo que sobra a tablas (si undsTabla > 0), el resto queda en Uds.
 *   - Al escribir N en karrys, las unidades pasan a N * undsCarro (exacto, sin rollover
 *     hacia tablas, porque karrys es un input secundario y no se completa a sí mismo).
 *   - Igual para tablas.
 *
 * Ejemplos (undsCarro=6, undsTabla=3, current={karrys:0, tablas:1, unidades:2}):
 *   - Uds=4  → total=6  → karrys=0+1=1, tablas=1+0=1, Uds=0
 *   - Uds=8  → total=10 → karrys=0+1=1, tablas=1+1=2, Uds=1
 *   - Uds=3  → total=5  → karrys=0+0=0, tablas=1+1=2, Uds=2  (no completa karry porque 5<6)
 *   - karrys=1 → Uds=6 (1×6=6 → Uds=0, karrys=1, tablas=2)
 *   - tablas=2 → Uds=6 (2×3=6 → Uds=0, tablas=2, karrys=1)
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
 * SIN rollover — solo derivados directos. Útil para progress bars.
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
 * Dado karrys, recalcula unidades y tablas (sin rollover — input secundario)
 */
export function calcFromKarrys(karrys, { undsCarro, undsTabla }) {
  const unidades = Math.max(0, karrys) * (undsCarro > 0 ? undsCarro : 1);
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}

/**
 * Dado tablas, recalcula unidades y karrys (sin rollover — input secundario)
 */
export function calcFromTablas(tablas, { undsCarro, undsTabla }) {
  const unidades = Math.max(0, tablas) * (undsTabla > 0 ? undsTabla : 1);
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}

/**
 * Aplica el valor escrito en Uds con rollover cascade Uds → karrys → tablas.
 *
 * El valor escrito en Uds se SUMA al remanente actual (current.unidades) y el
 * TOTAL se reparte: karrys primero, después tablas, el resto queda como
 * remanente. Los karrys/tablas que se "completan" se SUMAN a current.karrys /
 * current.tablas (no se sobrescriben).
 *
 * Ejemplo (UCC=6, UTA=3, current={karrys:0, tablas:1, unidades:2}):
 *   - Uds=4 → total=6 → karrys=0+1=1, tablas=1+0=1, unidades=0
 *   - Uds=8 → total=10 → karrys=0+1=1, tablas=1+1=2, unidades=1
 *
 * @param {number} delta - El valor escrito en el input Uds (se suma al remanente)
 * @param {object} current - Estado actual: { karrys, tablas, unidades }
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyUnidades(delta, current, { undsCarro, undsTabla }) {
  const currentUds = current?.unidades || 0;
  const currentKarrys = current?.karrys || 0;
  const currentTablas = current?.tablas || 0;

  // Sumar el delta al remanente actual
  let u = currentUds + Math.max(0, Math.floor(Number(delta) || 0));

  // Cascade: Uds → karrys
  let extraKarrys = 0;
  if (undsCarro > 0) {
    extraKarrys = Math.floor(u / undsCarro);
    u = u % undsCarro;
  }

  // Cascade: residuo → tablas
  let extraTablas = 0;
  if (undsTabla > 0) {
    extraTablas = Math.floor(u / undsTabla);
    u = u % undsTabla;
  }

  return {
    unidades: u,
    karrys: currentKarrys + extraKarrys,
    karryProgress: calcKarryProgress(u, undsCarro),
    tablas: currentTablas + extraTablas,
    tablaProgress: calcTablaProgress(u, undsTabla),
  };
}

/**
 * Aplica el valor escrito en karrys (input secundario, sin cascade).
 * El valor escrito REEMPLAZA el total de karrys. Las unidades se calculan
 * como karrys * undsCarro (exacto), y las tablas se derivan de esas unidades.
 *
 * @param {number} newKarrys - El valor escrito en el input karrys
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyKarrys(newKarrys, { undsCarro, undsTabla }) {
  const k = Math.max(0, Math.floor(Number(newKarrys) || 0));
  const UCC = undsCarro > 0 ? undsCarro : 1;
  const unidades = k * UCC;
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}

/**
 * Aplica el valor escrito en tablas (input secundario, sin cascade).
 * El valor escrito REEMPLAZA el total de tablas. Las unidades se calculan
 * como tablas * undsTabla (exacto), y los karrys se derivan de esas unidades.
 *
 * @param {number} newTablas - El valor escrito en el input tablas
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyTablas(newTablas, { undsCarro, undsTabla }) {
  const t = Math.max(0, Math.floor(Number(newTablas) || 0));
  const UTA = undsTabla > 0 ? undsTabla : 1;
  const unidades = t * UTA;
  return calcFromUnidades(unidades, { undsCarro, undsTabla });
}
