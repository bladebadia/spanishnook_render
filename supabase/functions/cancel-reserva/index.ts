/**
 * cancel-reserva — Cancela clases individuales confirmadas.
 *
 * Requiere sesión. El alumno solo cancela sus propias reservas; el admin, cualquiera.
 * Política: hasta 24 h antes de la clase, medidas en hora de Madrid (también para el admin).
 * Por cada reserva cancelada: borra la fila, devuelve 1 crédito (devolver_credito),
 * borra el evento de Google y, al final, correo al alumno y aviso a Paula.
 *
 * Petición: POST { reservaId?: string, reservaIds?: string[], idioma?: 'es'|'en', zonaHoraria?: string }
 * Respuesta: { success, canceladas, fallidas, creditos, detalleFallidas: [{ id, motivo }] }
 */
import { clienteAdmin, errores, esAdmin, esUuid, json, leerJson, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { borrarEvento, tokenGoogle } from "../_shared/google.ts";
import { CORREO_INTERNO, enviarCorreo } from "../_shared/resend.ts";
import { escapar, nota, parrafo, plantillaCorreo, subtitulo, tablaDatos } from "../_shared/plantilla-correo.ts";
import { filasClase, resolverIdioma, saludo, tipoClase, URL_AREA, type Idioma } from "../_shared/correo-comun.ts";
import { formatFechaCalendario, horasHasta, normalizarZona } from "../_shared/fechas.ts";

const HORAS_MINIMAS = 24;
const MAX_RESERVAS = 50;

interface Reserva {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  tipo: string | null;
  estado: string;
  precio: number | null;
  stripe_payment_intent: string | null;
  meet_link: string | null;
  google_event_id: string | null;
  created_at: string | null;
}

function correoCancelacion(nombre: string | null, reservas: Reserva[], idioma: Idioma, zona: string) {
  const en = idioma === "en";
  const n = reservas.length;
  const bloques = reservas
    .map((r, i) =>
      (n > 1 ? subtitulo(`${en ? "Class" : "Clase"} ${i + 1}`) : "") +
      tablaDatos(filasClase({ fecha: r.fecha, hora: r.hora.slice(0, 5), tipo: r.tipo }, idioma, zona))
    )
    .join("");
  return {
    asunto: en ? "Class cancelled" : "Clase cancelada",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "Cancellation confirmed" : "Cancelación confirmada",
      resumen: en ? `You have cancelled ${n} class(es) and recovered ${n} credit(s).` : `Has cancelado ${n} clase(s) y recuperado ${n} crédito(s).`,
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en ? "You have cancelled the following classes:" : "Has cancelado estas clases:") +
        bloques +
        nota(en
          ? `<strong>+${n} credit(s)</strong> have been added back to your balance. You can use them to book another class whenever you like.`
          : `Te hemos devuelto <strong>${n} crédito(s)</strong> a tu saldo. Puedes usarlos para reservar otra clase cuando quieras.`),
      boton: { texto: en ? "Book another class" : "Reservar otra clase", url: URL_AREA },
    }),
  };
}

function avisoInterno(nombre: string, email: string, reservas: Reserva[], porAdmin: boolean): string {
  const filas: Array<[string, string]> = [
    ["Alumno", `${escapar(nombre)} (${escapar(email)})`],
    ...reservas.map((r): [string, string] => [
      escapar(tipoClase(r.tipo, "es")),
      `${escapar(formatFechaCalendario(r.fecha))} · ${escapar(r.hora.slice(0, 5))} (Madrid)`,
    ]),
  ];
  return plantillaCorreo({
    idioma: "es",
    titulo: porAdmin ? "Clase cancelada desde el panel" : "Clase cancelada por el alumno",
    resumen: `${nombre} ha recuperado ${reservas.length} crédito(s).`,
    cuerpo: tablaDatos(filas) + parrafo(`Se han devuelto ${reservas.length} crédito(s) y se han borrado los eventos de Google Calendar.`),
  });
}

/** Cancela una reserva: la reclama borrándola (evita dobles devoluciones), devuelve el crédito y borra el evento. */
async function cancelarUna(r: Reserva, tokenG: string | null): Promise<string | null> {
  const supabase = clienteAdmin();

  // 1. Borrado condicionado: si dos peticiones llegan a la vez, solo una borra la fila
  const { data: borradas, error: errDel } = await supabase
    .from("reservas")
    .delete()
    .eq("id", r.id)
    .eq("estado", "confirmada")
    .select("id");
  if (errDel) return "Error técnico";
  if (!borradas || borradas.length === 0) return "Ya estaba cancelada";

  // 2. Devolver el crédito; si falla, se restaura la reserva
  const { error: errRpc } = await supabase.rpc("devolver_credito", { user_uuid: r.user_id, tipo_clase: r.tipo ?? "normal" });
  if (errRpc) {
    console.error(`[cancel-reserva] devolver_credito falló para ${r.id}: ${errRpc.message}`);
    const { error: errRest } = await supabase.from("reservas").insert({
      id: r.id, user_id: r.user_id, fecha: r.fecha, hora: r.hora, tipo: r.tipo, estado: "confirmada",
      precio: r.precio, stripe_payment_intent: r.stripe_payment_intent, meet_link: r.meet_link,
      google_event_id: r.google_event_id, created_at: r.created_at,
    });
    if (errRest) console.error(`[cancel-reserva] CRÍTICO: reserva ${r.id} borrada sin crédito devuelto: ${errRest.message}`);
    return "Error técnico";
  }

  // 3. Evento de Google (no bloquea)
  if (r.google_event_id && tokenG) {
    try {
      await borrarEvento(tokenG, r.google_event_id);
    } catch (e) {
      console.error(`[cancel-reserva] No se pudo borrar el evento de ${r.id}:`, e instanceof Error ? e.message : String(e));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();
    const admin = await esAdmin(user.id);

    const body = await leerJson(req);
    if (!body) return errores.entrada("JSON no válido.");
    const crudos = Array.isArray(body.reservaIds) ? body.reservaIds : body.reservaId !== undefined ? [body.reservaId] : [];
    const ids = [...new Set(crudos.filter(esUuid))].slice(0, MAX_RESERVAS);
    if (ids.length === 0) return errores.entrada("No se han indicado reservas.");

    const supabase = clienteAdmin();
    let consulta = supabase
      .from("reservas")
      .select("id, user_id, fecha, hora, tipo, estado, precio, stripe_payment_intent, meet_link, google_event_id, created_at")
      .in("id", ids)
      .eq("estado", "confirmada");
    if (!admin) consulta = consulta.eq("user_id", user.id);
    const { data, error } = await consulta;
    if (error) throw error;
    const reservas = (data ?? []) as Reserva[];
    if (reservas.length === 0) return errores.noEncontrado("Reservas no encontradas.");

    const tokenG = reservas.some((r) => r.google_event_id) ? await tokenGoogle() : null;
    const canceladas: Reserva[] = [];
    const detalleFallidas: Array<{ id: string; motivo: string }> = [];

    for (const r of reservas) {
      const horas = horasHasta(r.fecha, r.hora);
      if (horas === null || horas < HORAS_MINIMAS) {
        detalleFallidas.push({ id: r.id, motivo: `Menos de ${HORAS_MINIMAS} h` });
        continue;
      }
      const fallo = await cancelarUna(r, tokenG);
      if (fallo) detalleFallidas.push({ id: r.id, motivo: fallo });
      else canceladas.push(r);
    }

    // Correos agrupados por alumno (el admin puede cancelar clases de varios alumnos)
    const porAlumno = new Map<string, Reserva[]>();
    for (const r of canceladas) porAlumno.set(r.user_id, [...(porAlumno.get(r.user_id) ?? []), r]);

    for (const [alumnoId, lista] of porAlumno) {
      const { data: auth } = await supabase.auth.admin.getUserById(alumnoId);
      const email = auth?.user?.email;
      if (!email) continue;
      const { data: perfil } = await supabase
        .from("datos_usuarios")
        .select("nombre, idioma_nativo")
        .eq("user_id", alumnoId)
        .maybeSingle();

      // Idioma y zona de la web solo valen si el que cancela es el propio alumno
      const esElAlumno = alumnoId === user.id;
      const idioma = resolverIdioma(esElAlumno ? body.idioma : null, perfil?.idioma_nativo);
      const zona = normalizarZona(esElAlumno ? body.zonaHoraria : null);
      const correo = correoCancelacion(perfil?.nombre ?? null, lista, idioma, zona);

      await enviarCorreo({ to: email, subject: correo.asunto, html: correo.html });
      await enviarCorreo({
        to: CORREO_INTERNO,
        subject: "Clase cancelada",
        html: avisoInterno(perfil?.nombre || "Alumno", email, lista, !esElAlumno),
      });
    }

    return json({
      success: true,
      canceladas: canceladas.length,
      fallidas: detalleFallidas.length,
      creditos: canceladas.length,
      detalleFallidas,
    });
  } catch (e) {
    console.error("[cancel-reserva] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
