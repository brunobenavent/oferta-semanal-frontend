/**
 * Cálculos bidireccionales para el sistema de prepedidos.
 *
 * Modelo de rollover (Uds → karrys → tablas):
 *   - El input principal es Uds.
 *   - Al escribir N en Uds, se intenta llenar karrys primero (si undsCarro > 0),
 *     lo que sobra se reparte a tablas (si undsTabla > 0), y el remanente queda en Uds.
 *   - Al escribir N en karrys, las unidades pasan a N * undsCarro (exacto, sin rollover
 *     hacia tablas, porque karrys es un input secundario y no se completa a sí mismo).
 *   - Igual para tablas.
 *
 * Ejemplos (undsCarro=50, undsTabla=8):
 *   - Uds=58  → karrys=1, tablas=1, Uds=0   (1×50 + 1×8 + 0 = 58)
 *   - Uds=20  → karrys=0, tablas=2, Uds=4   (0×50 + 2×8 + 4 = 20)
 *   - Uds=1   → karrys=0, tablas=0, Uds=1   (no completa nada)
 *   - karrys=1 → Uds=0 (50 unidades exactas)
 *   - tablas=2 → Uds=0 (16 unidades exactas)
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
 * El valor escrito en Uds REEMPLAZA el `current.unidades`, pero los karrys
 * y tablas que se "completan" se SUMAN a los valores actuales (current.karrys,
 * current.tablas). Esto preserva el caso de que el usuario ya tenía 2 karrys
 * y agrega 8 unidades → karrys=3, no karrys=1.
 *
 * @param {number} newUnidades - El valor escrito en el input Uds
 * @param {object} current - Estado actual: { karrys, tablas }
 * @param {object} cfg - { undsCarro, undsTabla }
 * @returns {object} - { unidades, karrys, tablas, karryProgress, tablaProgress }
 */
export function applyUnidades(newUnidades, current, { undsCarro, undsTabla }) {
  let u = Math.max(0, Math.floor(Number(newUnidades) || 0));
  const currentKarrys = current?.karrys || 0;
  const currentTablas = current?.tablas || 0;

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
