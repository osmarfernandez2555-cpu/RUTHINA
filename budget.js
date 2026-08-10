const BudgetPDF = {

  collect() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const gn = id => parseFloat(document.getElementById(id)?.value) || 0;
    const gc = id => document.getElementById(id)?.checked || false;

    return {
      // Cliente
      cliente: g('bc'),
      telefono: g('bf'),
      dni: g('bd'),
      vendedor: g('bv'),

      // Vehículo
      modelo: g('bm'),
      anio: g('by'),
      color: g('bco'),
      km: g('bk'),
      patente: g('bpa'),
      notas: g('bno'),
      precioLista: gn('bpl'),
      precioContado: gn('bpc'),

      // Tipo de cambio
      usd: gn('usd-hoy') || 1400,

      // Permuta
      tienePermuta: gc('cp'),
      permuModelo: g('bpm'),
      permuAnio: g('bpy'),
      permuKm: g('bpk'),
      permuValor: gn('bpv'),
      permuPos: gn('bppos') || 0,
      permuPer: gn('bpper') || 0,

      // Crédito prendario
      tieneCredito: gc('cc'),
      banco: g('bba'),
      cuotas: parseInt(gv('bcu')) || 12,
      tna: gn('btn'),
      monto: gn('bfi'),
      anticipo: gn('ban'),
      gastos: gn('bna-gasto-porc') || 4.2,
      cuotaManual: gn('cuota-manual') || 0,

      // BNA / Crédito personal 1
      tieneBNA: gc('cbna'),
      bnaBanco: g('bna-banco') || (document.getElementById('bna-banco-sel')?.options[document.getElementById('bna-banco-sel')?.selectedIndex]?.text?.split(' (')[0] || ''),
      bnaMonto: gn('bna-monto'),
      bnaTNA: gn('bna-tna') || 38,
      bnaCuotas: parseInt(g('bna-cuotas')) || 12,
      bnaGastoFijo: gn('bna-gasto-fijo') || 0,
      bnaGastoPorc: gn('bna-gasto-porc') || 0,
      bnaCuotaManual: gn('bna-cuota-manual') || 0,

      // Crédito personal 2
      tieneBNA2: gc('cbna2'),
      bna2Banco: g('bna2-banco') || (document.getElementById('bna2-banco-sel')?.options[document.getElementById('bna2-banco-sel')?.selectedIndex]?.text?.split(' (')[0] || ''),
      bna2Monto: gn('bna2-monto'),
      bna2TNA: gn('bna2-tna') || 38,
      bna2Cuotas: parseInt(g('bna2-cuotas')) || 12,
      bna2GastoFijo: gn('bna2-gasto-fijo') || 0,
      bna2GastoPorc: gn('bna2-gasto-porc') || 0,
      bna2CuotaManual: gn('bna2-cuota-manual') || 0,

      // PSA
      tienePSA: gc('cpsa'),
      psaTipo: (document.getElementById('psa-btn-0km')?.style?.background?.includes('C8102E') ? '0km' : 'pat'),
      psaMonto0: gn('psa-monto-0'),
      psaCuotas0: parseInt(gv('psa-cuotas-0')) || 24,
      psaGasto0: gn('psa-gasto-0') || 14.54,
      psaCuotaManual0: gn('psa0-cuota-manual') || 0,
      psaMontoP: gn('psa-monto-p'),
      psaCuotasP: parseInt(gv('psa-cuotas-p')) || 24,
      psaTNAP: gn('psa-tna-p') || 47.9,
      psaQ: gn('psa-q') || 10,
      psaIVA: gn('psa-iva') || 4,
      psaGest: gn('psa-gest') || 5,
      psaCuotaManualP: gn('psap-cuota-manual') || 0,

      // Adelanto
      adelanto: gn('adelanto'),

      // Meta
      vigencia: g('bvi') || '72 horas',
      fecha: new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' })
    };
  },

  calcular(d) {
    const base = d.precioContado || d.precioLista;
    const porcTransf = base > 20000000 ? 0.05 : 0.06;
    const transferencia = Math.round(base * porcTransf);
    const valorTotal = base + transferencia;

    // Permuta neta
    const permNeta = d.tienePermuta ? Math.max(0, d.permuValor - (d.permuPos||0) - (d.permuPer||0)) : 0;

    // Crédito prendario
    let cuotaPrendario = 0, aporteCredito = 0;
    if (d.tieneCredito && d.monto) {
      const gastos = Math.round(d.monto * (d.gastos/100));
      aporteCredito = Math.max(0, d.monto - gastos);
      if (d.cuotaManual > 0) {
        cuotaPrendario = d.cuotaManual;
      } else if (d.tna > 0) {
        const tm = Math.pow(1 + d.tna/100, 1/12) - 1;
        cuotaPrendario = d.monto * tm / (1 - Math.pow(1+tm, -d.cuotas));
      }
    }

    // BNA personal 1
    let cuotaBNA = 0, aporteBNA = 0, bnaGastos = 0;
    if (d.tieneBNA && d.bnaMonto) {
      bnaGastos = Math.round(d.bnaMonto * d.bnaGastoPorc/100) + (d.bnaGastoFijo||0);
      aporteBNA = Math.max(0, d.bnaMonto - bnaGastos);
      if (d.bnaCuotaManual > 0) {
        cuotaBNA = d.bnaCuotaManual;
      } else if (d.bnaTNA > 0) {
        const tm = Math.pow(1 + d.bnaTNA/100, 1/12) - 1;
        cuotaBNA = d.bnaMonto * tm / (1 - Math.pow(1+tm, -d.bnaCuotas));
      } else {
        cuotaBNA = d.bnaMonto / d.bnaCuotas;
      }
    }

    // BNA personal 2
    let cuotaBNA2 = 0, aporteBNA2 = 0, bna2Gastos = 0;
    if (d.tieneBNA2 && d.bna2Monto) {
      bna2Gastos = Math.round(d.bna2Monto * d.bna2GastoPorc/100) + (d.bna2GastoFijo||0);
      aporteBNA2 = Math.max(0, d.bna2Monto - bna2Gastos);
      if (d.bna2CuotaManual > 0) {
        cuotaBNA2 = d.bna2CuotaManual;
      } else if (d.bna2TNA > 0) {
        const tm = Math.pow(1 + d.bna2TNA/100, 1/12) - 1;
        cuotaBNA2 = d.bna2Monto * tm / (1 - Math.pow(1+tm, -d.bna2Cuotas));
      } else {
        cuotaBNA2 = d.bna2Monto / d.bna2Cuotas;
      }
    }

    // PSA
    let cuotaPSA = 0, aportePSA = 0, psaGastos = 0, psaMonto = 0, psaCuotas = 0;
    if (d.tienePSA) {
      if (d.psaTipo === '0km') {
        psaMonto = d.psaMonto0; psaCuotas = d.psaCuotas0;
        psaGastos = Math.round(psaMonto * d.psaGasto0/100);
        aportePSA = Math.max(0, psaMonto - psaGastos);
        cuotaPSA = d.psaCuotaManual0 > 0 ? d.psaCuotaManual0 : (psaMonto / psaCuotas);
      } else {
        psaMonto = d.psaMontoP; psaCuotas = d.psaCuotasP;
        psaGastos = Math.round(psaMonto * (d.psaQ + d.psaIVA + d.psaGest)/100);
        aportePSA = Math.max(0, psaMonto - psaGastos);
        if (d.psaCuotaManualP > 0) {
          cuotaPSA = d.psaCuotaManualP;
        } else if (d.psaTNAP > 0) {
          const tm = Math.pow(1 + d.psaTNAP/100, 1/12) - 1;
          cuotaPSA = psaMonto * tm / (1 - Math.pow(1+tm, -psaCuotas));
        }
      }
    }

    const totalAportes = permNeta + aporteCredito + aporteBNA + aporteBNA2 + aportePSA + (d.anticipo||0) + (d.adelanto||0);
    const diferencia = valorTotal - totalAportes;

    return {
      base, porcTransf, transferencia, valorTotal,
      permNeta,
      aporteCredito, cuotaPrendario, gastosCredito: d.tieneCredito ? Math.round(d.monto * (d.gastos/100)) : 0,
      aporteBNA, cuotaBNA, bnaGastos,
      aporteBNA2, cuotaBNA2, bna2Gastos,
      aportePSA, cuotaPSA, psaGastos, psaMonto, psaCuotas,
      totalAportes, diferencia
    };
  },

  fmt(n) {
    if (!n && n !== 0) return '—';
    return '$ ' + Math.round(n).toLocaleString('es-AR');
  },

  // Agrega una fila al PDF, crea nueva página si es necesario
  _row(doc, label, val, opts, y, W, M) {
    const { bold, color, big, sub } = opts || {};
    if (y > 255) {
      doc.addPage();
      y = 20;
    }
    if (big) {
      doc.setFillColor(20, 20, 20);
      doc.rect(M, y - 5, W - M*2, 13, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(label, M + 4, y + 3);
      doc.setTextColor(200, 16, 46);
      doc.text(val, W - M - 4, y + 3, { align: 'right' });
      y += 15;
    } else if (sub) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(color ? color[0] : 120, color ? color[1] : 120, color ? color[2] : 120);
      doc.text(label, M + 8, y);
      doc.text(val, W - M - 3, y, { align: 'right' });
      doc.setDrawColor(235, 232, 228);
      doc.line(M, y + 2, W - M, y + 2);
      y += 8;
    } else {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(10);
      doc.setTextColor(color ? color[0] : 50, color ? color[1] : 50, color ? color[2] : 50);
      doc.text(label, M + 3, y);
      doc.text(val, W - M - 3, y, { align: 'right' });
      doc.setDrawColor(230, 228, 224);
      doc.line(M, y + 2, W - M, y + 2);
      y += 9;
    }
    return y;
  },

  _secTitle(doc, text, x, y, rgb) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...rgb);
    doc.text(text, x, y);
    doc.setDrawColor(...rgb);
    doc.line(x, y + 1.5, x + doc.getTextWidth(text), y + 1.5);
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

    doc.setFillColor(200, 16, 46);
    doc.roundedRect(M, 10, 28, 28, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('T', M + 14, 28, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(E.nombre.toUpperCase(), M + 34, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 170, 170);
    doc.text(E.slogan || '', M + 34, 30);
    doc.text(`${E.ciudad}  ·  ${E.web}`, M + 34, 38);

    const presNum = `PRES-${Date.now().toString().slice(-6)}`;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`N° ${presNum}`, W - M, 18, { align: 'right' });
    doc.text(d.fecha, W - M, 25, { align: 'right' });
    doc.text(`USD: $${Number(d.usd).toLocaleString('es-AR')} | Vigencia: ${d.vigencia}`, W - M, 32, { align: 'right' });

    // ── CLIENTE ──────────────────────────────────────────────
    let y = 58;
    doc.setFillColor(248, 246, 242);
    doc.rect(0, y - 6, W, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('PRESUPUESTO DE VENTA', M, y + 2);
    if (d.vendedor) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Asesor: ${d.vendedor}`, W - M, y + 2, { align: 'right' });
    }

    y += 16;
    this._secTitle(doc, 'CLIENTE', M, y, [200, 16, 46]);
    y += 7;
    doc.setFillColor(252, 252, 250);
    doc.setDrawColor(230, 228, 224);
    doc.roundedRect(M, y, W - M*2, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(d.cliente || 'Cliente', M + 5, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const cInfo = [d.telefono, d.dni ? `DNI: ${d.dni}` : ''].filter(Boolean).join('   ·   ');
    if (cInfo) doc.text(cInfo, M + 5, y + 16);

    // ── VEHÍCULO ─────────────────────────────────────────────
    y += 28;
    this._secTitle(doc, 'VEHICULO', M, y, [200, 16, 46]);
    y += 7;
    const vehH = d.notas ? 32 : 24;
    doc.setFillColor(252, 252, 250);
    doc.setDrawColor(230, 228, 224);
    doc.roundedRect(M, y, W - M*2, vehH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(200, 16, 46);
    doc.text(`${d.modelo || 'Vehículo'}${d.anio ? ' ' + d.anio : ''}`, M + 5, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const vInfo = [d.color && `Color: ${d.color}`, d.km && `KM: ${Number(d.km).toLocaleString('es-AR')}`, d.patente && `Pat: ${d.patente}`].filter(Boolean).join('   ·   ');
    if (vInfo) doc.text(vInfo, M + 5, y + 17);
    if (d.notas) { doc.setFontSize(8); doc.text(d.notas, M + 5, y + 26, { maxWidth: W - M*2 - 10 }); }

    // ── PRECIOS ──────────────────────────────────────────────
    y += vehH + 10;
    this._secTitle(doc, 'DETALLE DE PRECIOS', M, y, [200, 16, 46]);
    y += 10;

    const R = (label, val, opts) => { y = this._row(doc, label, val, opts, y, W, M); };

    if (d.precioLista) R('Precio de lista', this.fmt(d.precioLista));
    if (d.precioContado && d.precioContado !== d.precioLista)
      R('Precio al contado', this.fmt(d.precioContado), { color: [30,122,74], bold: true });

    // Permuta
    if (d.tienePermuta && d.permuValor) {
      const pdesc = `Permuta: ${d.permuModelo || ''}${d.permuAnio ? ' '+d.permuAnio : ''}${d.permuKm ? ' · '+Number(d.permuKm).toLocaleString('es-AR')+' km' : ''}`;
      R(pdesc, this.fmt(d.permuValor), { color: [180,100,0] });
      if (d.permuPos > 0) R('  (-) Posición de venta', '- '+this.fmt(d.permuPos), { sub: true, color: [200,60,60] });
      if (d.permuPer > 0) R('  (-) Peritaje', '- '+this.fmt(d.permuPer), { sub: true, color: [200,60,60] });
      if (d.permuPos > 0 || d.permuPer > 0) R('  Neto permuta', this.fmt(calc.permNeta), { sub: true, color: [30,122,74], bold: true });
    }

    // Transferencia
    R(`(+) Transferencia (${(calc.porcTransf*100).toFixed(0)}%)`, this.fmt(calc.transferencia), { color: [140,100,0] });

    // Crédito prendario
    if (d.tieneCredito && d.monto) {
      R(`Crédito banco ${d.banco ? '('+d.banco+')' : ''} — bruto`, this.fmt(d.monto), { color: [26,79,171] });
      if (calc.gastosCredito > 0) R(`  (-) Gastos ${d.gastos}%`, '- '+this.fmt(calc.gastosCredito), { sub: true, color: [200,60,60] });
      R('  Neto crédito banco', '- '+this.fmt(calc.aporteCredito), { sub: true, color: [26,79,171], bold: true });
      if (d.anticipo > 0) R('(-) Anticipo', '- '+this.fmt(d.anticipo), { color: [26,79,171] });
    }

    // BNA personal 1
    if (d.tieneBNA && d.bnaMonto) {
      const bLabel = d.bnaBanco || 'Crédito Personal';
      R(`${bLabel} — bruto`, this.fmt(d.bnaMonto), { color: [26,79,171] });
      if (calc.bnaGastos > 0) R(`  (-) Gastos`, '- '+this.fmt(calc.bnaGastos), { sub: true, color: [200,60,60] });
      R('  Neto a recibir', '- '+this.fmt(calc.aporteBNA), { sub: true, color: [26,79,171], bold: true });
    }

    // BNA personal 2
    if (d.tieneBNA2 && d.bna2Monto) {
      const b2Label = d.bna2Banco || 'Crédito Personal 2';
      R(`${b2Label} — bruto`, this.fmt(d.bna2Monto), { color: [26,79,171] });
      if (calc.bna2Gastos > 0) R(`  (-) Gastos`, '- '+this.fmt(calc.bna2Gastos), { sub: true, color: [200,60,60] });
      R('  Neto a recibir', '- '+this.fmt(calc.aporteBNA2), { sub: true, color: [26,79,171], bold: true });
    }

    // PSA
    if (d.tienePSA && calc.psaMonto > 0) {
      const psaLabel = d.psaTipo === '0km' ? 'PSA 0km' : 'PSA Patentado';
      R(`${psaLabel} — bruto`, this.fmt(calc.psaMonto), { color: [26,79,171] });
      if (calc.psaGastos > 0) R('  (-) Gastos PSA', '- '+this.fmt(calc.psaGastos), { sub: true, color: [200,60,60] });
      R('  Neto PSA', '- '+this.fmt(calc.aportePSA), { sub: true, color: [26,79,171], bold: true });
    }

    // Adelanto
    if (d.adelanto > 0) R('(-) Adelanto efectivo', '- '+this.fmt(d.adelanto), { color: [30,122,74], bold: true });

    // Total operación
    R('VALOR TOTAL OPERACIÓN', this.fmt(calc.valorTotal), { big: true });

    // Diferencia final
    const difLabel = calc.diferencia > 0 ? 'FALTA AL CLIENTE' : calc.diferencia < 0 ? 'LE SOBRA AL CLIENTE' : 'CUBIERTO EXACTO';
    const difColor = calc.diferencia > 0 ? [200,16,46] : [30,122,74];
    y += 2;
    doc.setFillColor(...difColor);
    doc.rect(M, y - 5, W - M*2, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(difLabel, M + 4, y + 4);
    doc.text(this.fmt(Math.abs(calc.diferencia)), W - M - 4, y + 4, { align: 'right' });
    y += 18;

    // ── CUOTAS ───────────────────────────────────────────────
    const cuotas = [];
    if (d.tieneCredito && calc.cuotaPrendario > 0)
      cuotas.push({ label: `Cuota ${d.banco || 'Banco'} (prendario)`, cuota: calc.cuotaPrendario, n: d.cuotas });
    if (d.tieneBNA && calc.cuotaBNA > 0)
      cuotas.push({ label: `Cuota ${d.bnaBanco || 'Personal 1'}`, cuota: calc.cuotaBNA, n: d.bnaCuotas });
    if (d.tieneBNA2 && calc.cuotaBNA2 > 0)
      cuotas.push({ label: `Cuota ${d.bna2Banco || 'Personal 2'}`, cuota: calc.cuotaBNA2, n: d.bna2Cuotas });
    if (d.tienePSA && calc.cuotaPSA > 0)
      cuotas.push({ label: `Cuota PSA ${d.psaTipo === '0km' ? '0km' : 'Patentado'}`, cuota: calc.cuotaPSA, n: calc.psaCuotas });

    if (cuotas.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      y += 4;
      this._secTitle(doc, 'CUOTAS ESTIMADAS', M, y, [26, 79, 171]);
      y += 8;
      doc.setFillColor(232, 238, 250);
      doc.setDrawColor(180, 200, 240);
      doc.roundedRect(M, y, W - M*2, cuotas.length * 9 + 8, 2, 2, 'FD');
      let cy = y + 8;
      cuotas.forEach(c => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 80, 140);
        doc.text(c.label + ':', M + 5, cy);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 79, 171);
        doc.text(`${this.fmt(Math.round(c.cuota))} x ${c.n}`, W - M - 5, cy, { align: 'right' });
        cy += 9;
      });
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 130, 160);
      doc.text('* Cuotas estimadas. Sujetas a aprobación de la entidad financiera.', M + 5, cy + 1);
      y += cuotas.length * 9 + 16;
    }

    // ── VIGENCIA + FIRMA ─────────────────────────────────────
    if (y > 248) { doc.addPage(); y = 20; }
    y = Math.max(y + 6, 230);

    doc.setFillColor(248, 246, 242);
    doc.rect(M, y, W - M*2, 11, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Vigencia: ${d.vigencia} desde la fecha de emisión.`, M + 4, y + 7);

    y += 18;
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
    doc.text(`${E.nombre}  ·  ${E.ciudad}  ·  ${E.telefono}  ·  ${E.web}`, W/2, H - 8, { align: 'center' });

    const filename = `Presupuesto_${(d.cliente || 'Cliente').replace(/\s+/g, '_')}_Tutu.pdf`;
    doc.save(filename);
    return filename;
  },

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
    show('pv-credito-row', d.tieneCredito && calc.cuotaPrendario > 0);
    if (d.tieneCredito && calc.cuotaPrendario) set('pv-cuota', `${this.fmt(Math.round(calc.cuotaPrendario))} x ${d.cuotas}`);
    set('pv-total', this.fmt(Math.abs(calc.diferencia)));
  }
};
