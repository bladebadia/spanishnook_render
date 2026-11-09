/**
 * Utilidades de zona horaria.
 *
 * Regla del proyecto: todas las fechas ('YYYY-MM-DD') y horas ('HH:mm' o 'HH:mm:ss')
 * guardadas en Supabase son hora de Madrid (Europe/Madrid).
 * Estas funciones convierten esos valores a instantes reales (Date) y los
 * muestran en la zona horaria del navegador del alumno.
 *
 * Solo usa Intl nativo: sin dependencias y válido en SSR y cliente.
 */

export const ZONA_ESCUELA = 'Europe/Madrid';

const MS_MINUTO = 60_000;
const MS_HORA = 3_600_000;

// --- Internos ---------------------------------------------------------------

const cacheFormateadores = new Map<string, Intl.DateTimeFormat>();

function formateadorPartes(zona: string): Intl.DateTimeFormat {
  let f = cacheFormateadores.get(zona);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    cacheFormateadores.set(zona, f);
  }
  return f;
}

function partesEnZona(instante: Date, zona: string) {
  const p: Record<string, number> = {};
  for (const { type, value } of formateadorPartes(zona).formatToParts(instante)) {
    if (type !== 'literal') p[type] = Number(value);
  }
  return {
    y: p.year ?? 0,
    m: p.month ?? 1,
    d: p.day ?? 1,
    h: p.hour ?? 0,
    mi: p.minute ?? 0,
    s: p.second ?? 0,
  };
}

/** Diferencia (ms) entre la hora de pared de `zona` y UTC en ese instante. */
function offsetZona(instante: Date, zona: string): number {
  const { y, m, d, h, mi, s } = partesEnZona(instante, zona);
  const comoUTC = Date.UTC(y, m - 1, d, h, mi, s);
  const base = Math.floor(instante.getTime() / 1000) * 1000;
  return comoUTC - base;
}

function parseFecha(fecha: string): [number, number, number] | null {
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})/.exec(fecha?.trim() ?? '');
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function parseHora(hora: string): [number, number] | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(hora?.trim() ?? '');
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return [h, mi];
}

const dos = (n: number) => String(n).padStart(2, '0');

// --- API pública ------------------------------------------------------------

/**
 * Convierte una fecha + hora de Madrid en el instante real (Date).
 * Tiene en cuenta el horario de verano de Madrid en ESA fecha concreta.
 * Devuelve null si los datos no son válidos.
 */
export function instanteDesdeMadrid(fecha: string, hora: string): Date | null {
  const f = parseFecha(fecha);
  const h = parseHora(hora);
  if (!f || !h) return null;

  const pared = Date.UTC(f[0], f[1] - 1, f[2], h[0], h[1]);
  let resultado = pared - offsetZona(new Date(pared), ZONA_ESCUELA);
  // Segunda pasada: corrige si el cambio de hora cae entre `pared` y `resultado`.
  const offsetReal = offsetZona(new Date(resultado), ZONA_ESCUELA);
  resultado = pared - offsetReal;
  return new Date(resultado);
}

/** Zona horaria del navegador (o Madrid en el servidor / si falla). */
export function zonaUsuario(): string {
  if (typeof window === 'undefined') return ZONA_ESCUELA;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_ESCUELA;
  } catch {
    return ZONA_ESCUELA;
  }
}

/** Fecha de hoy en Madrid, formato 'YYYY-MM-DD'. Úsala para consultas a Supabase. */
export function hoyMadridISO(ahora: Date = new Date()): string {
  const { y, m, d } = partesEnZona(ahora, ZONA_ESCUELA);
  return `${y}-${dos(m)}-${dos(d)}`;
}

/** Suma días a una fecha 'YYYY-MM-DD' sin pasar por la zona del navegador. */
export function sumarDiasISO(fecha: string, dias: number): string {
  const f = parseFecha(fecha);
  if (!f) return fecha;
  const t = new Date(Date.UTC(f[0], f[1] - 1, f[2] + dias));
  return `${t.getUTCFullYear()}-${dos(t.getUTCMonth() + 1)}-${dos(t.getUTCDate())}`;
}

/** Suma meses a una fecha 'YYYY-MM-DD' (ajusta al último día si el mes es más corto). */
export function sumarMesesISO(fecha: string, meses: number): string {
  const f = parseFecha(fecha);
  if (!f) return fecha;
  const ultimoDia = new Date(Date.UTC(f[0], f[1] - 1 + meses + 1, 0)).getUTCDate();
  const t = new Date(Date.UTC(f[0], f[1] - 1 + meses, Math.min(f[2], ultimoDia)));
  return `${t.getUTCFullYear()}-${dos(t.getUTCMonth() + 1)}-${dos(t.getUTCDate())}`;
}

/** Horas que faltan hasta una clase (negativo si ya pasó). null si los datos no son válidos. */
export function horasHastaClase(fecha: string, hora: string, ahora: Date = new Date()): number | null {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return null;
  return (inicio.getTime() - ahora.getTime()) / MS_HORA;
}

/** true si la clase empieza estrictamente después de `ahora`. */
export function esClaseFutura(fecha: string, hora: string, ahora: Date = new Date()): boolean {
  const h = horasHastaClase(fecha, hora, ahora);
  return h !== null && h > 0;
}

/** true si faltan al menos `horasMinimas` horas para la clase. */
export function faltanAlMenos(
  fecha: string,
  hora: string,
  horasMinimas: number,
  ahora: Date = new Date(),
): boolean {
  const h = horasHastaClase(fecha, hora, ahora);
  return h !== null && h >= horasMinimas;
}

/** Compara dos clases por instante real (para ordenar). */
export function compararClases(
  a: { fecha: string; hora: string },
  b: { fecha: string; hora: string },
): number {
  const ta = instanteDesdeMadrid(a.fecha, a.hora)?.getTime() ?? 0;
  const tb = instanteDesdeMadrid(b.fecha, b.hora)?.getTime() ?? 0;
  return ta - tb;
}

/**
 * Rango horario de una clase en la zona del alumno. Ej.: '12:00 - 13:00'.
 * `duracionMin` = 60 para individuales, 90 para cursos.
 */
export function rangoHoraLocal(
  fecha: string,
  hora: string,
  duracionMin = 60,
  zona: string = zonaUsuario(),
): string {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return hora?.slice(0, 5) ?? '';
  const fin = new Date(inicio.getTime() + duracionMin * MS_MINUTO);
  const fmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${fmt.format(inicio)} - ${fmt.format(fin)}`;
}

/** Hora de inicio de una clase en la zona del alumno. Ej.: '12:00'. */
export function horaInicioLocal(fecha: string, hora: string, zona: string = zonaUsuario()): string {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return hora?.slice(0, 5) ?? '';
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(inicio);
}

/** Rango horario en Madrid, solo texto. Ej.: '18:00 - 19:00'. */
export function rangoHoraMadrid(hora: string, duracionMin = 60): string {
  const h = parseHora(hora);
  if (!h) return hora?.slice(0, 5) ?? '';
  const total = h[0] * 60 + h[1] + duracionMin;
  return `${dos(h[0])}:${dos(h[1])} - ${dos(Math.floor(total / 60) % 24)}:${dos(total % 60)}`;
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Fecha de calendario 'YYYY-MM-DD' en texto largo, SIN desplazarla por zona.
 * Ej.: 'Domingo, 8 de noviembre de 2026'. Úsala para el calendario de Madrid.
 */
export function formatFechaCalendario(fecha: string, locale = 'es-ES'): string {
  const f = parseFecha(fecha);
  if (!f) return fecha ?? '';
  const txt = new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(Date.UTC(f[0], f[1] - 1, f[2], 12)));
  return capitalizar(txt);
}

/**
 * Fecha de una clase tal como la vive el alumno (puede ser otro día que en Madrid).
 * Ej.: clase el 20 a las 18:00 en Madrid → 'Sábado, 21 de noviembre de 2026' en Tokio.
 */
export function formatFechaClaseLocal(
  fecha: string,
  hora: string,
  locale = 'es-ES',
  zona: string = zonaUsuario(),
): string {
  const inicio = instanteDesdeMadrid(fecha, hora);
  if (!inicio) return formatFechaCalendario(fecha, locale);
  const txt = new Intl.DateTimeFormat(locale, {
    timeZone: zona,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(inicio);
  return capitalizar(txt);
}

/**
 * Partes de la fecha de una clase en la zona del alumno, para un bloque tipo hoja de
 * calendario. Ej.: { diaSemana: 'lun', dia: '9', mes: 'nov' }.
 */
export function partesFechaClaseLocal(
  fecha: string,
  hora: string,
  locale = 'es-ES',
  zona: string = zonaUsuario(),
): { diaSemana: string; dia: string; mes: string } {
  const inicio = instanteDesdeMadrid(fecha, hora);
  const f = parseFecha(fecha);
  const instante = inicio ?? (f ? new Date(Date.UTC(f[0], f[1] - 1, f[2], 12)) : new Date());
  const tz = inicio ? zona : 'UTC';
  const parte = (opciones: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, ...opciones }).format(instante).replace('.', '');
  return {
    diaSemana: parte({ weekday: 'short' }),
    dia: parte({ day: 'numeric' }),
    mes: parte({ month: 'short' }),
  };
}

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function normalizarDia(dia: string): string {
  return dia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Próxima fecha (en Madrid, 'YYYY-MM-DD') que cae en el día de la semana indicado.
 * Acepta 'Lunes', 'miercoles', 'Miércoles'... Sirve para convertir horarios
 * semanales de cursos con el horario de verano correcto.
 */
export function proximaFechaDiaSemana(dia: string, ahora: Date = new Date()): string | null {
  const objetivo = DIAS_ES.map(normalizarDia).indexOf(normalizarDia(dia ?? ''));
  if (objetivo < 0) return null;
  const hoy = hoyMadridISO(ahora);
  const f = parseFecha(hoy);
  if (!f) return null;
  const diaHoy = new Date(Date.UTC(f[0], f[1] - 1, f[2])).getUTCDay();
  return sumarDiasISO(hoy, (objetivo - diaHoy + 7) % 7);
}

/** Nombre del día de la semana en Madrid para una fecha 'YYYY-MM-DD' (con mayúscula y tilde). */
export function diaSemanaMadrid(fecha: string): string {
  const f = parseFecha(fecha);
  if (!f) return '';
  const nombre = DIAS_ES[new Date(Date.UTC(f[0], f[1] - 1, f[2])).getUTCDay()] ?? '';
  return capitalizar(nombre);
}

/**
 * Fechas ('YYYY-MM-DD', de Madrid) de un curso de fechas cerradas: los días entre
 * `desde` y `hasta` (incluidos) que caen en alguno de los días de la semana del curso.
 */
export function fechasDelCurso(desde: string, hasta: string, dias: string[]): string[] {
  if (!parseFecha(desde) || !parseFecha(hasta) || hasta < desde) return [];
  const objetivo = new Set((dias ?? []).map((d) => normalizarDia(d ?? '')));
  const fechas: string[] = [];
  let fecha = desde.slice(0, 10);
  // Tope de seguridad: dos años de curso
  for (let i = 0; i <= 731 && fecha <= hasta; i++) {
    if (objetivo.has(normalizarDia(diaSemanaMadrid(fecha)))) fechas.push(fecha);
    fecha = sumarDiasISO(fecha, 1);
  }
  return fechas;
}

/** Fecha corta de calendario en el idioma indicado. Ej.: '10 nov' / 'Nov 10'. */
export function formatFechaCorta(fecha: string, locale = 'es-ES'): string {
  const f = parseFecha(fecha);
  if (!f) return fecha ?? '';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  }).format(new Date(Date.UTC(f[0], f[1] - 1, f[2], 12)));
}
