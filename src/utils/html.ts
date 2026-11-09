// Escapa texto para meterlo en HTML (diálogos de Quasar con html: true).
// Imprescindible con datos que escribe el usuario (nombre, email...): sin esto,
// un nombre como <img src=x onerror=...> ejecutaría código en la sesión de quien lo ve.
export const escaparHtml = (texto: string | number | null | undefined): string =>
  String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
