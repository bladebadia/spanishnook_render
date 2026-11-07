/**
 * crear-meet — Google Calendar / Meet.
 *
 * Quién puede llamarla:
 *  - Llamada interna (Bearer = clave de servicio) o admin: todas las acciones.
 *  - Usuario con sesión: solo { reservaId } de una reserva suya y confirmada.
 *
 * Acciones (POST):
 *  - { reservaId }                                   → evento individual (1 h) + Meet. Respuesta { success, meetLink }
 *  - { esCurso: true, fecha, hora, nombreCurso, duracionMinutos?, diasSemana?, fechaFin? }
 *                                                    → evento semanal del curso. Respuesta { ok, meetLink, googleEventId }
 *  - { action: 'add_attendee', eventId, email }      → invita a un alumno. Respuesta { success }
 *  - { action: 'delete', eventId }                   → borra un evento. Respuesta { success }
 */
import {
  clienteAdmin,
  errores,
  esAdmin,
  esLlamadaInterna,
  esUuid,
  json,
  leerJson,
  preflight,
  usuarioDesdePeticion,
} from "../_shared/auth.ts";
import { anadirAsistente, borrarEvento, crearEvento, crearEventoClase, horarioEvento, peticionMeet, tokenGoogle } from "../_shared/google.ts";
import { esFechaISO, normalizarHora } from "../_shared/fechas.ts";

const DIAS_RRULE: Record<string, string> = {
  lunes: "MO", martes: "TU", miercoles: "WE", jueves: "TH", viernes: "FR", sabado: "SA", domingo: "SU",
};

function sinTildes(s: string): string {
  return s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Evento recurrente semanal de un curso grupal. */
async function crearEventoCurso(body: Record<string, unknown>): Promise<Response> {
  const fecha = body.fecha;
  const hora = normalizarHora(body.hora);
  const nombreCurso = typeof body.nombreCurso === "string" ? body.nombreCurso.slice(0, 200) : "";
  if (!esFechaISO(fecha) || !hora || !nombreCurso) return errores.entrada("Faltan fecha, hora o nombreCurso.");

  const duracion = Number(body.duracionMinutos) > 0 && Number(body.duracionMinutos) <= 480 ? Number(body.duracionMinutos) : 90;

  let regla = "RRULE:FREQ=WEEKLY";
  if (Array.isArray(body.diasSemana)) {
    const dias = body.diasSemana.map((d) => DIAS_RRULE[sinTildes(String(d))]).filter(Boolean);
    if (dias.length) regla += `;BYDAY=${[...new Set(dias)].join(",")}`;
  }
  const fechaFin = body.fechaFin;
  if (esFechaISO(fechaFin)) regla += `;UNTIL=${fechaFin.replace(/-/g, "")}T235959Z`;

  const token = await tokenGoogle();
  if (!token) return errores.interno("No se pudo conectar con Google Calendar.");

  const resultado = await crearEvento(token, {
    summary: `CURSO: ${nombreCurso}`,
    description: "Clase Grupal - Spanish Nook",
    ...horarioEvento(fecha, hora, duracion),
    recurrence: [regla],
    conferenceData: peticionMeet(),
  });
  return json({ ok: true, meetLink: resultado.link, googleEventId: resultado.id });
}

/** Evento individual para una reserva. Si ya tiene evento, devuelve el enlace existente. */
async function crearEventoReserva(reservaId: string, userId: string | null): Promise<Response> {
  const supabase = clienteAdmin();
  const { data: reserva, error } = await supabase
    .from("reservas")
    .select("id, user_id, fecha, hora, tipo, estado, meet_link, google_event_id")
    .eq("id", reservaId)
    .maybeSingle();
  if (error) throw error;
  if (!reserva) return errores.noEncontrado("Reserva no encontrada.");

  // Un alumno solo puede crear el Meet de su propia reserva confirmada
  if (userId !== null && (reserva.user_id !== userId || reserva.estado !== "confirmada")) {
    return errores.prohibido();
  }

  // Idempotente: no crear dos eventos para la misma reserva
  if (reserva.google_event_id) return json({ success: true, meetLink: reserva.meet_link });

  const { data: usuario } = await supabase
    .from("datos_usuarios")
    .select("email, nombre")
    .eq("user_id", reserva.user_id)
    .maybeSingle();

  const evento = await crearEventoClase({
    nombre: usuario?.nombre || "Alumno",
    email: usuario?.email,
    fecha: String(reserva.fecha),
    hora: String(reserva.hora).slice(0, 5),
    tipo: reserva.tipo ?? "normal",
    reservaId: reserva.id,
  });
  if (!evento) return errores.interno("No se pudo crear el evento en Google Calendar.");

  const { error: errUpd } = await supabase
    .from("reservas")
    .update({ meet_link: evento.link, google_event_id: evento.id })
    .eq("id", reserva.id);
  if (errUpd) console.error("[crear-meet] Evento creado pero no guardado en la reserva:", errUpd.message);

  return json({ success: true, meetLink: evento.link });
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    // Identidad: interna, admin o alumno
    const interna = esLlamadaInterna(req);
    let userId: string | null = null;
    let admin = false;
    if (!interna) {
      const user = await usuarioDesdePeticion(req);
      if (!user) return errores.sinSesion();
      userId = user.id;
      admin = await esAdmin(user.id);
    }
    const privilegiado = interna || admin;

    const body = await leerJson(req);
    if (!body) return errores.entrada("JSON no válido.");

    // Acciones de cursos: solo interna o admin
    if (body.action === "add_attendee" || body.action === "delete" || body.esCurso) {
      if (!privilegiado) return errores.prohibido();

      if (body.action === "add_attendee") {
        const eventId = typeof body.eventId === "string" ? body.eventId : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        if (!eventId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errores.entrada("Falta eventId o email.");
        const token = await tokenGoogle();
        if (!token) return errores.interno("No se pudo conectar con Google Calendar.");
        await anadirAsistente(token, eventId, email);
        return json({ success: true });
      }

      if (body.action === "delete") {
        const eventId = typeof body.eventId === "string" ? body.eventId : "";
        if (!eventId) return errores.entrada("Falta eventId.");
        const token = await tokenGoogle();
        if (!token) return errores.interno("No se pudo conectar con Google Calendar.");
        await borrarEvento(token, eventId);
        return json({ success: true });
      }

      return await crearEventoCurso(body);
    }

    // Reserva individual
    if (body.reservaId !== undefined) {
      if (!esUuid(body.reservaId)) return errores.entrada("reservaId no válido.");
      return await crearEventoReserva(body.reservaId, privilegiado ? null : userId);
    }

    return errores.entrada("Faltan parámetros o acción no reconocida.");
  } catch (e) {
    console.error("[crear-meet] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno("Error con Google Calendar.");
  }
});
