// ============================================================
//  RUTHINA — MOTOR DE CHAT (Claude API)
// ============================================================

const ChatEngine = {
  history: [],
  pdfDocs: [],   // PDFs en base64 para enviar a Claude

  reset() {
    this.history = [];
    this.pdfDocs = [];
  },

  async sendMessage(userText) {
    // Cargar datos de Drive (usa caché si está fresco)
    let driveContext = "";
    let pdfDocs = [];

    try {
      const raw = await DataLoader.loadAll();

      // Separar texto plano de PDFs en base64
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

    // System prompt con contexto completo
    const systemPrompt = `${RUTHINA_CONFIG.RUTHINA_PERSONALIDAD}

${driveContext ? `== DATOS ACTUALES DE STOCK Y PRECIOS (leídos de Google Drive) ==
${driveContext}
== FIN DE DATOS ==

Usá estos datos para responder con precisión. Si el dato no está acá, decilo claramente.` : ''}

Empresa: ${RUTHINA_CONFIG.EMPRESA.nombre}
Ciudad: ${RUTHINA_CONFIG.EMPRESA.ciudad}
Tel: ${RUTHINA_CONFIG.EMPRESA.telefono}
Web: ${RUTHINA_CONFIG.EMPRESA.web}`;

    // Armar mensajes para la API
    // Si hay PDFs, los incluimos en el primer mensaje del usuario como documentos
    this.history.push({ role: "user", content: userText });

    // Construir messages array para la API
    let messages = [];

    if (pdfDocs.length > 0 && this.history.length === 1) {
      // Primera pregunta: incluir PDFs como documentos
      const content = [
        ...pdfDocs.map(pdf => ({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: pdf.base64
          },
          title: pdf.label
        })),
        { type: "text", text: userText }
      ];
      messages = [{ role: "user", content }];
    } else {
      messages = this.history.map(m => ({ role: m.role, content: m.content }));
    }

    // Llamada a la API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": RUTHINA_CONFIG.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "No pude generar una respuesta.";

    // Guardar en historial
    this.history.push({ role: "assistant", content: reply });

    // Limitar historial a últimos 20 mensajes para no inflar tokens
    if (this.history.length > 20) {
      this.history = this.history.slice(-20);
    }

    return reply;
  }
};
