// ============================================================
//  RUTHINA — GENERADOR DE PRESUPUESTO PDF
// ============================================================

const BudgetPDF = {

  collect() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const gn = id => parseFloat(document.getElementById(id)?.value) || 0;
    const gc = id => document.getElementById(id)?.checked || false;

    return {
      // Cliente
      cliente: g('b-client'),
      telefono: g('b-phone'),
      dni: g('b-dni'),
      vendedor: g('b-vendedor'),

      // Vehículo
      modelo: g('b-model'),
      anio: g('b-year'),
      color: g('b-color'),
      km: g('b-km'),
      patente: g('b-patente'),
      notas: g('b-notes'),
      precioLista: gn('b-price'),
      precioContado: gn('b-cash'),

      // Permuta
      tienePermuta: gc('toggle-permuta'),
      permuModelo: g('b-perm-model'),
      permuAnio: g('b-perm-year'),
      permuKm: g('b-perm-km'),
      permuValor: gn('b-perm-value'),

      // Crédito
      tieneCredito: gc('toggle-credito'),
      banco: g('b-banco'),
      cuotas: parseInt(g('b-cuotas')) || 12,
      tna: gn('b-tna'),
      monto: gn('b-financia'),
      anticipo: gn('b-anticipo'),

      // Meta
      vigencia: g('b-vigencia'),
      fecha: new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })
    };
  },

  calcular(d) {
    const base = d.precioContado || d.precioLista;
    const diferencia = base - (d.tienePermuta ? d.permuValor : 0);

    let cuotaEstimada = 0;
    if (d.tieneCredito && d.monto && d.tna) {
      const tm = Math.pow(1 + d.tna / 100, 1/12) - 1;
      cuotaEstimada = d.monto * tm / (1 - Math.pow(1 + tm, -d.cuotas));
    }

    return { base, diferencia, cuotaEstimada };
  },

  fmt(n) {
    if (!n) return '—';
    return '$ ' + Math.round(n).toLocaleString('es-AR');
  },

  generate() {
    const d = this.collect();
    const calc = this.calcular(d);
    const E = RUTHINA_CONFIG.EMPRESA;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297, M = 18;

    // ── HEADER ──────────────────────────────────────────────
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, W, 48, 'F');

    doc.setFillColor(200, 16, 46);
    doc.rect(0, 44, W, 4, 'F');

    // Logo area
    doc.setFillColor(200, 16, 46);
    doc.roundedRect(M, 10, 28, 28, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('T', M + 14, 28, { align: 'center' });

    // Nombre empresa
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(E.nombre.toUpperCase(), M + 34, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 170, 170);
    doc.text(E.slogan, M + 34, 30);
    doc.text(`${E.ciudad}  ·  ${E.telefono}  ·  ${E.web}`, M + 34, 38);

    // Número de presupuesto y fecha (arriba derecha)
    const presNum = `PRES-${Date.now().toString().slice(-6)}`;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`N° ${presNum}`, W - M, 18, { align: 'right' });
    doc.text(d.fecha, W - M, 25, { align: 'right' });
    doc.text(`Vigencia: ${d.vigencia}`, W - M, 32, { align: 'right' });

    // ── TÍTULO PRESUPUESTO ───────────────────────────────────
    let y = 58;
    doc.setFillColor(248, 246, 242);
    doc.rect(0, y - 6, W, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('PRESUPUESTO DE VENTA', M, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    if (d.vendedor) doc.text(`Asesor: ${d.vendedor}`, W - M, y + 2, { align: 'right' });

    // ── DATOS CLIENTE ────────────────────────────────────────
    y += 18;
    this._secTitle(doc, 'DATOS DEL CLIENTE', M, y, [200, 16, 46]);
    y += 8;

    doc.setFillColor(252, 252, 250);
    doc.setDrawColor(230, 228, 224);
    doc.roundedRect(M, y, W - M * 2, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(d.cliente || 'Cliente', M + 5, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const clientInfo = [d.telefono, d.dni ? `DNI: ${d.dni}` : ''].filter(Boolean).join('   ·   ');
    if (clientInfo) doc.text(clientInfo, M + 5, y + 17);

    // ── VEHÍCULO ─────────────────────────────────────────────
    y += 32;
    this._secTitle(doc, 'VEHÍCULO', M, y, [200, 16, 46]);
    y += 8;

    doc.setFillColor(252, 252, 250);
    doc.setDrawColor(230, 228, 224);
    doc.roundedRect(M, y, W - M * 2, d.notas ? 34 : 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(200, 16, 46);
    doc.text(`${d.modelo || 'Vehículo'}${d.anio ? ' ' + d.anio : ''}`, M + 5, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const vehInfo = [
      d.color ? `Color: ${d.color}` : '',
      d.km ? `KM: ${Number(d.km).toLocaleString('es-AR')}` : '',
      d.patente ? `Patente: ${d.patente}` : ''
    ].filter(Boolean).join('   ·   ');
    if (vehInfo) doc.text(vehInfo, M + 5, y + 18);
    if (d.notas) {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(d.notas, M + 5, y + 27, { maxWidth: W - M * 2 - 10 });
    }

    // ── PRECIOS ──────────────────────────────────────────────
    y += d.notas ? 44 : 36;
    this._secTitle(doc, 'DETALLE DE PRECIOS', M, y, [200, 16, 46]);
    y += 10;

    const rows = [];
    if (d.precioLista) rows.push({ label: 'Precio de lista', val: this.fmt(d.precioLista), color: null });
    if (d.precioContado && d.precioContado !== d.precioLista)
      rows.push({ label: 'Precio al contado', val: this.fmt(d.precioContado), color: [30, 122, 74], bold: true });

    if (d.tienePermuta && d.permuValor) {
      const permDesc = `${d.permuModelo || 'Vehículo permuta'}${d.permuAnio ? ' ' + d.permuAnio : ''}${d.permuKm ? ' · ' + Number(d.permuKm).toLocaleString('es-AR') + ' km' : ''}`;
      rows.push({ label: 'Permuta: ' + permDesc, val: '- ' + this.fmt(d.permuValor), color: [180, 100, 0] });
    }

    const diff = calc.diferencia;
    rows.push({ label: 'DIFERENCIA A PAGAR', val: this.fmt(diff), color: [200, 16, 46], bold: true, big: true });

    rows.forEach(row => {
      const isBig = row.big;
      if (isBig) {
        doc.setFillColor(20, 20, 20);
        doc.rect(M, y - 5, W - M * 2, 12, 'F');
      }
      doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
      doc.setFontSize(isBig ? 12 : 11);
      if (isBig) {
        doc.setTextColor(255, 255, 255);
        doc.text(row.label, M + 5, y + 3);
        doc.setTextColor(200, 16, 46);
        doc.text(row.val, W - M - 5, y + 3, { align: 'right' });
      } else {
        doc.setTextColor(row.color ? row.color[0] : 60, row.color ? row.color[1] : 60, row.color ? row.color[2] : 60);
        doc.text(row.label, M + 3, y);
        doc.text(row.val, W - M - 3, y, { align: 'right' });
        doc.setDrawColor(230, 228, 224);
        doc.line(M, y + 2, W - M, y + 2);
      }
      y += isBig ? 14 : 9;
    });

    // ── CRÉDITO ──────────────────────────────────────────────
    if (d.tieneCredito && d.monto && calc.cuotaEstimada) {
      y += 6;
      this._secTitle(doc, 'OPCIÓN DE FINANCIACIÓN', M, y, [26, 79, 171]);
      y += 10;

      doc.setFillColor(232, 238, 250);
      doc.setDrawColor(180, 200, 240);
      doc.roundedRect(M, y, W - M * 2, 32, 2, 2, 'FD');

      const creditRows = [
        ['Entidad', d.banco || 'A confirmar'],
        ['Monto a financiar', this.fmt(d.monto)],
        ...(d.anticipo ? [['Anticipo', this.fmt(d.anticipo)]] : []),
        ['TNA', d.tna + '%'],
        ['Plazo', d.cuotas + ' cuotas'],
      ];

      let cx = M + 5, cy = y + 8;
      creditRows.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 80, 140);
        doc.text(label + ':', cx, cy);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 80);
        doc.text(val, cx + 55, cy);
        cy += 7;
      });

      // Cuota destacada
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(26, 79, 171);
      doc.text(`Cuota estimada: ${this.fmt(Math.round(calc.cuotaEstimada))} x ${d.cuotas}`, W - M - 5, y + 20, { align: 'right' });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 160);
      doc.text('* Cuota estimada. Sujeta a aprobación de la entidad financiera.', M + 5, y + 29);

      y += 42;
    }

    // ── VIGENCIA + FIRMA ─────────────────────────────────────
    y = Math.max(y, 220);

    doc.setFillColor(248, 246, 242);
    doc.rect(M, y, W - M * 2, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Este presupuesto tiene una vigencia de ${d.vigencia} a partir de la fecha de emisión.`, M + 4, y + 8);

    y += 20;
    doc.setDrawColor(180, 180, 180);
    doc.line(M, y, M + 55, y);
    doc.line(W - M - 55, y, W - M, y);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Firma del cliente', M + 4, y + 5);
    doc.text('Asesor de ventas', W - M - 4, y + 5, { align: 'right' });

    // ── FOOTER ───────────────────────────────────────────────
    doc.setFillColor(20, 20, 20);
    doc.rect(0, H - 18, W, 18, 'F');
    doc.setFillColor(200, 16, 46);
    doc.rect(0, H - 18, W, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${E.nombre}  ·  ${E.ciudad}  ·  ${E.telefono}  ·  ${E.web}`, W / 2, H - 8, { align: 'center' });

    // Guardar
    const filename = `Presupuesto_${(d.cliente || 'Cliente').replace(/\s+/g, '_')}_${d.modelo?.split(' ')[0] || 'Auto'}_Tutu.pdf`;
    doc.save(filename);
    return filename;
  },

  _secTitle(doc, text, x, y, rgb) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...rgb);
    doc.text(text, x, y);
    doc.setDrawColor(...rgb);
    doc.line(x, y + 1.5, x + doc.getTextWidth(text), y + 1.5);
  },

  // Actualiza el preview en tiempo real
  updatePreview() {
    const d = this.collect();
    const calc = this.calcular(d);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const show = (id, v) => { const el = document.getElementById(id); if (el) el.style.display = v ? 'flex' : 'none'; };

    set('pv-model', d.modelo || '—');
    set('pv-price', d.precioLista ? this.fmt(d.precioLista) : '—');
    set('pv-cash', d.precioContado ? this.fmt(d.precioContado) : '—');

    show('pv-permuta-row', d.tienePermuta && d.permuValor > 0);
    if (d.tienePermuta) set('pv-perm', `- ${this.fmt(d.permuValor)} (${d.permuModelo || '—'})`);

    show('pv-credito-row', d.tieneCredito && calc.cuotaEstimada > 0);
    if (d.tieneCredito && calc.cuotaEstimada) set('pv-cuota', `${this.fmt(Math.round(calc.cuotaEstimada))} x ${d.cuotas}`);

    set('pv-total', calc.diferencia > 0 ? this.fmt(calc.diferencia) : '—');
  }
};
