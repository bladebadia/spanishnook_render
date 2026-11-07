/**
 * send-booking-email — Confirmación de reservas pagadas con créditos.
 *
 * Requiere sesión. Los datos de las clases se leen SIEMPRE de la BD (reservas del propio
 * usuario, confirmadas); nunca se usa lo que mande la web. El correo va solo al email
 * del usuario de la sesión, más un aviso interno a Paula.
 *
 * Petición: POST { reservaIds: string[], idioma?: 'es'|'en', zonaHoraria?: string }
 * Formato antiguo aceptado: { reservas, userId } → se usan las reservas confirmadas del
 * usuario creadas en los últimos 15 minutos (se ignora el contenido enviado).
 * Respuesta: { success: true, enviadas: number }
 */
import { clienteAdmin, errores, esUuid, json, leerJson, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { enviarCorreo, CORREO_INTERNO } from "../_shared/resend.ts";
import { escapar, nota, parrafo, plantillaCorreo, subtitulo, tablaDatos } from "../_shared/plantilla-correo.ts";
import { filasClase, resolverIdioma, saludo, tipoClase, URL_AREA, type Idioma } from "../_shared/correo-comun.ts";
import { formatFechaCalendario, normalizarZona } from "../_shared/fechas.ts";

const MAX_RESERVAS = 20;
const VENTANA_LEGADO_MIN = 15;

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  tipo: string | null;
  meet_link: string | null;
}

function correoAlumno(nombre: string | null, reservas: Reserva[], idioma: Idioma, zona: string) {
  const en = idioma === "en";
  const n = reservas.length;
  const bloques = reservas
    .map((r, i) =>
      (n > 1 ? subtitulo(`${en ? "Class" : "Clase"} ${i + 1}`) : "") +
      tablaDatos(filasClase({ fecha: r.fecha, hora: r.hora.slice(0, 5), tipo: r.tipo, meetLink: r.meet_link }, idioma, zona))
    )
    .join("");
  return {
    asunto: en ? "Your booking is confirmed" : "Tu reserva está confirmada",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "Booking confirmed" : "Reserva confirmada",
      resumen: en ? `You have used ${n} credit(s). Here are your classes.` : `Has canjeado ${n} crédito(s). Aquí tienes tus clases.`,
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en
          ? `You have used <strong>${n}</strong> credit(s). These are your classes:`
          : `Has canjeado <strong>${n}</strong> crédito(s). Estas son tus clases:`) +
        bloques +
        nota(en
          ? "You can cancel up to 24 hours before the class (Madrid time) and get your credit back."
          : "Puedes cancelar hasta 24 horas antes de la clase (hora de Madrid) y recuperar el crédito."),
      boton: { texto: en ? "See my bookings" : "Ver mis reservas", url: URL_AREA },
    }),
  };
}

function avisoInterno(nombre: string, email: string, reservas: Reserva[]): string {
  const filas: Array<[string, string]> = [
    ["Alumno", `${escapar(nombre)} (${escapar(email)})`],
    ...reservas.map((r): [string, string] => [
      escapar(tipoClase(r.tipo, "es")),
      `${escapar(formatFechaCalendario(r.fecha))} · ${escapar(r.hora.slice(0, 5))} (Madrid)`,
    ]),
  ];
  return plantillaCorreo({
    idioma: "es",
    titulo: "Nueva reserva con créditos",
    resumen: `${nombre} ha reservado ${reservas.length} clase(s) con créditos.`,
    cuerpo: parrafo("Un alumno ha reservado usando sus créditos:") + tablaDatos(filas) + parrafo("Revisa tu Google Calendar."),
  });
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();
    if (!user.email) return errores.entrada("Tu cuenta no tiene email.");

    const body = await leerJson(req);
    if (!body) return errores.entrada("JSON no válido.");

    const supabase = clienteAdmin();
    let consulta = supabase
      .from("reservas")
      .select("id, fecha, hora, tipo, meet_link")
      .eq("user_id", user.id)
      .eq("estado", "confirmada")
      .is("stripe_payment_intent", null); // solo reservas pagadas con créditos

    if (Array.isArray(body.reservaIds)) {
      const ids = [...new Set(body.reservaIds.filter(esUuid))].slice(0, MAX_RESERVAS);
      if (ids.length === 0) return errores.entrada("reservaIds no válido.");
      consulta = consulta.in("id", ids);
    } else if (Array.isArray(body.reservas)) {
      // Formato antiguo: no se confía en el contenido, solo se buscan sus reservas recientes
      const desde = new Date(Date.now() - VENTANA_LEGADO_MIN * 60_000).toISOString();
      consulta = consulta.gte("created_at", desde).limit(MAX_RESERVAS);
    } else {
      return errores.entrada("Falta reservaIds.");
    }

    const { data, error } = await consulta.order("fecha").order("hora");
    if (error) throw error;
    const reservas = (data ?? []) as Reserva[];
    if (reservas.length === 0) return errores.noEncontrado("No hay reservas que confirmar.");

    const { data: perfil } = await supabase
      .from("datos_usuarios")
      .select("nombre, idioma_nativo")
      .eq("user_id", user.id)
      .maybeSingle();

    const idioma = resolverIdioma(body.idioma, perfil?.idioma_nativo);
    const zona = normalizarZona(body.zonaHoraria);
    const nombre = perfil?.nombre || "";

    const correo = correoAlumno(nombre, reservas, idioma, zona);
    const ok = await enviarCorreo({ to: user.email, subject: correo.asunto, html: correo.html });

    await enviarCorreo({
      to: CORREO_INTERNO,
      subject: "Nueva reserva (créditos)",
      html: avisoInterno(nombre || "Alumno", user.email, reservas),
    });

    if (!ok) return errores.interno("No se pudo enviar el correo.");
    return json({ success: true, enviadas: reservas.length });
  } catch (e) {
    console.error("[send-booking-email] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
