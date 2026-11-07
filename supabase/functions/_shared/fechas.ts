/**
 * Fechas y zonas horarias para las Edge Functions (port de src/utils/zonaHoraria.ts).
 *
 * Regla del proyecto: fecha 'YYYY-MM-DD' + hora 'HH:mm' guardadas en Supabase son
 * hora de pared de Madrid (Europe/Madrid). Solo Intl nativo, sin dependencias.
 */

export const ZONA_ESCUELA = "Europe/Madrid";

const MS_MINUTO = 60_000;
const MS_HORA = 3_600_000;

const dos = (n: number) => String(n).padStart(2, "0");

// --- Internos ---------------------------------------------------------------

const cacheFormateadores = new Map<string, Intl.DateTimeFormat>();

function formateadorPartes(zona: string): Intl.DateTimeFormat {
  let f = cacheFormateadores.get(zona);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zona,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    cacheFormateadores.set(zona, f);
  }
  return f;
}

function partesEnZona(instante: Date, zona: string) {
  const p: Record<string, number> = {};
  for (const { type, value } of formateadorPartes(zona).formatToParts(instante)) {
    if (type !== "literal") p[type] = Number(value);
  }
  return { y: p.year ?? 0, m: p.month ?? 1, d: p.day ?? 1, h: p.hour ?? 0, mi: p.minute ?? 0, s: p.second ?? 0 };
}

/** Diferencia (ms) entre la hora de pared de `zona` y UTC en ese instante. */
function offsetZona(instante: Date, zona: string): number {
  const { y, m, d, h, mi, s } = partesEnZona(instante, zona);
  const comoUTC = Date.UTC(y, m - 1, d, h, mi, s);
  return comoUTC - Math.floor(instante.getTime() / 1000) * 1000;
}

function parseFecha(fecha: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha ?? "").trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return [y, mo, d];
}

function parseHora(hora: string): [number, number] | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hora ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return [h, mi];
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Validación -------------------------------------------------------------

/** true si es una fecha 'YYYY-MM-DD' real (rechaza 2026-02-31). */
export function esFechaISO(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const f = parseFecha(valor);
  if (!f) return false;
  const t = new Date(Date.UTC(f[0], f[1] - 1, f[2]));
  return t.getUTCFullYear() === f[0] && t.getUTCMonth() === f[1] - 1 && t.getUTCDate() === f[2];
}

/** Hora normalizada 'HH:mm' (acepta 'H:mm', 'HH:mm' y 'HH:mm:ss'), o null. */
export function normalizarHora(valor: unknown): string | null {
  if (typeof valor !== "string" || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(valor.trim())) return null;
  const h = parseHora(valor);
  return h ? `${dos(h[0])}:${dos(h[1])}` : null;
}

/** true si `zona` es una zona IANA que entiende Intl. */
export function zonaValida(zona: unknown): zona is string {
  if (typeof zona !== "string" || zona.length === 0 || zona.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

/** Zona válida o Madrid por defecto. */
export function normalizarZona(zona: unknown): string {
  return zonaValida(zona) ? zona : ZONA_ESCUELA;
}

// --- Conversión -------------------------------------------------------------

/**
 * Convierte una fecha + hora de Madrid en el instante real (Date).
 * Tiene en cuenta el horario de verano de Madrid en esa fecha. null si no son válidas.
 */
export function instanteDesdeMadrid(fecha: string, hora: string): Date | null {
  const f = parseFecha(fecha);
  const h = parseHora(hora);
  if (!f || !h) return null;
  const pared = Date.UTC(f[0], f[1] - 1, f[2], h[0], h[1]);
  let resultado = pared - offsetZona(new Date(pared), ZONA_ESCUELA);
  // Segunda pasada: corrige si el cambio de hora cae entre `pared` y `resultado`.
  resultado = pared - offsetZona(new Date(resultado), ZONA_ESCUELA);
  return new Date(resultado);
}

/** Horas que faltan hasta la clase (negativo si ya pasó). null si los datos no son válidos. */
export function horasHasta(fecha: string, hora: string, ahora: Date = new Date()): number | null {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return null;
  return (inicio.getTime() - ahora.getTime()) / MS_HORA;
}

/** Fecha de hoy en Madrid, 'YYYY-MM-DD'. */
export function hoyMadridISO(ahora: Date = new Date()): string {
  const { y, m, d } = partesEnZona(ahora, ZONA_ESCUELA);
  return `${y}-${dos(m)}-${dos(d)}`;
}

/** Suma minutos a una hora de pared de Madrid (para el fin de un evento). Pasa de día si hace falta. */
export function sumarMinutosPared(fecha: string, hora: string, minutos: number): { fecha: string; hora: string } {
  const f = parseFecha(fecha);
  const h = parseHora(hora);
  if (!f || !h) return { fecha, hora };
  const t = new Date(Date.UTC(f[0], f[1] - 1, f[2], h[0], h[1] + minutos));
  return {
    fecha: `${t.getUTCFullYear()}-${dos(t.getUTCMonth() + 1)}-${dos(t.getUTCDate())}`,
    hora: `${dos(t.getUTCHours())}:${dos(t.getUTCMinutes())}`,
  };
}

// --- Formato ----------------------------------------------------------------

/** Rango horario en Madrid, solo texto. Ej.: '18:00 - 19:00'. */
export function rangoHoraMadrid(hora: string, duracionMin = 60): string {
  const h = parseHora(hora);
  if (!h) return String(hora ?? "").slice(0, 5);
  const total = h[0] * 60 + h[1] + duracionMin;
  return `${dos(h[0])}:${dos(h[1])} - ${dos(Math.floor(total / 60) % 24)}:${dos(total % 60)}`;
}

/** Rango horario de una clase en otra zona. Ej.: '02:00 - 03:00'. */
export function rangoHoraEnZona(fecha: string, hora: string, duracionMin: number, zona: string): string {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return rangoHoraMadrid(hora, duracionMin);
  const fin = new Date(inicio.getTime() + duracionMin * MS_MINUTO);
  const fmt = new Intl.DateTimeFormat("es-ES", {
    timeZone: normalizarZona(zona),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${fmt.format(inicio)} - ${fmt.format(fin)}`;
}

/** Fecha de calendario en texto largo, sin desplazarla. Ej.: 'Martes, 10 de noviembre de 2026'. */
export function formatFechaCalendario(fecha: string, locale = "es-ES"): string {
  const f = parseFecha(fecha);
  if (!f) return String(fecha ?? "");
  const txt = new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(f[0], f[1] - 1, f[2], 12)));
  return capitalizar(txt);
}

/** Fecha de la clase tal como la vive el alumno en `zona` (puede ser otro día que en Madrid). */
export function formatFechaClase(fecha: string, hora: string, zona: string, locale = "es-ES"): string {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return formatFechaCalendario(fecha, locale);
  const txt = new Intl.DateTimeFormat(locale, {
    timeZone: normalizarZona(zona),
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(inicio);
  return capitalizar(txt);
}

/** 'YYYY-MM-DD' → 'dd/mm/yyyy'. */
export function fechaCorta(fecha: string | null | undefined): string {
  const f = parseFecha(String(fecha ?? ""));
  return f ? `${dos(f[2])}/${dos(f[1])}/${f[0]}` : String(fecha ?? "");
}
