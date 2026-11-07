/**
 * stripe-webhook — Pagos únicos con Stripe. Doble uso:
 *
 * A) Con cabecera stripe-signature: webhook (STRIPE_WEBHOOK_SECRET).
 *    checkout.session.completed:
 *      - metadata.tipo_compra = 'bono_creditos'  → suma créditos (procesar_bono_seguro) + correos.
 *      - metadata.tipo = 'curso_cerrado'         → inscripción en un curso de fechas cerradas.
 *      - metadata.tipo = 'material_didactico'    → desbloquea el material (compras_materiales).
 *      - metadata.reservas                        → clases individuales pagadas con tarjeta.
 *    charge.refunded (reembolso total) → reservas 'cancelada' / inscripción 'reembolsada'.
 *
 * B) Sin firma, desde la web (requiere sesión): crea la Checkout Session de clases individuales.
 *    Petición: { reservas: [{ fecha: 'YYYY-MM-DD', hora: 'HH:mm', tipo: 'normal'|'conversacion' }], idioma?, zonaHoraria? }
 *    Cada franja se valida antes con franja_reservable(); si alguna no vale → 409 { error, franjasNoValidas }.
 *    Respuesta: { url }
 */
import { clienteAdmin, errores, json, leerJson, origenSeguro, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { caducidadCheckout, clienteStripe, eventoVerificado, idDe, type Stripe } from "../_shared/stripe.ts";
import { crearEventoClase, anadirAsistente, tokenGoogle } from "../_shared/google.ts";
import { CORREO_INTERNO, enviarCorreo } from "../_shared/resend.ts";
import { escapar, nota, parrafo, plantillaCorreo, subtitulo, tablaDatos } from "../_shared/plantilla-correo.ts";
import {
  enlaceSeguro,
  filasClase,
  formatoEuros,
  idiomaDesde,
  localeDe,
  primeraHora,
  resolverIdioma,
  saludo,
  textoDias,
  tipoClase,
  URL_AREA,
  URL_RESERVAR,
  URL_CURSOS,
  type Idioma,
} from "../_shared/correo-comun.ts";
import {
  esFechaISO,
  fechaCorta,
  formatFechaCalendario,
  hoyMadridISO,
  normalizarHora,
  normalizarZona,
  rangoHoraEnZona,
  rangoHoraMadrid,
  ZONA_ESCUELA,
} from "../_shared/fechas.ts";

// Precios fijados en el servidor (céntimos)
const PRECIOS: Record<string, number> = { normal: 3200, conversacion: 2700 };
const MAX_CLASES_POR_PAGO = 8; // lo que cabe en los 500 caracteres de metadata.reservas
const LIMITE_METADATA = 500; // Stripe: máximo de caracteres por valor de metadata

interface Franja {
  fecha: string;
  hora: string; // 'HH:mm'
  tipo: "normal" | "conversacion";
}

const ok = (extra: Record<string, unknown> = {}) => json({ received: true, ...extra });

async function datosAlumno(userId: string) {
  const { data } = await clienteAdmin()
    .from("datos_usuarios")
    .select("nombre, email, idioma_nativo")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/** Valida y normaliza la lista de franjas que llega de la web o de la metadata. */
function leerFranjas(valor: unknown): Franja[] | null {
  if (!Array.isArray(valor)) return null;
  const franjas: Franja[] = [];
  for (const r of valor) {
    const hora = normalizarHora(r?.hora);
    const tipo = r?.tipo === "conversacion" ? "conversacion" : r?.tipo === "normal" ? "normal" : null;
    if (!esFechaISO(r?.fecha) || !hora || !tipo) return null;
    franjas.push({ fecha: r.fecha, hora, tipo });
  }
  return franjas;
}

// =====================================================================
// A.1 Bono de créditos
// =====================================================================

async function procesarBono(session: Stripe.Checkout.Session): Promise<Response> {
  const meta = session.metadata ?? {};
  const userId = meta.user_id;
  const creditos = parseInt(meta.creditos_a_sumar || "0", 10);
  const tipo = meta.tipo_credito === "conversacion" ? "conversacion" : "normal";
  if (!userId || !(creditos > 0)) {
    console.error(`[stripe-webhook] Bono sin datos válidos en la sesión ${session.id}`);
    return ok({ ignored: true });
  }

  // Escudo atómico en BD: solo suma si la sesión no se había procesado
  const { data: nuevo, error } = await clienteAdmin().rpc("procesar_bono_seguro", {
    p_user_id: userId,
    p_session_id: session.id,
    p_cantidad: creditos,
    p_tipo: tipo,
  });
  if (error) {
    console.error("[stripe-webhook] Error en procesar_bono_seguro:", error.message);
    return json({ error: "DB Error" }, 500); // Stripe reintentará
  }
  if (nuevo === false) return ok({ ignored: true });

  const alumno = await datosAlumno(userId);
  const email = alumno?.email || session.customer_details?.email;
  const idioma = resolverIdioma(meta.idioma, alumno?.idioma_nativo);
  const en = idioma === "en";
  const tipoTxt = tipo === "conversacion"
    ? (en ? "conversation classes" : "clases de conversación")
    : (en ? "general classes" : "clases generales");

  if (email) {
    await enviarCorreo({
      to: email,
      subject: en ? "Your credits are ready" : "Ya tienes tus créditos",
      html: plantillaCorreo({
        idioma,
        titulo: en ? "Your credits are ready" : "Ya tienes tus créditos",
        resumen: en ? `${creditos} credits added to your balance.` : `${creditos} créditos añadidos a tu saldo.`,
        cuerpo:
          parrafo(saludo(alumno?.nombre, idioma)) +
          parrafo(en
            ? `You have bought <strong>${creditos}</strong> credits for ${escapar(tipoTxt)}. You can use them whenever you like.`
            : `Has comprado <strong>${creditos}</strong> créditos para ${escapar(tipoTxt)}. Puedes usarlos cuando quieras.`) +
          nota(en ? "Choose a date in the calendar and pay with your credits in the cart." : "Elige fecha en el calendario y paga con tus créditos en el carrito."),
        boton: { texto: en ? "Book a class" : "Reservar una clase", url: URL_RESERVAR },
      }),
    });
  }
  await enviarCorreo({
    to: CORREO_INTERNO,
    subject: "Compra de pack de créditos",
    html: plantillaCorreo({
      idioma: "es",
      titulo: "Compra de pack de créditos",
      cuerpo: tablaDatos([
        ["Alumno", `${escapar(alumno?.nombre || "Alumno")} (${escapar(email ?? "")})`],
        ["Pack", `${creditos} créditos · ${escapar(tipoClase(tipo, "es"))}`],
        ["Importe", escapar(formatoEuros(session.amount_total, "es"))],
      ]),
    }),
  });
  return ok({ processed: "bono" });
}

// =====================================================================
// A.2 Material didáctico
// =====================================================================

async function procesarMaterial(session: Stripe.Checkout.Session): Promise<Response> {
  const userId = session.metadata?.user_id;
  const materialId = parseInt(session.metadata?.material_id ?? "", 10);
  if (!userId || !materialId) {
    console.error(`[stripe-webhook] Material sin datos en la sesión ${session.id}`);
    return json({ error: "Faltan datos" }, 400);
  }
  const { error } = await clienteAdmin().from("compras_materiales").insert({ user_id: userId, material_id: materialId });
  if (error) {
    if (error.code === "23505") return ok({ ignored: true });
    console.error("[stripe-webhook] Error guardando compra de material:", error.message);
    return json({ error: "DB Error" }, 500);
  }
  return ok({ processed: "material" });
}

// =====================================================================
// A.3 Clases individuales pagadas con tarjeta
// =====================================================================

interface Resultado {
  franja: Franja;
  importe: number;
}

/** Inserta una reserva. Devuelve la fila, 'ya' si este mismo pago ya la tenía, o null si la franja está ocupada. */
async function insertarReserva(f: Franja, userId: string, pi: string, importe: number) {
  const supabase = clienteAdmin();
  const hora = `${f.hora}:00`;

  // La franja concreta (fecha Y hora) ya está confirmada por otro pago
  const { data: ocupada } = await supabase
    .from("reservas")
    .select("id, stripe_payment_intent")
    .eq("fecha", f.fecha)
    .eq("hora", hora)
    .eq("estado", "confirmada")
    .maybeSingle();
  if (ocupada) return ocupada.stripe_payment_intent === pi ? "ya" : null;

  // UNIQUE(fecha, hora) incluye filas canceladas: se libera la franja antes de insertar
  await supabase.from("reservas").delete().eq("fecha", f.fecha).eq("hora", hora).eq("estado", "cancelada");

  const ahora = new Date().toISOString();
  const { data, error } = await supabase
    .from("reservas")
    .insert({
      fecha: f.fecha, hora, estado: "confirmada", user_id: userId, stripe_payment_intent: pi,
      precio: importe, tipo: f.tipo, created_at: ahora, updated_at: ahora,
    })
    .select("id, fecha, hora, tipo")
    .single();
  if (!error) return data;

  if (error.code === "23505") {
    // Otra entrega del mismo evento pudo insertarla a la vez
    const { data: fila } = await supabase.from("reservas").select("stripe_payment_intent").eq("fecha", f.fecha).eq("hora", hora).maybeSingle();
    return fila?.stripe_payment_intent === pi ? "ya" : null;
  }
  console.error(`[stripe-webhook] Error insertando reserva ${f.fecha} ${f.hora}: ${error.message}`);
  return null;
}

async function procesarClases(session: Stripe.Checkout.Session): Promise<Response> {
  const supabase = clienteAdmin();
  const stripe = clienteStripe();
  const meta = session.metadata ?? {};
  const pi = idDe(session.payment_intent);
  const userId = meta.user_id;
  let franjas: Franja[] | null = null;
  try {
    franjas = leerFranjas(JSON.parse(meta.reservas ?? "[]"));
  } catch { /* metadata corrupta */ }

  if (!pi || !userId || !franjas || franjas.length === 0) {
    console.error(`[stripe-webhook] Sesión de clases sin datos válidos: ${session.id}`);
    await enviarCorreo({
      to: CORREO_INTERNO,
      subject: "Revisar pago de clases sin datos",
      html: plantillaCorreo({ idioma: "es", titulo: "Pago de clases sin datos válidos", cuerpo: parrafo(`Sesión de Stripe: ${escapar(session.id)}. Revisa el pago en Stripe.`) }),
    });
    return ok({ ignored: true });
  }

  // Idempotencia: si este pago ya creó reservas o ya se reembolsó desde aquí, no se repite
  const { data: previas } = await supabase.from("reservas").select("id").eq("stripe_payment_intent", pi).limit(1);
  if (previas && previas.length > 0) return ok({ ignored: true });
  const reembolsos = await stripe.refunds.list({ payment_intent: pi, limit: 10 });
  if (reembolsos.data.some((r: { metadata?: Record<string, string> }) => r.metadata?.origen === "stripe-webhook")) return ok({ ignored: true });

  // Importe real de cada línea (mismo orden que las franjas)
  let lineas: Array<{ amount_total: number }> = [];
  try {
    const expandida = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data"] });
    lineas = expandida.line_items?.data ?? [];
  } catch (e) {
    console.error("[stripe-webhook] No se pudieron leer las líneas:", e instanceof Error ? e.message : String(e));
  }

  const alumno = await datosAlumno(userId);
  const nombre = alumno?.nombre || session.customer_details?.name || "Alumno";
  const email = meta.user_email || alumno?.email || session.customer_details?.email || null;
  const idioma = resolverIdioma(meta.idioma, alumno?.idioma_nativo);
  const zona = normalizarZona(meta.zona);

  // Cada franja (fecha + hora) se comprueba e inserta por separado
  const insertadas: Array<{ id: string; franja: Franja; meetLink: string | null }> = [];
  const fallidas: Resultado[] = [];
  for (const [i, f] of franjas.entries()) {
    const importe = lineas[i]?.amount_total ?? PRECIOS[f.tipo];
    const fila = await insertarReserva(f, userId, pi, importe);
    if (fila === "ya") continue;
    if (!fila) {
      fallidas.push({ franja: f, importe });
      continue;
    }
    // Evento de Google + Meet (si falla, la reserva sigue siendo válida)
    const evento = await crearEventoClase({ nombre, email, fecha: f.fecha, hora: f.hora, tipo: f.tipo });
    if (evento) {
      await supabase.from("reservas").update({ meet_link: evento.link, google_event_id: evento.id }).eq("id", fila.id);
    }
    insertadas.push({ id: fila.id, franja: f, meetLink: evento?.link ?? null });
  }

  // Reembolso parcial de las franjas que no se pudieron reservar
  let reembolsoOk = true;
  const totalFallido = fallidas.reduce((s, r) => s + r.importe, 0);
  if (fallidas.length > 0) {
    try {
      await stripe.refunds.create({
        payment_intent: pi,
        ...(insertadas.length > 0 ? { amount: totalFallido } : {}),
        metadata: {
          origen: "stripe-webhook",
          motivo: "franja_no_disponible",
          franjas: fallidas.map((r) => `${r.franja.fecha} ${r.franja.hora}`).join(", ").slice(0, 450),
        },
      });
    } catch (e) {
      reembolsoOk = false;
      console.error(`[stripe-webhook] CRÍTICO: no se pudo reembolsar ${pi}:`, e instanceof Error ? e.message : String(e));
    }
  }

  await correosClases({ nombre, email, idioma, zona, insertadas, fallidas, totalFallido, reembolsoOk, pi });
  return ok({ processed: "clases", insertadas: insertadas.length, fallidas: fallidas.length });
}

async function correosClases(d: {
  nombre: string;
  email: string | null;
  idioma: Idioma;
  zona: string;
  insertadas: Array<{ franja: Franja; meetLink: string | null }>;
  fallidas: Resultado[];
  totalFallido: number;
  reembolsoOk: boolean;
  pi: string;
}): Promise<void> {
  const en = d.idioma === "en";
  const varias = d.insertadas.length > 1;

  // Alumno: confirmación de las que sí se reservaron
  if (d.email && d.insertadas.length > 0) {
    const bloques = d.insertadas
      .map((r, i) =>
        (varias ? subtitulo(`${en ? "Class" : "Clase"} ${i + 1}`) : "") +
        tablaDatos(filasClase({ ...r.franja, meetLink: r.meetLink }, d.idioma, d.zona))
      )
      .join("");
    await enviarCorreo({
      to: d.email,
      subject: en ? "Your class is booked" : "Tu clase está reservada",
      html: plantillaCorreo({
        idioma: d.idioma,
        titulo: en ? "Booking confirmed" : "Reserva confirmada",
        resumen: en ? "Thank you for your purchase. Here are the details of your class." : "Gracias por tu compra. Aquí tienes los datos de tu clase.",
        cuerpo:
          parrafo(saludo(d.nombre, d.idioma)) +
          parrafo(en ? "Thank you for your purchase. Your booking is confirmed:" : "Gracias por tu compra. Tu reserva está confirmada:") +
          bloques +
          nota(en
            ? "You can cancel up to 24 hours before the class (Madrid time) and get a credit back."
            : "Puedes cancelar hasta 24 horas antes de la clase (hora de Madrid) y recuperar un crédito."),
        boton: { texto: en ? "See my bookings" : "Ver mis reservas", url: URL_AREA },
      }),
    });
  }

  // Alumno: aviso de reembolso de las que no se pudieron reservar
  if (d.email && d.fallidas.length > 0) {
    const filas = d.fallidas.map((r): [string, string] => [
      escapar(tipoClase(r.franja.tipo, d.idioma)),
      `${escapar(formatFechaCalendario(r.franja.fecha, localeDe(d.idioma)))} · ${escapar(r.franja.hora)} (Madrid)`,
    ]);
    const importe = escapar(formatoEuros(d.totalFallido, d.idioma));
    await enviarCorreo({
      to: d.email,
      subject: en ? "Refund: time slot no longer available" : "Reembolso: hora ya no disponible",
      html: plantillaCorreo({
        idioma: d.idioma,
        titulo: en ? "Time slot no longer available" : "Esa hora ya no está disponible",
        resumen: en ? "Someone booked the same time just before you. We are refunding you." : "Alguien reservó la misma hora justo antes. Te devolvemos el dinero.",
        cuerpo:
          parrafo(saludo(d.nombre, d.idioma)) +
          parrafo(en ? "Someone booked these times just before you completed the payment:" : "Alguien reservó estas horas justo antes de que completaras el pago:") +
          tablaDatos(filas) +
          nota(d.reembolsoOk
            ? (en ? `We have refunded <strong>${importe}</strong> to your card. It may take 5–10 days to appear.` : `Te hemos devuelto <strong>${importe}</strong> a la tarjeta. Puede tardar de 5 a 10 días en aparecer.`)
            : (en ? `We will refund <strong>${importe}</strong> to your card manually in the next few days.` : `Te devolveremos <strong>${importe}</strong> a la tarjeta manualmente en los próximos días.`)),
        boton: { texto: en ? "Choose another time" : "Elegir otra hora", url: URL_RESERVAR },
      }),
    });
  }

  // Paula
  const filasPaula: Array<[string, string]> = [
    ["Alumno", `${escapar(d.nombre)} (${escapar(d.email ?? "sin email")})`],
    ...d.insertadas.map((r): [string, string] => [
      escapar(tipoClase(r.franja.tipo, "es")),
      `${escapar(formatFechaCalendario(r.franja.fecha))} · ${escapar(r.franja.hora)}`,
    ]),
    ...d.fallidas.map((r): [string, string] => [
      "No reservada",
      `${escapar(formatFechaCalendario(r.franja.fecha))} · ${escapar(r.franja.hora)} · ${escapar(formatoEuros(r.importe, "es"))}`,
    ]),
  ];
  const problema = d.fallidas.length > 0;
  await enviarCorreo({
    to: CORREO_INTERNO,
    subject: problema ? (d.reembolsoOk ? "Reserva con reembolso parcial" : "URGENTE: reembolso manual necesario") : "Nueva reserva (pago con tarjeta)",
    html: plantillaCorreo({
      idioma: "es",
      titulo: problema ? "Reserva con franjas no disponibles" : "Nueva reserva (pago con tarjeta)",
      cuerpo:
        tablaDatos(filasPaula) +
        (problema
          ? nota(d.reembolsoOk
            ? `Se han reembolsado automáticamente ${escapar(formatoEuros(d.totalFallido, "es"))}.`
            : `<strong>El reembolso automático ha fallado.</strong> Reembolsa ${escapar(formatoEuros(d.totalFallido, "es"))} a mano en Stripe (pago ${escapar(d.pi)}).`)
          : parrafo("Revisa tu Google Calendar.")),
    }),
  });
}

// =====================================================================
// A.4 Curso de fechas cerradas (pago único)
// =====================================================================

async function procesarCursoCerrado(session: Stripe.Checkout.Session): Promise<Response> {
  const supabase = clienteAdmin();
  const meta = session.metadata ?? {};
  const cursoId = parseInt(meta.curso_id ?? "", 10);
  const userId = meta.user_id;
  const pi = idDe(session.payment_intent);
  const importe = session.amount_total ?? 0;
  if (!cursoId || !userId) {
    console.error(`[stripe-webhook] curso_cerrado sin datos en la sesión ${session.id}`);
    return ok({ ignored: true });
  }

  // 1. Inscripción idempotente (una por sesión de Stripe)
  const { data: nuevas, error: errIns } = await supabase
    .from("inscripciones_curso")
    .upsert({
      curso_id: cursoId, user_id: userId, stripe_session_id: session.id,
      stripe_payment_intent: pi, importe_centimos: importe, estado: "pagada",
    }, { onConflict: "stripe_session_id", ignoreDuplicates: true })
    .select("curso_id");
  if (errIns) {
    console.error("[stripe-webhook] Error guardando inscripción:", errIns.message);
    return json({ error: "DB Error" }, 500); // Stripe reintentará
  }
  if (!nuevas || nuevas.length === 0) return ok({ ignored: true });

  // 2. ¿Sigue habiendo plaza y el curso está activo?
  const { data: curso } = await supabase
    .from("cursos_grupales")
    .select("id, nombre_curso, estado_curso, tipo_curso, max_estudiantes, usuarios, fecha_inicio, fecha_fin, dias_semana, horarios_curso, meet_link, google_event_id, duracion_minutos")
    .eq("id", cursoId)
    .maybeSingle();
  const { count } = await supabase
    .from("inscripciones_curso")
    .select("curso_id", { count: "exact", head: true })
    .eq("curso_id", cursoId)
    .eq("estado", "pagada");

  const alumno = await datosAlumno(userId);
  const email = alumno?.email || session.customer_details?.email || null;
  const idioma = resolverIdioma(meta.idioma, alumno?.idioma_nativo);

  let motivo: string | null = null;
  if (!curso) motivo = "el curso no existe";
  else if (curso.estado_curso !== "Activo") motivo = `el curso está en estado ${curso.estado_curso}`;
  else if (curso.fecha_fin && hoyMadridISO() >= curso.fecha_fin) motivo = "el curso ya ha terminado";
  else if (curso.max_estudiantes && (count ?? 0) > curso.max_estudiantes) motivo = "el curso está completo";

  if (motivo) return await rechazarCurso(session, { cursoId, nombreCurso: curso?.nombre_curso ?? `#${cursoId}`, motivo, pi, importe, email, nombre: alumno?.nombre ?? null, idioma });

  // 3. Alta en el curso
  const usuarios: string[] = (curso!.usuarios ?? []).map(String);
  if (!usuarios.includes(userId)) {
    const { error } = await supabase.from("cursos_grupales").update({ usuarios: [...usuarios, userId] }).eq("id", cursoId);
    if (error) console.error("[stripe-webhook] No se pudo añadir el alumno a cursos_grupales.usuarios:", error.message);
  }

  // Invitación al evento del curso (si existe)
  if (curso!.google_event_id && email) {
    try {
      const token = await tokenGoogle();
      if (token) await anadirAsistente(token, curso!.google_event_id, email);
    } catch (e) {
      console.error("[stripe-webhook] Invitación al curso fallida:", e instanceof Error ? e.message : String(e));
    }
  }

  await correosCursoCerrado(curso!, { email, nombre: alumno?.nombre ?? null, idioma, zona: normalizarZona(meta.zona), importe });
  return ok({ processed: "curso_cerrado" });
}

async function rechazarCurso(session: Stripe.Checkout.Session, d: {
  cursoId: number; nombreCurso: string; motivo: string; pi: string | null; importe: number;
  email: string | null; nombre: string | null; idioma: Idioma;
}): Promise<Response> {
  const supabase = clienteAdmin();
  let reembolsoOk = false;
  if (d.pi) {
    try {
      await clienteStripe().refunds.create({ payment_intent: d.pi, metadata: { origen: "stripe-webhook", motivo: "curso_no_disponible" } });
      reembolsoOk = true;
    } catch (e) {
      console.error(`[stripe-webhook] CRÍTICO: no se pudo reembolsar el curso (${d.pi}):`, e instanceof Error ? e.message : String(e));
    }
  }
  if (reembolsoOk) {
    const { error } = await supabase.from("inscripciones_curso").update({ estado: "reembolsada" }).eq("stripe_session_id", session.id);
    if (error) console.error("[stripe-webhook] No se pudo marcar la inscripción como reembolsada:", error.message);
  }

  const importe = formatoEuros(d.importe, "es");
  await enviarCorreo({
    to: CORREO_INTERNO,
    subject: reembolsoOk ? "Inscripción a curso reembolsada" : "URGENTE: reembolso manual de curso",
    html: plantillaCorreo({
      idioma: "es",
      titulo: "Inscripción a curso no válida",
      cuerpo:
        tablaDatos([
          ["Curso", escapar(d.nombreCurso)],
          ["Alumno", `${escapar(d.nombre ?? "Alumno")} (${escapar(d.email ?? "sin email")})`],
          ["Motivo", escapar(d.motivo)],
          ["Importe", escapar(importe)],
        ]) +
        nota(reembolsoOk ? "Se ha reembolsado el pago completo." : `<strong>El reembolso automático ha fallado.</strong> Reembolsa a mano en Stripe (pago ${escapar(d.pi ?? session.id)}).`),
    }),
  });

  if (d.email) {
    const en = d.idioma === "en";
    await enviarCorreo({
      to: d.email,
      subject: en ? "We could not complete your enrolment" : "No hemos podido completar tu inscripción",
      html: plantillaCorreo({
        idioma: d.idioma,
        titulo: en ? "Enrolment not completed" : "Inscripción no completada",
        cuerpo:
          parrafo(saludo(d.nombre, d.idioma)) +
          parrafo(en
            ? `There are no places left in <strong>${escapar(d.nombreCurso)}</strong> or it is no longer open for enrolment.`
            : `No quedan plazas en <strong>${escapar(d.nombreCurso)}</strong> o ya no admite inscripciones.`) +
          nota(en
            ? `We are refunding <strong>${escapar(formatoEuros(d.importe, "en"))}</strong> to your card. It may take 5–10 days to appear.`
            : `Te devolvemos <strong>${escapar(importe)}</strong> a la tarjeta. Puede tardar de 5 a 10 días en aparecer.`),
        boton: { texto: en ? "See other courses" : "Ver otros cursos", url: URL_CURSOS },
      }),
    });
  }
  return ok({ processed: "curso_cerrado", refunded: reembolsoOk });
}

// deno-lint-ignore no-explicit-any
async function correosCursoCerrado(curso: any, d: { email: string | null; nombre: string | null; idioma: Idioma; zona: string; importe: number }) {
  const en = d.idioma === "en";
  const duracion = Number(curso.duracion_minutos) > 0 ? Number(curso.duracion_minutos) : 90;
  const hora = primeraHora(curso.horarios_curso);
  const meet = enlaceSeguro(curso.meet_link);
  const fechas = `${fechaCorta(curso.fecha_inicio)} – ${fechaCorta(curso.fecha_fin)}`;

  const filas: Array<[string, string]> = [
    [en ? "Course" : "Curso", escapar(curso.nombre_curso)],
    [en ? "Dates" : "Fechas", escapar(fechas)],
    [en ? "Days" : "Días", escapar(textoDias(curso.dias_semana, d.idioma))],
  ];
  if (hora) {
    filas.push([en ? "Time (Madrid)" : "Hora (Madrid)", escapar(rangoHoraMadrid(hora, duracion))]);
    // Hora del alumno, calculada con la fecha de inicio (el horario de verano puede moverla)
    if (d.zona !== ZONA_ESCUELA && esFechaISO(curso.fecha_inicio)) {
      const local = rangoHoraEnZona(curso.fecha_inicio, hora, duracion, d.zona);
      if (local !== rangoHoraMadrid(hora, duracion)) {
        const ciudad = d.zona.split("/").pop()?.replace(/_/g, " ") ?? d.zona;
        filas.push([`${en ? "Your time" : "Tu hora"} (${escapar(ciudad)})`, escapar(local)]);
      }
    }
  }
  filas.push([en ? "Total paid" : "Total pagado", escapar(formatoEuros(d.importe, d.idioma))]);

  if (d.email) {
    await enviarCorreo({
      to: d.email,
      subject: en ? "You're enrolled in the course" : "Ya estás inscrito/a en el curso",
      html: plantillaCorreo({
        idioma: d.idioma,
        titulo: en ? "Enrolment confirmed" : "Inscripción confirmada",
        resumen: en ? `Your place in ${curso.nombre_curso} is confirmed.` : `Tu plaza en ${curso.nombre_curso} está confirmada.`,
        cuerpo:
          parrafo(saludo(d.nombre, d.idioma)) +
          parrafo(en ? "Thank you for your purchase. Your place is confirmed:" : "Gracias por tu compra. Tu plaza está confirmada:") +
          tablaDatos(filas) +
          nota(meet
            ? (en ? "The button below is the link for every class of the course. You will also find it in your personal area." : "El botón de abajo es el enlace para todas las clases del curso. También lo tienes en tu área personal.")
            : (en ? "We will send you the class link before the course starts. You will also find it in your personal area." : "Te enviaremos el enlace de la clase antes de que empiece el curso. También lo tendrás en tu área personal.")),
        boton: meet ? { texto: en ? "Join the class" : "Entrar en la clase", url: meet } : { texto: en ? "Go to my area" : "Ir a mi área", url: URL_AREA },
      }),
    });
  }
  await enviarCorreo({
    to: CORREO_INTERNO,
    subject: "Nueva inscripción en curso",
    html: plantillaCorreo({
      idioma: "es",
      titulo: "Nueva inscripción en curso",
      cuerpo: tablaDatos([
        ["Alumno", `${escapar(d.nombre ?? "Alumno")} (${escapar(d.email ?? "sin email")})`],
        ["Curso", escapar(curso.nombre_curso)],
        ["Fechas", escapar(fechas)],
        ["Importe", escapar(formatoEuros(d.importe, "es"))],
      ]),
    }),
  });
}

// =====================================================================
// A) Webhook
// =====================================================================

async function webhook(req: Request, firma: string): Promise<Response> {
  const secreto = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secreto) return errores.interno("Configuración incompleta.");

  let evento: Stripe.Event;
  try {
    evento = await eventoVerificado(await req.text(), firma, secreto);
  } catch (e) {
    console.error("[stripe-webhook] Firma no válida:", e instanceof Error ? e.message : String(e));
    return json({ error: "Firma no válida." }, 400);
  }

  if (evento.type === "checkout.session.completed") {
    const session = evento.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "unpaid") return ok({ ignored: true });
    const meta = session.metadata ?? {};
    if (meta.tipo_compra === "bono_creditos") return await procesarBono(session);
    if (meta.tipo === "curso_cerrado") return await procesarCursoCerrado(session);
    if (meta.tipo === "material_didactico") return await procesarMaterial(session);
    if (meta.reservas) return await procesarClases(session);
    return ok();
  }

  if (evento.type === "charge.refunded") {
    const charge = evento.data.object as Stripe.Charge;
    const pi = idDe(charge.payment_intent);
    // Solo un reembolso TOTAL cancela; los parciales (franjas fallidas) no tocan las reservas válidas
    if (pi && charge.refunded) {
      const supabase = clienteAdmin();
      await supabase.from("reservas").update({ estado: "cancelada" }).eq("stripe_payment_intent", pi);
      await supabase.from("inscripciones_curso").update({ estado: "reembolsada" }).eq("stripe_payment_intent", pi);
    }
  }
  return ok();
}

// =====================================================================
// B) Checkout de clases individuales (desde CarritoCompra.vue)
// =====================================================================

async function crearCheckoutClases(req: Request): Promise<Response> {
  const user = await usuarioDesdePeticion(req);
  if (!user) return errores.sinSesion();

  const body = await leerJson(req);
  if (!body) return errores.entrada("JSON no válido.");
  const franjas = leerFranjas(body.reservas);
  if (!franjas || franjas.length === 0) return errores.entrada("Faltan las clases o no son válidas.");
  if (franjas.length > MAX_CLASES_POR_PAGO) return errores.entrada(`Máximo ${MAX_CLASES_POR_PAGO} clases por pago.`);
  const claves = franjas.map((f) => `${f.fecha} ${f.hora}`);
  if (new Set(claves).size !== claves.length) return errores.entrada("Hay clases repetidas.");

  // Validación en servidor de cada franja (calendario, 24 h, reservas y cursos)
  const supabase = clienteAdmin();
  const noValidas: Array<{ fecha: string; hora: string }> = [];
  for (const f of franjas) {
    const { data, error } = await supabase.rpc("franja_reservable", { p_fecha: f.fecha, p_hora: f.hora });
    if (error) {
      console.error("[stripe-webhook] Error en franja_reservable:", error.message);
      return errores.interno("No se pudo comprobar la disponibilidad.");
    }
    if (data !== true) noValidas.push({ fecha: f.fecha, hora: f.hora });
  }
  if (noValidas.length > 0) {
    return errores.conflicto("Algunas horas ya no están disponibles.", { franjasNoValidas: noValidas });
  }

  const metaReservas = JSON.stringify(franjas.map(({ fecha, hora, tipo }) => ({ fecha, hora, tipo })));
  if (metaReservas.length > LIMITE_METADATA) return errores.entrada("Demasiadas clases en un solo pago. Divide la compra.");

  const idioma = idiomaDesde(body.idioma);
  const en = idioma === "en";
  const zona = normalizarZona(body.zonaHoraria);
  const origen = origenSeguro(req);

  const session = await clienteStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: franjas.map((f) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${tipoClase(f.tipo, idioma ?? "es")} (${fechaCorta(f.fecha)} ${f.hora} ${en ? "Madrid time" : "hora de Madrid"})`,
        },
        unit_amount: PRECIOS[f.tipo],
      },
      quantity: 1,
    })),
    customer_email: user.email ?? undefined,
    expires_at: caducidadCheckout(),
    success_url: `${origen}/AreaPersonal?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origen}/CarritoCompra`,
    metadata: {
      reservas: metaReservas,
      user_id: user.id,
      user_email: user.email ?? "",
      ...(idioma ? { idioma } : {}),
      ...(zona !== ZONA_ESCUELA ? { zona } : {}),
    },
  });
  return json({ url: session.url });
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const firma = req.headers.get("stripe-signature");
    if (firma) return await webhook(req, firma);
    return await crearCheckoutClases(req);
  } catch (e) {
    console.error("[stripe-webhook] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
