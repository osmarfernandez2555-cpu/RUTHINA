// ============================================================
//  RUTHINA — MOTOR DE CHAT
//  Todas las llamadas van al proxy Railway — nunca directo a Anthropic
// ============================================================
const ChatEngine = {
  history: [],
  reset() {
    this.history = [];
  },

  async sendMessage(userText) {
    const BASE = RUTHINA_CONFIG.RAILWAY_URL;

    // Cargar datos de Drive (caché 10 min)
    let driveContext = "";
    let pdfDocs = [];
    try {
      const raw = await DataLoader.loadAll();
      if (typeof raw === 'string') {
        driveContext = raw;
      } else if (Array.isArray(raw)) {
        raw.forEach(item => {
          if (item && item.type === 'pdf_base64') {
            pdfDocs.push(item);
          } else if (typeof item === 'string') {
            driveContext += item + "\n\n";
          }
        });
      }
    } catch (e) {
      driveContext = "[Error al cargar datos de Drive. Respondé con la info que tengas.]";
    }

    // System prompt base
    const systemPrompt = `${RUTHINA_CONFIG.RUTHINA_PERSONALIDAD}
${driveContext ? `\n== DATOS DE STOCK Y PRECIOS (Google Drive) ==\n${driveContext}\n== FIN DE DATOS ==\nUsá estos datos para responder con precisión. Si el dato no está acá, decilo claramente.` : ''}
Empresa: ${RUTHINA_CONFIG.EMPRESA.nombre} | Ciudad: ${RUTHINA_CONFIG.EMPRESA.ciudad} | Tel: ${RUTHINA_CONFIG.EMPRESA.telefono}`;

    // Agregar mensaje al historial
    this.history.push({ role: "user", content: userText });

    // Construir messages — si hay PDFs y es el primer mensaje, incluirlos
    let messages = [];
    if (pdfDocs.length > 0 && this.history.length === 1) {
      const content = [
        ...pdfDocs.map(pdf => ({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: pdf.base64 },
          title: pdf.label
        })),
        { type: "text", text: userText }
      ];
      messages = [{ role: "user", content }];
    } else {
      messages = this.history.map(m => ({ role: m.role, content: m.content }));
    }

    // Llamar al proxy Railway
    const response = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    let reply = data.content?.[0]?.text || "No pude generar una respuesta.";

    // ── Procesar comandos de stock ──────────────────────────
    const guardarMatch = reply.match(/\[GUARDAR_STOCK:(\{[\s\S]*?\})\]/);
    const eliminarMatch = reply.match(/\[ELIMINAR_STOCK:(\{[\s\S]*?\})\]/);

    if (guardarMatch) {
      try {
        const auto = JSON.parse(guardarMatch[1]);
        await fetch(`${BASE}/api/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(auto)
        });
      } catch(e) { console.error('Error guardando stock:', e); }
      reply = reply.replace(/\[GUARDAR_STOCK:[\s\S]*?\]/g, '').trim();
    }

    if (eliminarMatch) {
      try {
        const target = JSON.parse(eliminarMatch[1]);
        await fetch(`${BASE}/api/stock`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
      } catch(e) { console.error('Error eliminando stock:', e); }
      reply = reply.replace(/\[ELIMINAR_STOCK:[\s\S]*?\]/g, '').trim();
    }
    // ────────────────────────────────────────────────────────

    // Guardar en historial y limitar a 20 mensajes
    this.history.push({ role: "assistant", content: reply });
    if (this.history.length > 20) this.history = this.history.slice(-20);

    return reply;
  }
};
