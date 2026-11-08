/**
 * Google Calendar / Meet con OAuth2 (refresh token de la cuenta de Paula).
 * Secretos: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID.
 */
import { sumarMinutosPared, ZONA_ESCUELA } from "./fechas.ts";

const API = "https://www.googleapis.com/calendar/v3/calendars";

function calendario(): string {
  const id = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!id) throw new Error("Falta GOOGLE_CALENDAR_ID");
  return encodeURIComponent(id);
}

/** Token de acceso de Google, o null si faltan credenciales o falla la renovación. */
export async function tokenGoogle(): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[google] Faltan credenciales OAuth2");
    return null;
  }
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      console.error("[google] Error renovando token:", res.status, data?.error ?? "");
      return null;
    }
    return data.access_token as string;
  } catch (e) {
    console.error("[google] Error de red renovando token:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

/** Inicio y fin de un evento en hora de pared de Madrid. */
export function horarioEvento(fecha: string, hora: string, duracionMin: number) {
  const fin = sumarMinutosPared(fecha, hora, duracionMin);
  return {
    start: { dateTime: `${fecha}T${hora.slice(0, 5)}:00`, timeZone: ZONA_ESCUELA },
    end: { dateTime: `${fin.fecha}T${fin.hora}:00`, timeZone: ZONA_ESCUELA },
  };
}

/** Petición de Meet para conferenceData. */
export function peticionMeet() {
  return { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } };
}

/** Crea un evento (con Meet). Lanza error si Google responde mal. */
export async function crearEvento(token: string, evento: Record<string, unknown>): Promise<{ link: string | null; id: string }> {
  const res = await fetch(`${API}/${calendario()}/events?conferenceDataVersion=1&sendUpdates=none`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google API ${res.status}: ${data?.error?.message ?? "error desconocido"}`);
  return { link: data.conferenceData?.entryPoints?.[0]?.uri ?? null, id: data.id };
}

/** Añade un asistente a un evento existente (sin duplicar) y avisa por Google. */
export async function anadirAsistente(token: string, eventId: string, email: string): Promise<void> {
  const url = `${API}/${calendario()}/events/${encodeURIComponent(eventId)}`;
  const getRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!getRes.ok) {
    if (getRes.status === 404) throw new Error("Evento no encontrado (404)");
    throw new Error(`Error recuperando evento: ${getRes.status}`);
  }
  const evento = await getRes.json();
  const asistentes: Array<{ email: string }> = evento.attendees ?? [];
  if (asistentes.some((a) => a.email?.toLowerCase() === email.toLowerCase())) return;
  asistentes.push({ email });
  const patch = await fetch(`${url}?sendUpdates=all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ attendees: asistentes }),
  });
  if (!patch.ok) throw new Error(`Error actualizando asistentes: ${patch.status}`);
}

/**
 * Borra un evento. 404/410 cuentan como ya borrado. Lanza error en otros fallos.
 * Por defecto sin aviso de Google (sendUpdates=none): el evento desaparece del
 * calendario del alumno igual, y el aviso ya lo damos con nuestro correo.
 */
export async function borrarEvento(token: string, eventId: string, avisar = false): Promise<void> {
  const res = await fetch(
    `${API}/${calendario()}/events/${encodeURIComponent(eventId)}?sendUpdates=${avisar ? "all" : "none"}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Error borrando evento: ${res.status}`);
  }
}

/** Evento de una clase individual (1 h) con Meet e invitación al alumno. Nunca lanza: null si falla. */
export async function crearEventoClase(datos: {
  nombre: string;
  email?: string | null;
  fecha: string;
  hora: string;
  tipo: string;
  reservaId?: string;
}): Promise<{ link: string | null; id: string } | null> {
  try {
    const token = await tokenGoogle();
    if (!token) return null;
    const email = datos.email && datos.email.includes("@") ? datos.email : null;
    return await crearEvento(token, {
      summary: `Spanish Class (${datos.tipo}) - ${datos.nombre}`,
      description: datos.reservaId ? `Clase individual.\nID: ${datos.reservaId}` : `Clase reservada vía Spanish Nook.\nTipo: ${datos.tipo}`,
      ...horarioEvento(datos.fecha, datos.hora, 60),
      conferenceData: peticionMeet(),
      attendees: email ? [{ email }] : [],
    });
  } catch (e) {
    console.error("[google] Error creando evento de clase:", e instanceof Error ? e.message : String(e));
    return null;
  }
}
