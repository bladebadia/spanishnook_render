import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

const TIMEZONE = "Europe/Madrid";

// 🔄 TOKEN
async function getGoogleAccessToken() {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) throw new Error("Faltan credenciales OAuth2");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Error obteniendo token");
  return data.access_token;
}

// 🗓️ CREAR EVENTO
async function crearEventoGoogle(token: string, calendarId: string, eventData: any) {
    // Añadimos sendUpdates=all para que Google mande emails si es necesario
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=none`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );
    const data = await res.json();
    if (!res.ok) {
        console.error("Google API Error:", data);
        throw new Error(`Google API Error: ${data.error?.message || 'Unknown'}`);
    }
    return { link: data.conferenceData?.entryPoints?.[0]?.uri, id: data.id };
}

// ➕ AÑADIR ASISTENTE (ESTA ES LA FUNCIÓN QUE FALTABA)
async function anadirAsistente(token: string, calendarId: string, eventId: string, email: string) {
    // 1. Obtener evento actual para no borrar a los otros asistentes
    const getRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        { headers: { "Authorization": `Bearer ${token}` } }
    );

    if (!getRes.ok) {
        // Si el evento ya no existe (404), lanzamos error específico
        if (getRes.status === 404) throw new Error("Event not found (404)");
        const err = await getRes.json();
        throw new Error(`Error recuperando evento: ${err.error?.message}`);
    }

    const event = await getRes.json();

    // 2. Añadir nuevo email a la lista existente
    const attendees = event.attendees || [];

    // Evitar duplicados (si ya está, no hacemos nada)
    if (!attendees.some((a: any) => a.email === email)) {
        attendees.push({ email: email });

        // 3. Actualizar evento (PATCH)
        const patchRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?sendUpdates=all`,
            {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ attendees }),
            }
        );
        const patchData = await patchRes.json();
        if (!patchRes.ok) throw new Error(`Error actualizando asistentes: ${patchData.error?.message}`);
    }

    return true;
}

// 🗑️ BORRAR EVENTO
async function borrarEventoGoogle(token: string, calendarId: string, eventId: string) {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?sendUpdates=all`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      }
    );
    if (!res.ok && res.status !== 404 && res.status !== 410) {
        const text = await res.text();
        throw new Error(`Error borrando evento: ${text}`);
    }
    return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
    if (!calendarId) throw new Error("Falta GOOGLE_CALENDAR_ID");

    const accessToken = await getGoogleAccessToken();

    // ============================================================
    // CASO NUEVO: AÑADIR ASISTENTE (INVITACIÓN)
    // ============================================================
    if (body.action === 'add_attendee') {
        const { eventId, email } = body;
        if (!eventId || !email) throw new Error("Falta eventId o email");

        console.log(`📧 Procesando invitación para ${email} en evento ${eventId}`);
        await anadirAsistente(accessToken, calendarId, eventId, email);

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // ============================================================
    // CASO X: BORRAR EVENTO
    // ============================================================
    if (body.action === 'delete') {
        if (!body.eventId) throw new Error("Falta eventId para borrar");

        console.log(`🗑️ Solicitud de borrado para evento: ${body.eventId}`);
        await borrarEventoGoogle(accessToken, calendarId, body.eventId);

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // ============================================================
    // CASO A: CURSO RECURRENTE (ADMIN)
    // ============================================================
    if (body.esCurso) {
        const { fecha, hora, nombreCurso, duracionMinutos, diasSemana, fechaFin } = body;
        const duracion = duracionMinutos || 90;

        const horaLimpia = hora.substring(0, 5);
        const [h, m] = horaLimpia.split(':').map(Number);

        const totalMin = h * 60 + m + duracion;
        const endH = Math.floor(totalMin / 60);
        const endM = totalMin % 60;
        const endHoraStr = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;

        const startDateTime = `${fecha}T${horaLimpia}:00`;
        const endDateTime = `${fecha}T${endHoraStr}:00`;

        let recurrenceRule = "RRULE:FREQ=WEEKLY";

        if (diasSemana && Array.isArray(diasSemana) && diasSemana.length > 0) {
            const diasMap: any = { "Lunes": "MO", "Martes": "TU", "Miércoles": "WE", "Miercoles": "WE", "Jueves": "TH", "Viernes": "FR", "Sábado": "SA", "Domingo": "SU" };
            const diasGoogle = diasSemana
                .map(d => diasMap[d] || diasMap[d.charAt(0).toUpperCase() + d.slice(1)])
                .filter(d => d)
                .join(",");
            if (diasGoogle) recurrenceRule += `;BYDAY=${diasGoogle}`;
        }

        if (fechaFin && fechaFin.length > 5) {
            const fechaFinLimpia = fechaFin.replace(/-/g, '');
            recurrenceRule += `;UNTIL=${fechaFinLimpia}T235959Z`;
        }

        console.log(`📚 Creando curso recurrente: ${recurrenceRule}`);

        const event = {
            summary: `CURSO: ${nombreCurso}`,
            description: `Clase Grupal - Spanish Nook`,
            start: { dateTime: startDateTime, timeZone: TIMEZONE },
            end: { dateTime: endDateTime, timeZone: TIMEZONE },
            recurrence: [recurrenceRule],
            conferenceData: { createRequest: { requestId: Math.random().toString(36).substring(7), conferenceSolutionKey: { type: "hangoutsMeet" } } },
        };

        const result = await crearEventoGoogle(accessToken, calendarId, event);

        return new Response(JSON.stringify({
            ok: true,
            meetLink: result.link,
            googleEventId: result.id
        }), { status: 200, headers: corsHeaders });
    }

    // ============================================================
    // CASO B: INDIVIDUAL (RESERVA)
    // ============================================================
    if (body.reservaId) {
        const { reservaId } = body;
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: reserva, error: errRes } = await supabase.from("reservas").select("*").eq("id", reservaId).single();
        if (errRes || !reserva) throw new Error("Reserva no encontrada");

        const { data: usuario } = await supabase.from("datos_usuarios").select("email, nombre").eq("user_id", reserva.user_id).single();
        const emailCliente = usuario?.email || "alumno@sin-email.com";
        const nombreCliente = usuario?.nombre || "Alumno";

        const horaLimpia = reserva.hora.toString().substring(0, 5);
        const [h, m] = horaLimpia.split(':').map(Number);
        const finH = h + 1;
        const finHoraStr = `${String(finH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

        const startDateTime = `${reserva.fecha}T${horaLimpia}:00`;
        const endDateTime = `${reserva.fecha}T${finHoraStr}:00`;

        const event = {
            summary: `Spanish Class (${reserva.tipo}) - ${nombreCliente}`,
            description: `Clase individual.\nID: ${reservaId}`,
            start: { dateTime: startDateTime, timeZone: TIMEZONE },
            end: { dateTime: endDateTime, timeZone: TIMEZONE },
            conferenceData: { createRequest: { requestId: Math.random().toString(36).substring(7), conferenceSolutionKey: { type: "hangoutsMeet" } } },
            attendees: emailCliente.includes("@") ? [{ email: emailCliente }] : [],
        };

        const result = await crearEventoGoogle(accessToken, calendarId, event);

        await supabase.from("reservas").update({ meet_link: result.link, google_event_id: result.id }).eq("id", reservaId);
        return new Response(JSON.stringify({ success: true, meetLink: result.link }), { status: 200, headers: corsHeaders });
    }

    throw new Error("Faltan parámetros o acción no reconocida");

  } catch (err: any) {
    console.error("🔥 Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});