/**
 * Piezas comunes de los correos: idioma, textos de clase y filas de fecha/hora.
 * Todo lo que viene de la base de datos o del usuario se escapa aquí.
 */
import { escapar, type Idioma } from "./plantilla-correo.ts";
import {
  formatFechaCalendario,
  formatFechaClase,
  normalizarZona,
  rangoHoraEnZona,
  rangoHoraMadrid,
  ZONA_ESCUELA,
} from "./fechas.ts";

export type { Idioma };
export const SITIO = "https://www.spanishnook.com";
export const URL_AREA = `${SITIO}/AreaPersonal`;
/** Calendario de clases individuales (ruta /Reservas de la web). */
export const URL_RESERVAR = `${SITIO}/Reservas`;
/** Página de clases y cursos (ruta /Clases de la web). */
export const URL_CURSOS = `${SITIO}/Clases`;

/** 'es' | 'en' a partir de 'es', 'en', 'es-ES', 'en-US'...; null si no se reconoce. */
export function idiomaDesde(valor: unknown): Idioma | null {
  if (typeof valor !== "string") return null;
  const v = valor.trim().toLowerCase();
  if (v === "en" || v.startsWith("en-")) return "en";
  if (v === "es" || v.startsWith("es-")) return "es";
  return null;
}

/**
 * Idioma del correo: el que manda la web si es válido; si no, inglés cuando el
 * idioma nativo del alumno es inglés; en cualquier otro caso, español.
 */
export function resolverIdioma(explicito: unknown, idiomaNativo?: string | null): Idioma {
  const directo = idiomaDesde(explicito);
  if (directo) return directo;
  const nativo = String(idiomaNativo ?? "").trim().toLowerCase();
  if (nativo === "english" || nativo === "inglés" || nativo === "ingles" || nativo === "en") return "en";
  return "es";
}

export function localeDe(idioma: Idioma): string {
  return idioma === "en" ? "en-GB" : "es-ES";
}

/** "Hola Ana:" / "Hi Ana," (nombre escapado). */
export function saludo(nombre: string | null | undefined, idioma: Idioma): string {
  const n = escapar(nombre?.trim() || (idioma === "en" ? "there" : ""));
  if (idioma === "en") return `Hi ${n},`;
  return n ? `Hola ${n}:` : "Hola:";
}

export function tipoClase(tipo: string | null | undefined, idioma: Idioma): string {
  const conversacion = tipo === "conversacion";
  if (idioma === "en") return conversacion ? "Conversation class" : "General class";
  return conversacion ? "Clase de conversación" : "Clase general";
}

/** Importe en céntimos → '32,00 €' / '€32.00'. */
export function formatoEuros(centimos: number | null | undefined, idioma: Idioma): string {
  return new Intl.NumberFormat(localeDe(idioma), { style: "currency", currency: "EUR" })
    .format((Number(centimos) || 0) / 100);
}

const DIAS_EN: Record<string, string> = {
  lunes: "Monday", martes: "Tuesday", miercoles: "Wednesday", jueves: "Thursday",
  viernes: "Friday", sabado: "Saturday", domingo: "Sunday",
};

function sinTildes(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Lista de días de un curso, traducida si hace falta. Ej.: 'Lunes, Miércoles'. */
export function textoDias(dias: unknown, idioma: Idioma): string {
  let lista: string[] = [];
  if (Array.isArray(dias)) lista = dias.map(String);
  else if (typeof dias === "string" && dias.trim()) {
    try {
      const v = JSON.parse(dias);
      lista = Array.isArray(v) ? v.map(String) : [dias];
    } catch {
      lista = [dias];
    }
  }
  if (lista.length === 0) return idioma === "en" ? "the agreed days" : "los días acordados";
  return lista.map((d) => (idioma === "en" ? DIAS_EN[sinTildes(d)] ?? d : d)).join(", ");
}

/** Primera hora 'HH:mm' que aparezca en horarios_curso (array o texto). */
export function primeraHora(horarios: unknown): string | null {
  const m = String(Array.isArray(horarios) ? horarios[0] ?? "" : horarios ?? "").match(/\d{1,2}:\d{2}/);
  return m ? m[0].padStart(5, "0") : null;
}

/** Enlace seguro (solo https) para meter en un href, o null. */
export function enlaceSeguro(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export interface DatosClase {
  fecha: string;
  hora: string;
  tipo?: string | null;
  meetLink?: string | null;
}

/**
 * Filas [etiqueta, valor] para tablaDatos() con la fecha y la hora de una clase:
 * siempre en Madrid y, si la zona del alumno da otra hora, también en su zona.
 * Los valores ya van escapados.
 */
export function filasClase(clase: DatosClase, idioma: Idioma, zona?: string | null, duracionMin = 60): Array<[string, string]> {
  const locale = localeDe(idioma);
  const en = idioma === "en";
  const filas: Array<[string, string]> = [
    [en ? "Date" : "Fecha", escapar(formatFechaCalendario(clase.fecha, locale))],
    [en ? "Time (Madrid)" : "Hora (Madrid)", escapar(rangoHoraMadrid(clase.hora, duracionMin))],
  ];

  const zonaAlumno = normalizarZona(zona);
  if (zonaAlumno !== ZONA_ESCUELA) {
    const fechaLocal = formatFechaClase(clase.fecha, clase.hora, zonaAlumno, locale);
    const horaLocal = rangoHoraEnZona(clase.fecha, clase.hora, duracionMin, zonaAlumno);
    const mismaHora = fechaLocal === formatFechaCalendario(clase.fecha, locale) &&
      horaLocal === rangoHoraMadrid(clase.hora, duracionMin);
    if (!mismaHora) {
      const ciudad = zonaAlumno.split("/").pop()?.replace(/_/g, " ") ?? zonaAlumno;
      filas.push([
        `${en ? "Your time" : "Tu hora"} (${escapar(ciudad)})`,
        `${escapar(fechaLocal)} · ${escapar(horaLocal)}`,
      ]);
    }
  }

  if (clase.tipo) filas.push([en ? "Type" : "Tipo", escapar(tipoClase(clase.tipo, idioma))]);

  const meet = enlaceSeguro(clase.meetLink);
  if (meet) {
    filas.push([
      en ? "Video call" : "Videollamada",
      `<a href="${escapar(meet)}" target="_blank" style="color:#851319;">${en ? "Join Google Meet" : "Entrar en Google Meet"}</a>`,
    ]);
  }
  return filas;
}
