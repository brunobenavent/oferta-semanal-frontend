import ExcelJS from 'exceljs';

async function getLogoBase64() {
  const resp = await fetch('/logo-guzman.svg');
  const svgText = await resp.text();
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 56;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 150, 56);
      resolve(canvas.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
  });
}

function fetchAsBase64(url) {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );
}

function makeFilename(semana) {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `oferta-s${semana}-${y}${M}${d}-${h}${m}.xlsx`;
}

// 26 columns (A–Z) matching the SAGE export structure
const COLUMNS = [
  { header: 'Foto', key: 'imagen', width: 8 },
  { header: 'IMAGEN', key: 'imagenUrl', width: 10 },
  { header: 'FICHA', key: 'ficha', width: 8 },
  { header: 'ARTICULO', key: 'descripcionArticulo', width: 35 },
  { header: 'MACETA', key: 'maceta', width: 16 },
  { header: 'PRESENTACION', key: 'presentacion', width: 16 },
  { header: 'ALTURA', key: 'altura', width: 10 },
  { header: 'CALIBRE', key: 'calibre', width: 10 },
  { header: 'Modelo', key: 'modelo', width: 10 },
  { header: 'EAN', key: 'ean', width: 16 },
  { header: 'Observaciones', key: 'observaciones', width: 14 },
  { header: 'STOCK', key: 'stock', width: 10 },
  { header: 'PRECIO1', key: 'precio1', width: 10 },
  { header: 'PRECIO2', key: 'precio2', width: 10 },
  { header: 'PRECIO3', key: 'precio3', width: 10 },
  { header: 'UCC', key: 'undsCarro', width: 7, align: 'center' },
  { header: 'UTA', key: 'undsTabla', width: 7, align: 'center' },
  { header: 'UCA', key: 'undsCaja', width: 7, align: 'center' },
  { header: 'PEDIDO', key: 'pedido', width: 10 },
  { header: 'CodigoArticulo', key: 'codigoArticulo', width: 10 },
  { header: 'REFERENCIA', key: 'referencia', width: 12 },
  { header: 'REFERENCIA EDI', key: 'refEdi', width: 14 },
  { header: 'PEDIDO MINIMO', key: 'pedidoMinimo', width: 14 },
  { header: 'CONDICIONANTE', key: 'condicionante', width: 14 },
  { header: 'UBICACIÓN', key: 'ubicacion', width: 14 },
  { header: 'ETIQ LEROY', key: 'etiqLeroy', width: 12 },
];

// English header text for specific columns (1-based index → header text)
// These go on row 3 with italic gray styling
const EN_HEADER = {
  1: 'Photo',
  4: 'Product',
  5: 'Pot',
  6: 'Presentation',
  7: 'Height',
  8: 'Caliber',
  9: 'Model',
  10: 'EAN',
  11: 'Available',
  12: 'Stock',
  13: 'Price',
  17: 'Order',
};

export async function exportOffersToExcel({ offers, user, semana, priceMode }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Ofertas');

  // ── Role-based column config ──────────────────────────────
  const roles = user?.roles || [user?.role].filter(Boolean) || [];
  const isClient = roles.includes('client');
  const isStaff = !isClient && roles.length > 0;
  const priceTier = user?.priceTier || 2;

  const columns = COLUMNS.map(c => ({ ...c }));
  const p1 = columns.find(c => c.key === 'precio1');
  const p2 = columns.find(c => c.key === 'precio2');
  const p3 = columns.find(c => c.key === 'precio3');

  if (isStaff) {
    // Staff: explicit priceMode (default: full = all 3 prices)
    switch (priceMode || 'full') {
      case 'pvp':
        p1.header = 'PVP';
        p2.hidden = true;
        p3.hidden = true;
        break;
      case 'pvp+pt2':
        p1.header = 'PVP';
        p2.header = 'Precio';
        p3.hidden = true;
        break;
      case 'pvp+pt3':
        p1.header = 'PVP';
        p3.header = 'Precio';
        p2.hidden = true;
        break;
      // case 'full': keep defaults (PRECIO1, PRECIO2, PRECIO3)
    }
  } else {
    // Non-staff: role-based rules (priceMode ignored)
    p1.header = 'PVP';
    if (roles.length === 0) {
      // Anonymous: only PVP
      p2.hidden = true;
      p3.hidden = true;
    } else if (isClient) {
      // Client: PVP + active tier
      if (priceTier === 2) {
        p2.header = 'Precio';
        p3.hidden = true;
      } else {
        p3.header = 'Precio';
        p2.hidden = true;
      }
    }
  }

  ws.columns = columns;
  // Freeze title + spacer + both header rows (1–4)
  ws.views = [{ state: 'frozen', ySplit: 4, zoom: 125 }];

  const lastCol = columns.length; // 26

  // ── Logo ──────────────────────────────────────────────────
  let logoId = null;
  try {
    const logoBase64 = await getLogoBase64();
    logoId = wb.addImage({ base64: logoBase64, extension: 'png' });
  } catch {}

  if (logoId !== null) {
    ws.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 180, height: 67 },
      editAs: 'oneCell',
    });
  }

  // ── Row 1 – Title ─────────────────────────────────────────
  ws.mergeCells(1, 2, 1, lastCol);
  ws.getCell(1, 1).value = ''; // Limpiar auto-header de la columna A
  ws.getCell(1, 2).value = `OFERTA SEMANAL - Semana ${semana}`;
  ws.getCell(1, 2).font = { bold: true, size: 36, name: 'Calibri' };
  ws.getCell(1, 2).alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 67;

  // ── Row 2 – Spacer ────────────────────────────────────────
  ws.getRow(2).height = 8;

  // ── Row 3 – English header (italic, gray) ─────────────────
  const enRow = ws.getRow(3);
  enRow.height = 20;
  for (let c = 1; c <= lastCol; c++) {
    const cell = enRow.getCell(c);
    if (EN_HEADER[c]) {
      cell.value = EN_HEADER[c];
    }
    cell.font = { italic: true, size: 10, name: 'Calibri', color: { argb: 'FF808080' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // ── Row 4 – Spanish header (bold, white on green) ─────────
  const esRow = ws.getRow(4);
  esRow.height = 28;
  esRow.font = { bold: true, size: 11, name: 'Calibri', color: { argb: 'FFFFFFFF' } };

  columns.forEach((col, i) => {
    const cell = esRow.getCell(i + 1);
    cell.value = col.header;
    cell.alignment = { vertical: 'middle', horizontal: col.align || 'left' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7AAA8D' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // ── Fetch thumbnails in batches ───────────────────────────
  const thumbResults = [];
  for (let i = 0; i < offers.length; i += 10) {
    const batch = offers.slice(i, i + 10);
    const settled = await Promise.allSettled(
      batch.map(async (offer, batchIdx) => {
        if (!offer.imagenUrl) return null;
        const thumbUrl = offer.imagenUrl.replace(
          '/upload/',
          '/upload/c_fill,w_80,h_106,q_auto,f_auto/',
        );
        const base64 = await fetchAsBase64(thumbUrl);
        const imageId = wb.addImage({ base64, extension: 'jpg' });
        return { idx: i + batchIdx, imageId };
      }),
    );
    settled.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) thumbResults.push(r.value);
    });
  }

  // ── Data rows (starting at row 5) ─────────────────────────
  offers.forEach((offer, idx) => {
    const rowNum = 5 + idx;
    const row = ws.getRow(rowNum);
    row.height = 57;

    // Column A: thumbnail image
    const thumb = thumbResults.find((r) => r.idx === idx);
    if (thumb) {
      ws.addImage(thumb.imageId, {
        tl: { col: 0, row: rowNum - 1 },
        ext: { width: 65, height: 75 },
        editAs: 'oneCell',
      });
    }

    const isAlt = idx % 2 === 1;

    columns.forEach((col, ci) => {
      const cell = row.getCell(ci + 1);

      if (col.key === 'imagen') {
        cell.value = '';
      } else if (col.key === 'imagenUrl') {
        // Column B: HYPERLINK to full-size image
        cell.value = offer.imagenUrl
          ? { formula: `HYPERLINK("${offer.imagenUrl}", "IMAGEN")` }
          : 'IMAGEN';
        cell.font = offer.imagenUrl
          ? { color: { argb: 'FF0563C1' }, underline: true }
          : { color: { argb: 'FF808080' } };
      } else if (col.key === 'ficha') {
        // Column C: static label (no datasheet available yet)
        cell.value = 'FICHA';
        cell.font = { color: { argb: 'FF808080' } };
      } else if (col.key === 'precio1' || col.key === 'precio2' || col.key === 'precio3') {
        cell.value = col.hidden ? '' : (offer[col.key] || 0);
        if (!col.hidden) cell.numFmt = '€ #,##0.00';
      } else {
        cell.value = offer[col.key] || '';
      }

      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: col.align || 'left', wrapText: true };

      if (isAlt) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEEF6F1' },
        };
      }
    });
  });

  // ── Write buffer & download ───────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFilename(semana);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
