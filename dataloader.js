// ============================================================
//  RUTHINA — CARGADOR DE DATOS (Sheets + Drive PDFs)
// ============================================================

const DataLoader = {
  cachedContext: null,
  lastLoad: null,
  CACHE_MINUTES: 10,

  // Lee todos los Sheets y PDFs configurados
  async loadAll() {
    const now = Date.now();
    if (this.cachedContext && this.lastLoad && (now - this.lastLoad) < this.CACHE_MINUTES * 60000) {
      return this.cachedContext;
    }

    UI.setLoadingStatus("Cargando datos de Drive...");
    let context = [];

    // Cargar Sheets
    for (const sheet of RUTHINA_CONFIG.SHEETS) {
      try {
        const data = await this.loadSheet(sheet);
        if (data) context.push(`=== ${sheet.label} (Google Sheet) ===\n${data}`);
      } catch (e) {
        console.warn(`No se pudo cargar Sheet: ${sheet.label}`, e);
        context.push(`=== ${sheet.label} === [No disponible: ${e.message}]`);
      }
    }

    // Cargar PDFs
    for (const pdf of RUTHINA_CONFIG.PDFS) {
      try {
        const data = await this.loadPDF(pdf);
        if (data) context.push(`=== ${pdf.label} (PDF) ===\n${data}`);
      } catch (e) {
        console.warn(`No se pudo cargar PDF: ${pdf.label}`, e);
        context.push(`=== ${pdf.label} === [No disponible: ${e.message}]`);
      }
    }

    this.cachedContext = context.join("\n\n");
    this.lastLoad = now;
    UI.setLoadingStatus(null);
    return this.cachedContext;
  },

  // Lee un Google Sheet como CSV (requiere que sea público)
  async loadSheet(sheet) {
    // Google Sheets export as CSV - funciona con sheets públicos
    const url = `https://docs.google.com/spreadsheets/d/${sheet.id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet.sheetName)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    // Convertir CSV a texto legible para la IA
    return this.csvToReadable(csv, sheet.label);
  },

  // Convierte CSV a texto estructurado para la IA
  csvToReadable(csv, label) {
    const lines = csv.trim().split('\n').map(l =>
      l.split(',').map(c => c.replace(/^"|"$/g, '').trim())
    ).filter(row => row.some(c => c));

    if (!lines.length) return "[Hoja vacía]";

    const headers = lines[0];
    const rows = lines.slice(1);

    let out = `Columnas: ${headers.join(' | ')}\n`;
    out += `Total registros: ${rows.length}\n\n`;

    rows.forEach((row, i) => {
      const obj = headers.map((h, j) => `${h}: ${row[j] || ''}`).join(' | ');
      out += `Registro ${i + 1}: ${obj}\n`;
    });

    return out;
  },

  // Lee un PDF de Google Drive (versión pública)
  async loadPDF(pdf) {
    // Para PDFs públicos en Drive, usamos el endpoint de exportación
    // Esto descarga el PDF y lo envía a Claude para extracción de texto
    // En GitHub Pages (sin backend) lo enviamos directamente a Claude como documento
    const url = `https://drive.google.com/uc?export=download&id=${pdf.id}`;

    // Intentar fetch del PDF
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const base64 = await this.blobToBase64(blob);

    // Guardamos el PDF en base64 para enviarlo a Claude
    return { type: 'pdf_base64', base64, label: pdf.label };
  },

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // Forzar recarga (botón "Actualizar")
  async forceReload() {
    this.cachedContext = null;
    this.lastLoad = null;
    return await this.loadAll();
  }
};
