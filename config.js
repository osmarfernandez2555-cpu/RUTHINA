// ============================================================
//  RUTHINA — CONFIGURACIÓN
//  Completá estos datos antes de subir a GitHub Pages
// ============================================================

const RUTHINA_CONFIG = {

  // 1. API Key de Anthropic
  ANTHROPIC_API_KEY: "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",

  // 2. Google Sheets — completá sheetName con el nombre exacto de la pestaña
  //    Si son PDFs/Excel estos IDs van en PDFS abajo
  SHEETS: [
    // Descomentá los que sean Google Sheets y completá sheetName:
    // { id: "1tDasFWX6Vt3yLlBrZ73ljVGiLxskwn5H", sheetName: "Hoja1", label: "Archivo 1" },
  ],

  // 3. PDFs / Excel de Drive (los 12 archivos cargados)
  PDFS: [
    { id: "1tDasFWX6Vt3yLlBrZ73ljVGiLxskwn5H", label: "Archivo Tutu 1" },
    { id: "1FEWgIilneb-OzN3cCa5rUHDBJupKclQ1",  label: "Archivo Tutu 2" },
    { id: "1oZXOa4wbBc7CqEbPjDUhDeazT8Ji1_j9",  label: "Archivo Tutu 3" },
    { id: "1HLz5nYZh6vzB5i5MYEt7-s5Fqas9uZ5B",  label: "Archivo Tutu 4" },
    { id: "1dbbYAicC5XFx7r_N4ENNegKhN3kOi9PW",  label: "Archivo Tutu 5" },
    { id: "17rg0xBgZebIMomZgvFh2PiGiTQjqOXkc",  label: "Archivo Tutu 6" },
    { id: "1ve6QvdzYqMRuW9qnoKYa6YWjpwr-xh64",  label: "Archivo Tutu 7" },
    { id: "1p6xIir5cNLB1xf2CLbMzYUM5-AsbvhJv",  label: "Archivo Tutu 8" },
    { id: "1wf4CPO7gs97nrGYE30hXmKhdgO3T2nXL",  label: "Archivo Tutu 9" },
    { id: "1tnb_pxfiyrky0f6bLaJzkgtxAsD8AsoK",  label: "Archivo Tutu 10" },
    { id: "1e3jpdfiIwIf9TUN5-5iVfMmFNGUcpy9P",  label: "Archivo Tutu 11" },
    { id: "10eNLZeNc4Cltab8YtqJvPIRY61y6UlX_",  label: "Archivo Tutu 12" },
  ],

  // 4. Datos de la empresa (para los presupuestos PDF)
  EMPRESA: {
    nombre: "Tutu Automotores",
    slogan: "Tu auto ideal, al mejor precio",
    telefono: "+54 351 XXX-XXXX",
    email: "ventas@tutuautomotores.com.ar",
    web: "www.tutuautomotores.com.ar",
    ciudad: "Córdoba, Argentina",
    sucursales: "4 sucursales en Córdoba"
  },

  // 5. Personalidad de Ruthina (podés ajustar el tono)
  RUTHINA_PERSONALIDAD: `Sos Ruthina, la asistente interna de ventas de Tutu Automotores, 
una concesionaria con 4 sucursales en Córdoba, Argentina. 
Sos especialista en autos nuevos (JMC y Shineray) y usados.
Respondés en español argentino, de manera profesional pero cercana y directa.
Cuando el vendedor pregunta por precios o stock, buscás en los datos cargados.
Si encontrás el dato, lo decís con precisión. Si no está en los datos, lo aclarás.
Podés ayudar con: características técnicas, comparaciones entre modelos, 
opciones de financiación, tasación de permutas, y armar presupuestos.
Usá emojis con moderación. Nunca inventés precios ni datos que no estén en los archivos.`

};
