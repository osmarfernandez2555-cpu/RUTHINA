// ============================================================
//  RUTHINA — CONTROLADOR DE UI
// ============================================================

const UI = {

  currentView: 'chat',
  isTyping: false,

  init() {
    this.renderStock();
    this.setupInputAutoResize();
    this.checkConfig();
    // Auto-cargar datos al arrancar
    setTimeout(() => DataLoader.loadAll().catch(console.warn), 1000);
  },

  checkConfig() {
    if (RUTHINA_CONFIG.ANTHROPIC_API_KEY === 'TU_API_KEY_AQUI') {
      this.addMessage('⚠️ <strong>Configuración pendiente:</strong> Editá el archivo <code>config.js</code> y cargá tu API Key de Anthropic y los IDs de tus archivos de Drive para que Ruthina funcione.', 'ruthina');
    }
  },

  showView(view) {
    this.currentView = view;
    ['chat', 'budget', 'stock', 'drive'].forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));

    const el = document.getElementById('view-' + view);
    if (el) el.style.display = (view === 'chat' || view === 'stock') ? 'flex' : 'block';

    const btn = document.querySelector(`[data-view="${view}"]`);
    if (btn) btn.classList.add('active');

    if (view === 'stock') this.renderStock();
  },

  // ── CHAT ────────────────────────────────────────────────

  handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  },

  setupInputAutoResize() {
    const inp = document.getElementById('chatInput');
    if (inp) inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
    });
  },

  sendQuick(text) {
    document.getElementById('chatInput').value = text;
    this.sendMessage();
  },

  async sendMessage() {
    if (this.isTyping) return;
    const inp = document.getElementById('chatInput');
    const text = inp.value.trim();
    if (!text) return;

    inp.value = '';
    inp.style.height = 'auto';
    this.isTyping = true;

    this.addMessage(text, 'user');
    this.showTyping();

    try {
      const reply = await ChatEngine.sendMessage(text);
      this.removeTyping();
      this.addMessage(reply, 'ruthina');
    } catch (err) {
      this.removeTyping();
      const msg = err.message?.includes('401')
        ? '⚠️ API Key incorrecta. Verificá tu <code>config.js</code>.'
        : err.message?.includes('CORS') || err.message?.includes('fetch')
        ? '⚠️ Error de conexión. Verificá que la API key sea correcta y que estés conectado a internet.'
        : `⚠️ Error: ${err.message}`;
      this.addMessage(msg, 'ruthina');
    }

    this.isTyping = false;
  },

  addMessage(html, from) {
    const msgs = document.getElementById('messages');
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const isUser = from === 'user';

    const div = document.createElement('div');
    div.className = 'msg' + (isUser ? ' msg-user' : '');

    // Formato del texto: Ruthina puede usar **negrita** y saltos de línea
    const formatted = isUser ? html : html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    div.innerHTML = `
      <div class="msg-avatar ${isUser ? 'av-user' : 'av-ruthina'}">${isUser ? 'VD' : 'Ru'}</div>
      <div>
        <div class="bubble ${isUser ? 'bubble-user' : 'bubble-ruthina'}">${formatted}</div>
        <div class="msg-time">${isUser ? 'Vos' : 'Ruthina'} · ${now}</div>
      </div>`;

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  showTyping() {
    const msgs = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'msg';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar av-ruthina">Ru</div>
      <div class="bubble bubble-ruthina typing">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  removeTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
  },

  setLoadingStatus(msg) {
    const el = document.getElementById('drive-status');
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  },

  // ── BUDGET ──────────────────────────────────────────────

  toggleSection(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  generateBudget() {
    const btn = document.getElementById('btn-generate');
    const d = BudgetPDF.collect();

    if (!d.modelo) { this.snack('⚠️ Ingresá al menos el modelo del vehículo'); return; }
    if (!d.precioContado && !d.precioLista) { this.snack('⚠️ Ingresá el precio del vehículo'); return; }

    btn.disabled = true;
    btn.textContent = 'Generando PDF...';

    try {
      const filename = BudgetPDF.generate();
      this.snack('✅ Presupuesto descargado: ' + filename);
    } catch (e) {
      this.snack('❌ Error al generar PDF: ' + e.message);
      console.error(e);
    }

    btn.disabled = false;
    btn.textContent = '⬇ Generar Presupuesto PDF';
  },

  // Pre-cargar presupuesto desde el stock
  budgetFromCar(modelo, precio) {
    document.getElementById('b-model').value = modelo;
    document.getElementById('b-price').value = precio;
    document.getElementById('b-cash').value = Math.round(precio * 0.95);
    BudgetPDF.updatePreview();
    this.showView('budget');
  },

  // ── STOCK ───────────────────────────────────────────────

  stockData: [
    { brand: 'JMC', model: 'Vigus Pro 4x4', year: 2024, type: 'nuevo', price: 18500000, desc: 'Automático · Doble cabina · Full equipo' },
    { brand: 'JMC', model: 'Vigus Pro 4x2', year: 2024, type: 'nuevo', price: 15800000, desc: 'Manual · Doble cabina · A/A, cierre central' },
    { brand: 'JMC', model: 'Vigus Cabina Simple', year: 2024, type: 'nuevo', price: 12500000, desc: 'Manual · Cabina simple · Trabajo' },
    { brand: 'Shineray', model: 'X30 EV', year: 2024, type: 'nuevo', price: 21000000, desc: 'Eléctrico · 300km autonomía · Garantía 5 años' },
    { brand: 'Shineray', model: 'T30 Pick-up', year: 2023, type: 'nuevo', price: 9800000, desc: 'Manual · Pick-up liviana · Carga 900kg' },
    { brand: 'Volkswagen', model: 'Amarok V6 Highline', year: 2022, type: 'usado', price: 28000000, desc: '65.000 km · Única mano · Excelente estado' },
    { brand: 'Toyota', model: 'Hilux SRV AT 4x4', year: 2021, type: 'usado', price: 25500000, desc: '72.000 km · Service al día · Cuero' },
    { brand: 'Ford', model: 'Ranger XLT 4x4', year: 2020, type: 'usado', price: 19000000, desc: '89.000 km · Único dueño · Impecable' },
    { brand: 'Renault', model: 'Duster 4x4 Intens', year: 2023, type: 'usado', price: 14500000, desc: '22.000 km · Como nuevo · Garantía' },
    { brand: 'Chevrolet', model: 'S10 LTZ 4x4', year: 2021, type: 'usado', price: 22000000, desc: '55.000 km · Full · Automático' },
  ],

  renderStock(filter = '', type = '') {
    const list = document.getElementById('stockList');
    if (!list) return;

    const cars = this.stockData.filter(c => {
      const matchQ = !filter || (c.brand + ' ' + c.model).toLowerCase().includes(filter.toLowerCase());
      const matchT = !type || c.type === type;
      return matchQ && matchT;
    });

    if (!cars.length) {
      list.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#9A9790">No se encontraron vehículos.</div>`;
      return;
    }

    list.innerHTML = cars.map(c => `
      <div class="car-card">
        <div class="car-brand">${c.brand}</div>
        <div class="car-model">${c.model}</div>
        <div class="car-tags">
          <span class="tag ${c.type === 'nuevo' ? 'tag-new' : 'tag-used'}">${c.type === 'nuevo' ? 'Nuevo' : 'Usado'}</span>
          <span class="tag tag-year">${c.year}</span>
        </div>
        <div class="car-price-label">Precio</div>
        <div class="car-price">$ ${c.price.toLocaleString('es-AR')}</div>
        <div class="car-desc">${c.desc}</div>
        <div class="car-actions">
          <button class="btn-sm btn-chat" onclick="UI.chatAboutCar('${c.brand} ${c.model} ${c.year}')">💬 Consultar</button>
          <button class="btn-sm btn-presup" onclick="UI.budgetFromCar('${c.brand} ${c.model} ${c.year}', ${c.price})">📄 Presupuestar</button>
        </div>
      </div>`).join('');
  },

  chatAboutCar(name) {
    this.showView('chat');
    document.getElementById('chatInput').value = `Contame las características del ${name}`;
    setTimeout(() => this.sendMessage(), 100);
  },

  // ── DRIVE ───────────────────────────────────────────────

  openDriveModal() {
    document.getElementById('driveModal').classList.add('open');
  },

  closeDriveModal() {
    document.getElementById('driveModal').classList.remove('open');
  },

  saveDriveFile() {
    const url = document.getElementById('driveUrl').value.trim();
    const name = document.getElementById('driveName').value.trim() || 'archivo';
    if (!url) { this.snack('⚠️ Ingresá la URL del archivo'); return; }

    const ext = name.split('.').pop().toLowerCase();
    const isPDF = ext === 'pdf';

    const fileData = { id: url.match(/\/d\/([^/]+)/)?.[1] || url, label: name };
    if (isPDF) RUTHINA_CONFIG.PDFS.push(fileData);
    else RUTHINA_CONFIG.SHEETS.push({ id: fileData.id, sheetName: 'Hoja1', label: name });

    // Actualizar lista visual
    const list = document.getElementById('driveFileList');
    const div = document.createElement('div');
    div.className = 'drive-file';
    div.innerHTML = `
      <div class="file-icon ${isPDF ? 'fi-pdf' : 'fi-excel'}">${isPDF ? '📄' : '📊'}</div>
      <div><div class="file-name">${name}</div><div class="file-meta">Agregado manualmente</div></div>
      <span class="file-status">Activo</span>`;
    list.appendChild(div);

    DataLoader.cachedContext = null; // Forzar recarga
    this.closeDriveModal();
    document.getElementById('driveUrl').value = '';
    document.getElementById('driveName').value = '';
    this.snack('✅ Archivo conectado. Se usará en el próximo mensaje.');
  },

  async reloadDrive() {
    const btn = document.getElementById('btn-reload-drive');
    if (btn) { btn.disabled = true; btn.textContent = 'Recargando...'; }
    try {
      await DataLoader.forceReload();
      this.snack('✅ Datos actualizados desde Drive');
    } catch (e) {
      this.snack('❌ Error al recargar: ' + e.message);
    }
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Actualizar datos'; }
  },

  // ── SNACK ───────────────────────────────────────────────

  snack(msg) {
    const s = document.getElementById('snack');
    if (!s) return;
    s.innerHTML = msg;
    s.classList.add('show');
    clearTimeout(this._snackTimer);
    this._snackTimer = setTimeout(() => s.classList.remove('show'), 3500);
  }
};
