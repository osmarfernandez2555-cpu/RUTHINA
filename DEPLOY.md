# RUTHINA — Guía de Deploy en GitHub Pages
## Tutu Automotores · Asistente Interno de Ventas

---

## PASO 1 — Configurar los archivos de Drive y API Key

Antes de subir, abrí el archivo `config.js` y completá:

### 1A. API Key de Anthropic
Conseguila en: https://console.anthropic.com/settings/keys

```js
ANTHROPIC_API_KEY: "sk-ant-api03-...",
```

### 1B. Google Sheets (el stock/precios)

El Sheet DEBE estar compartido como "Cualquiera con el link puede ver":
1. Abrí el Sheet → botón "Compartir" (arriba derecha)
2. "Cambiar a cualquiera con el vínculo"
3. Permisos: "Lector"

El ID del Sheet está en la URL:
```
https://docs.google.com/spreadsheets/d/  [ESTE ES EL ID]  /edit
```

En config.js:
```js
SHEETS: [
  {
    id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",  // ← tu ID acá
    sheetName: "Stock",   // ← nombre exacto de la pestaña
    label: "Stock Tutu Automotores"
  }
],
```

### 1C. PDFs de Drive

El PDF DEBE estar compartido como "Cualquiera con el link puede ver":
1. Abrí Drive → clic derecho en el PDF → "Compartir"
2. "Cualquiera con el vínculo" → "Lector"

El ID del PDF está en la URL:
```
https://drive.google.com/file/d/  [ESTE ES EL ID]  /view
```

En config.js:
```js
PDFS: [
  {
    id: "1a2b3c4d5e6f7g8h9i0j",  // ← tu ID acá
    label: "Lista de precios JMC y Shineray"
  }
],
```

---

## PASO 2 — Subir a GitHub

### 2A. Crear repositorio

1. Entrá a https://github.com y logueate (o creá cuenta gratis)
2. Botón "New repository" (arriba derecha, botón verde o el +)
3. Nombre: `ruthina-tutu` (o el que quieras)
4. Visibility: **Public** ← importante para GitHub Pages gratis
5. Click "Create repository"

### 2B. Subir los archivos

**Opción fácil (sin instalar nada):**

1. En el repositorio vacío, click en "uploading an existing file" o "Add file → Upload files"
2. Arrastrá TODA la carpeta del proyecto:
   ```
   ruthina/
   ├── index.html
   ├── config.js
   ├── css/
   │   └── app.css
   └── js/
       ├── dataloader.js
       ├── chat.js
       ├── budget.js
       └── ui.js
   ```
3. Scroll abajo → "Commit changes" → botón verde

**Opción con Git (si tenés instalado):**
```bash
cd ruthina
git init
git add .
git commit -m "Ruthina v1.0 - Asistente Tutu Automotores"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ruthina-tutu.git
git push -u origin main
```

---

## PASO 3 — Activar GitHub Pages

1. En el repositorio, click en **Settings** (pestaña, arriba)
2. En el menú izquierdo: **Pages**
3. En "Source": seleccioná **Deploy from a branch**
4. Branch: **main** → carpeta: **/ (root)**
5. Click **Save**

⏳ Esperá 1-2 minutos y aparecerá el link:
```
https://TU_USUARIO.github.io/ruthina-tutu/
```

---

## PASO 4 — Compartir con el equipo

Simplemente mandales el link por WhatsApp:
```
https://TU_USUARIO.github.io/ruthina-tutu/
```

Funciona en celular y computadora, sin instalar nada.

---

## ACTUALIZAR EL STOCK

Cuando actualices datos en el Google Sheet o el PDF:
- Ruthina los lee automáticamente cada 10 minutos
- Los vendedores también pueden apretar el botón "Actualizar" en el chat

Para cambiar el Sheet o PDF:
1. Editá `config.js` en GitHub (clic en el archivo → lápiz ✏️)
2. Cambiá el ID → "Commit changes"
3. GitHub Pages se actualiza solo en ~1 minuto

---

## ESTRUCTURA DEL PROYECTO

```
ruthina/
│
├── index.html          ← App principal (no editar)
├── config.js           ← ⚙️ TU CONFIGURACIÓN (editar esto)
│
├── css/
│   └── app.css         ← Estilos (no editar)
│
└── js/
    ├── dataloader.js   ← Lee Sheets y PDFs de Drive
    ├── chat.js         ← Motor de chat con Claude API
    ├── budget.js       ← Generador de presupuestos PDF
    └── ui.js           ← Lógica de la interfaz
```

---

## SOLUCIÓN DE PROBLEMAS

**Ruthina no responde:**
→ Verificá que la API Key en `config.js` sea correcta
→ La key debe empezar con `sk-ant-api03-`

**No carga los datos del Sheet:**
→ Verificá que el Sheet sea público ("Cualquiera con el link puede ver")
→ Verificá que el nombre de la pestaña sea exacto (mayúsculas/minúsculas)

**No carga el PDF:**
→ Verificá que el PDF sea público en Drive
→ Los PDFs grandes (>10MB) pueden tardar en cargar

**El sitio no aparece en GitHub Pages:**
→ Verificá que el repositorio sea **Public**
→ Esperá 2-3 minutos tras activar Pages

---

## SOPORTE

Cualquier duda, editá el `config.js` primero.
El 90% de los problemas son de configuración de API Key o permisos de Drive.
