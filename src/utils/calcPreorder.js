/**
 * Cálculos bidireccionales para el sistema de prepedidos.
 *
 * Modelo de rollover con carry-over entre contenedores:
 *   - El input principal es Uds. El valor escrito se SUMA al remanente actual.
 *   - El TOTAL (remanente + delta) llena TABLAS primero (si undsTabla > 0).
 *   - El residuo de uds (después de llenar tablas) queda en Uds.
 *   - Si las tablas acumuladas equivalen a un karry entero (UCC es múltiplo
 *     de UTA), se CONSOLIDAN: tablas -= tablasPorKarry, karrys += 1.
 *   - Al escribir N en karrys, las unidades pasan a N * undsCarro (reemplazo).
 *   - Al escribir N en tablas, las unidades pasan a N * undsTabla, después
 *     se consolida a karrys si es posible.
 *
 * Ejemplos (undsCarro=6, undsTabla=3, tablasPorKarry=2):
 *   - Estado inicial: {karrys:0, tablas:0, unidades:0}
 *   - Uds=3  → tablas=1, karrys=0, Uds=0  (3 = 1 tabla, 0%3=0)
 *   - Uds=3  → tablas=2→consolida: karrys=1, tablas=0, Uds=0
 *   - Uds=3  → tablas=1, karrys=1, Uds=0
 *   - Uds=7  → tablas=2→consolida: karrys=2, tablas=0, Uds=1
 *   - Uds=4 sobre {karrys:1, tablas:1, Uds:0} → total=4 → tablas=2→consolida:
 *     karrys=2, tablas=0, Uds=1
 *   - karrys=2 → Uds=12 (2×6), karrys=2, tablas=4→consolida: tablas=0, Uds=0
 *   - tablas=3 → Uds=9, tablas=3→consolida: karrys=1, tablas=1
 *
 * Si UCC NO es múltiplo de UTA (ej. UCC=50, UTA=8), no se consolida:
 *   - Uds=50 → tablas=6, karrys=0, Uds=2
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
 * Aplica el valor escrito en Uds con cascade y carry-over tablas→karrys.
 *
 * El valor escrito en Uds se SUMA al remanente actual. El TOTAL llena tablas
 * (si undsTabla > 0). Si las tablas acumuladas equivalen a un karry entero
 * (UCC múltiplo de UTA), se consolidan automáticamente.
 *
 * @param {number} delta - El valor escrito en el input Uds (se suma al remanente)
 * @param {object} current - Estado actual: { karrys, tablas, unidades }
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyUnidades(delta, current, { undsCarro, undsTabla }) {
  const MAX = 9999;
  const currentUds = current?.unidades || 0;
  const currentKarrys = current?.karrys || 0;
  const currentTablas = current?.tablas || 0;

  // Sumar el delta al remanente actual (permite negativo para restar)
  const rawDelta = Math.floor(Number(delta) || 0);
  let u = Math.max(0, Math.min(MAX, currentUds + rawDelta));
  let newTablas = currentTablas;
  let newKarrys = currentKarrys;

  if (undsTabla > 0) {
    // Cascade: Uds → tablas
    newTablas += Math.floor(u / undsTabla);
    u = u % undsTabla;

    // Carry-over: tablas → karrys (solo si UCC es múltiplo de UTA)
    if (undsCarro > 0 && undsCarro % undsTabla === 0) {
      const tablasPorKarry = undsCarro / undsTabla;
      newKarrys += Math.floor(newTablas / tablasPorKarry);
      newTablas = newTablas % tablasPorKarry;
    }
  } else if (undsCarro > 0) {
    // Sin tablas, cascade directo: Uds → karrys
    newKarrys += Math.floor(u / undsCarro);
    u = u % undsCarro;
  }

  return {
    unidades: u,
    karrys: newKarrys,
    karryProgress: calcKarryProgress(u, undsCarro),
    tablas: newTablas,
    tablaProgress: calcTablaProgress(u, undsTabla),
  };
}

/**
 * Aplica el valor escrito en karrys (input secundario, solo modifica karrys).
 * NO toca tablas ni unidades. Cada campo es independiente.
 * El total se calcula como karrys*UCC + tablas*UTA + unidades en el summary.
 *
 * @param {number} newKarrys - El valor escrito en el input karrys
 * @param {object} existing - Estado actual
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyKarrys(newKarrys, existing, { undsCarro, undsTabla }) {
  const k = Math.max(0, Math.floor(Number(newKarrys) || 0));
  return {
    unidades: existing?.unidades || 0,
    karrys: k,
    karryProgress: calcKarryProgress(existing?.unidades || 0, undsCarro),
    tablas: existing?.tablas || 0,
    tablaProgress: calcTablaProgress(existing?.unidades || 0, undsTabla),
  };
}

/**
 * Aplica el valor escrito en tablas (input secundario, solo modifica tablas).
 * NO toca karrys ni unidades. Cada campo es independiente.
 *
 * @param {number} newTablas - El valor escrito en el input tablas
 * @param {object} existing - Estado actual
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyTablas(newTablas, existing, { undsCarro, undsTabla }) {
  const t = Math.max(0, Math.floor(Number(newTablas) || 0));
  const currentKarrys = existing?.karrys || 0;
  const currentUds = existing?.unidades || 0;

  let karrys = currentKarrys;
  let tablas = t;

  // Carry-over: tablas → karrys (solo si UCC es múltiplo de UTA)
  // Convertir karrys existentes a "tablas equivalentes" para el cálculo
  if (undsCarro > 0 && undsTabla > 0 && undsCarro % undsTabla === 0) {
    const tablasPorKarry = undsCarro / undsTabla;
    const existingEquivalentTablas = currentKarrys * tablasPorKarry;
    const totalEquivalentTablas = existingEquivalentTablas + t;
    karrys = Math.floor(totalEquivalentTablas / tablasPorKarry);
    tablas = totalEquivalentTablas % tablasPorKarry;
  }

  return {
    unidades: currentUds,
    karrys,
    karryProgress: calcKarryProgress(currentUds, undsCarro),
    tablas,
    tablaProgress: calcTablaProgress(currentUds, undsTabla),
  };
}
