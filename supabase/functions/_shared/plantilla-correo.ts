/**
 * Plantilla común de correo de SpanishNook ("Papel y tinta").
 *
 * Mismo sistema que la web: burdeos #851319, papel #FFFDF8, tinta #2B1D1F.
 * HTML de tablas con estilos en línea: es lo que respetan Gmail, Outlook y Apple Mail.
 * Las fuentes web no son fiables en correo: Montserrat/Nunito Sans si el cliente las tiene,
 * y si no Arial/Helvetica.
 *
 * Uso:
 *   import { plantillaCorreo, parrafo, tablaDatos, escapar } from './plantilla-correo.ts';
 *   const html = plantillaCorreo({
 *     idioma: 'es',
 *     titulo: '¡Reserva confirmada!',
 *     resumen: 'Tu clase del lunes 9 a las 18:00 está confirmada.',
 *     cuerpo: parrafo('Hola Ana:') + tablaDatos([['Fecha', 'Lunes, 9 de noviembre'], ['Hora', '18:00']]),
 *     boton: { texto: 'Ver mis reservas', url: 'https://www.spanishnook.com/AreaPersonal' },
 *   });
 */

export type Idioma = 'es' | 'en';

const C = {
  burdeos: '#851319',
  burdeosHondo: '#5C0E13',
  papel: '#FFFDF8',
  hoja: '#FFFFFF',
  tinta: '#2B1D1F',
  tintaSuave: '#67585A',
  borde: '#EADFD5',
  nota: '#FFF4C7',
  notaBorde: '#ECD98C',
};

const TITULOS = "Montserrat, 'Nunito Sans', Arial, Helvetica, sans-serif";
const TEXTO = "'Nunito Sans', Arial, Helvetica, sans-serif";
const SITIO = 'https://www.spanishnook.com';
const LOGO = `${SITIO}/img/Logotexto_500.png`;

const PIE: Record<Idioma, { lema: string; contacto: string; legal: string; motivo: string }> = {
  es: {
    lema: 'Clases de español online, a tu ritmo y desde tu sitio.',
    contacto: '¿Dudas? Responde a este correo o escríbenos por WhatsApp.',
    legal: 'Aviso legal · Privacidad',
    motivo: 'Recibes este correo por una gestión en tu cuenta de SpanishNook.',
  },
  en: {
    lema: 'Online Spanish lessons, at your pace and from your place.',
    contacto: 'Questions? Reply to this email or message us on WhatsApp.',
    legal: 'Legal notice · Privacy',
    motivo: 'You are receiving this email because of an action on your SpanishNook account.',
  },
};

/** Escapa texto que viene de la base de datos o del usuario antes de meterlo en HTML. */
export function escapar(texto: unknown): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Párrafo de texto normal (el texto ya debe venir escapado si contiene datos externos). */
export function parrafo(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${TEXTO};font-size:16px;line-height:1.6;color:${C.tinta};">${html}</p>`;
}

/** Subtítulo dentro del cuerpo. */
export function subtitulo(texto: string): string {
  return `<h2 style="margin:24px 0 8px;font-family:${TITULOS};font-size:18px;line-height:1.3;font-weight:700;color:${C.burdeos};">${texto}</h2>`;
}

/** Tabla de datos clave: [etiqueta, valor]. Los valores ya deben venir escapados. */
export function tablaDatos(filas: Array<[string, string]>): string {
  const tr = filas
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:10px 14px;${i ? `border-top:1px solid ${C.borde};` : ''}font-family:${TEXTO};font-size:14px;color:${C.tintaSuave};white-space:nowrap;vertical-align:top;">${k}</td>
        <td style="padding:10px 14px;${i ? `border-top:1px solid ${C.borde};` : ''}font-family:${TEXTO};font-size:15px;font-weight:700;color:${C.tinta};">${v}</td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border:1px solid ${C.borde};border-radius:12px;border-collapse:separate;background:${C.papel};">${tr}</table>`;
}

/** Caja destacada tipo "nota" (mismo amarillo que la web). */
export function nota(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td style="padding:14px 16px;background:${C.nota};border:1px solid ${C.notaBorde};border-radius:12px;font-family:${TEXTO};font-size:15px;line-height:1.5;color:${C.tinta};">${html}</td></tr></table>`;
}

/** Botón principal (píldora burdeos). Funciona también en Outlook gracias al padding en la celda. */
export function boton(texto: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>
    <td style="border-radius:999px;background:${C.burdeos};">
      <a href="${escapar(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${TITULOS};font-size:16px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:999px;">${texto}</a>
    </td></tr></table>`;
}

export interface OpcionesCorreo {
  idioma?: Idioma;
  /** Título grande del correo (texto plano, se escapa). */
  titulo: string;
  /** Texto de vista previa en la bandeja de entrada (texto plano, se escapa). */
  resumen?: string;
  /** HTML del cuerpo, construido con parrafo(), tablaDatos(), nota()... */
  cuerpo: string;
  /** Botón principal opcional, debajo del cuerpo. */
  boton?: { texto: string; url: string };
}

/** Documento HTML completo del correo. */
export function plantillaCorreo({ idioma = 'es', titulo, resumen = '', cuerpo, boton: btn }: OpcionesCorreo): string {
  const pie = PIE[idioma] ?? PIE.es;
  return `<!doctype html>
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapar(titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${C.papel};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapar(resumen)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.papel};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="background:${C.burdeos};border-radius:16px 16px 0 0;padding:20px 28px;">
        <a href="${SITIO}" target="_blank" style="text-decoration:none;">
          <img src="${LOGO}" width="56" height="56" alt="SpanishNook" style="display:inline-block;vertical-align:middle;border-radius:50%;background:#FFFFFF;border:0;">
          <span style="display:inline-block;vertical-align:middle;margin-left:12px;font-family:${TITULOS};font-size:20px;font-weight:700;color:#FFFFFF;">SpanishNook</span>
        </a>
      </td></tr>
      <tr><td style="background:${C.hoja};border:1px solid ${C.borde};border-top:0;border-radius:0 0 16px 16px;padding:32px 28px 12px;">
        <h1 style="margin:0 0 20px;font-family:${TITULOS};font-size:26px;line-height:1.2;font-weight:700;color:${C.burdeos};">${escapar(titulo)}</h1>
        ${cuerpo}
        ${btn ? boton(btn.texto, btn.url) : ''}
        <p style="margin:8px 0 20px;font-family:${TEXTO};font-size:14px;line-height:1.5;color:${C.tintaSuave};">${pie.contacto}</p>
      </td></tr>
      <tr><td style="padding:20px 28px;text-align:center;">
        <p style="margin:0 0 6px;font-family:${TEXTO};font-size:13px;line-height:1.5;color:${C.tintaSuave};">${pie.lema}</p>
        <p style="margin:0 0 6px;font-family:${TEXTO};font-size:12px;line-height:1.5;color:${C.tintaSuave};">${pie.motivo}</p>
        <p style="margin:0;font-family:${TEXTO};font-size:12px;"><a href="${SITIO}/Aviso" style="color:${C.burdeos};">${pie.legal.split(' · ')[0]}</a> · <a href="${SITIO}/Privacidad" style="color:${C.burdeos};">${pie.legal.split(' · ')[1]}</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
