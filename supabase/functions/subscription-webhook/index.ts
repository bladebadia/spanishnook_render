/**
 * subscription-webhook — Suscripciones mensuales a cursos grupales. Doble uso:
 *
 * A) Con cabecera stripe-signature: webhook de Stripe (STRIPE_SUBSCRIPTION_WEBHOOK_SECRET).
 *    customer.subscription.created/updated, invoice.payment_succeeded → sincroniza user_subscriptions.
 *    created → invita al alumno al evento del curso (vía crear-meet) y correo de bienvenida + aviso a Paula.
 *    customer.subscription.deleted → estado 'canceled' y correo de despedida.
 *
 * B) Sin firma, desde la web (requiere sesión):
 *    { action: 'toggle_cancel', subscriptionId, cancel: boolean }  → solo el dueño (o admin).
 *    { action: 'get_price_details', priceId }                      → importe de un precio.
 *    { course_id | courseId, idioma? }                             → Checkout de suscripción.
 *      El precio sale de cursos_grupales.stripe_price_id (se ignora priceId de la web).
 */
import {
  clienteAdmin,
  enteroPositivo,
  errores,
  esAdmin,
  json,
  leerJson,
  llamarFuncionInterna,
  origenSeguro,
  preflight,
  usuarioDesdePeticion,
} from "../_shared/auth.ts";
import { clienteStripe, eventoVerificado, idDe, MOTIVO_BAJA, type Stripe } from "../_shared/stripe.ts";
import { CORREO_INTERNO, enviarCorreo } from "../_shared/resend.ts";
import { escapar, nota, parrafo, plantillaCorreo, tablaDatos } from "../_shared/plantilla-correo.ts";
import { enlaceSeguro, idiomaDesde, primeraHora, resolverIdioma, saludo, textoDias, URL_AREA, URL_CURSOS, type Idioma } from "../_shared/correo-comun.ts";
import { rangoHoraMadrid } from "../_shared/fechas.ts";

// Estados en los que la suscripción ocupa plaza
const ESTADOS_ACTIVOS = new Set(["active", "trialing", "past_due"]);

const toISO = (ts: number | null | undefined) => (ts ? new Date(ts * 1000).toISOString() : new Date().toISOString());

// =====================================================================
// Base de datos
// =====================================================================

/**
 * Sincroniza user_subscriptions con Stripe.
 * La tabla tiene UNIQUE(user_id, course_id): si el alumno se vuelve a suscribir al mismo
 * curso tras cancelar, se actualiza su fila existente con la suscripción nueva.
 * Un evento tardío de la suscripción antigua no pisa una nueva que esté activa.
 */
async function syncSubscription(subId: string): Promise<void> {
  const stripe = clienteStripe();
  const supabase = clienteAdmin();
  const sub = await stripe.subscriptions.retrieve(subId);
  const userId = sub.metadata?.user_id;
  const courseId = enteroPositivo(sub.metadata?.course_id);
  if (!userId || !courseId) {
    console.error(`[subscription-webhook] Suscripción sin metadata user_id/course_id: ${subId}`);
    return;
  }

  const fila = {
    user_id: userId,
    course_id: courseId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: idDe(sub.customer),
    estado: sub.status,
    cancel_at_period_end: sub.cancel_at_period_end,
    current_period_start: toISO(sub.current_period_start),
    current_period_end: toISO(sub.current_period_end),
    updated_at: new Date().toISOString(),
  };

  const { data: existente, error: errSel } = await supabase
    .from("user_subscriptions")
    .select("id, stripe_subscription_id, estado")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (errSel) throw errSel;

  if (!existente) {
    const { error } = await supabase.from("user_subscriptions").insert(fila);
    if (!error) return;
    if (error.code !== "23505") throw error;
    // Carrera con otro evento: la fila ya existe, se actualiza
    const { error: errUpd } = await supabase.from("user_subscriptions").update(fila).eq("user_id", userId).eq("course_id", courseId);
    if (errUpd) throw errUpd;
    return;
  }

  const esOtra = existente.stripe_subscription_id && existente.stripe_subscription_id !== sub.id;
  if (esOtra && ESTADOS_ACTIVOS.has(existente.estado ?? "") && !ESTADOS_ACTIVOS.has(sub.status)) {
    console.warn(`[subscription-webhook] Evento antiguo de ${sub.id} ignorado: el alumno ya tiene otra suscripción activa`);
    return;
  }

  const { error } = await supabase.from("user_subscriptions").update(fila).eq("id", existente.id);
  if (error) throw error;
}

async function marcarCancelada(subId: string): Promise<void> {
  await clienteAdmin()
    .from("user_subscriptions")
    .update({ estado: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subId);
}

async function datosAlumno(userId: string | undefined) {
  if (!userId) return null;
  const { data } = await clienteAdmin()
    .from("datos_usuarios")
    .select("nombre, idioma_nativo")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

async function emailCliente(customer: unknown): Promise<{ email: string | null; nombre: string | null }> {
  const id = idDe(customer);
  if (!id) return { email: null, nombre: null };
  const c = await clienteStripe().customers.retrieve(id);
  if ((c as { deleted?: boolean }).deleted) return { email: null, nombre: null };
  const cli = c as Stripe.Customer;
  return { email: cli.email ?? null, nombre: cli.name ?? null };
}

// =====================================================================
// Correos
// =====================================================================

function correoBienvenida(nombre: string | null, curso: { nombre_curso: string; dias_semana: unknown; horarios_curso: unknown; meet_link: string | null }, idioma: Idioma) {
  const en = idioma === "en";
  const hora = primeraHora(curso.horarios_curso);
  const meet = enlaceSeguro(curso.meet_link);
  const filas: Array<[string, string]> = [
    [en ? "Course" : "Curso", escapar(curso.nombre_curso)],
    [en ? "Days" : "Días", escapar(textoDias(curso.dias_semana, idioma))],
    [en ? "Time (Madrid)" : "Hora (Madrid)", escapar(hora ? rangoHoraMadrid(hora, 90) : en ? "the agreed time" : "la hora acordada")],
  ];
  return {
    asunto: en ? "Subscription confirmed" : "Suscripción confirmada",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "Welcome to the course" : "Te damos la bienvenida al curso",
      resumen: en ? `You are now subscribed to ${curso.nombre_curso}.` : `Ya estás suscrito/a a ${curso.nombre_curso}.`,
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en ? "Thank you for subscribing. We will see each other every week:" : "Gracias por suscribirte. Nos veremos cada semana:") +
        tablaDatos(filas) +
        nota(meet
          ? (en ? "The button below is the permanent link for every class of the course. You will also find it in your personal area." : "El botón de abajo es el enlace fijo para todas las clases del curso. También lo tienes en tu área personal.")
          : (en ? "You will find the class link in your personal area." : "Tendrás el enlace de la clase en tu área personal.")),
      boton: meet
        ? { texto: en ? "Join the class" : "Entrar en la clase", url: meet }
        : { texto: en ? "Go to my area" : "Ir a mi área", url: URL_AREA },
    }),
  };
}

function correoDespedida(nombre: string | null, curso: string, idioma: Idioma) {
  const en = idioma === "en";
  return {
    asunto: en ? "Your subscription has ended" : "Tu suscripción ha finalizado",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "See you soon" : "Hasta pronto",
      resumen: en ? `Your subscription to ${curso} has ended.` : `Tu suscripción a ${curso} ha finalizado.`,
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en
          ? `Your subscription to <strong>${escapar(curso)}</strong> has ended. You will not be charged again.`
          : `Tu suscripción a <strong>${escapar(curso)}</strong> ha finalizado. No se te cobrará más.`) +
        parrafo(en ? "We hope to see you again soon." : "Esperamos verte de nuevo pronto."),
      boton: { texto: en ? "See courses" : "Ver cursos", url: URL_CURSOS },
    }),
  };
}

// =====================================================================
// A) Webhook
// =====================================================================

async function alCrearSuscripcion(sub: Stripe.Subscription): Promise<void> {
  const supabase = clienteAdmin();
  const { email, nombre: nombreStripe } = await emailCliente(sub.customer);
  if (!email) return;

  const alumno = await datosAlumno(sub.metadata?.user_id);
  const nombre = alumno?.nombre || nombreStripe;
  const idioma = resolverIdioma(sub.metadata?.idioma, alumno?.idioma_nativo);

  const courseId = enteroPositivo(sub.metadata?.course_id);
  const { data: curso, error } = courseId
    ? await supabase
      .from("cursos_grupales")
      .select("nombre_curso, meet_link, google_event_id, dias_semana, horarios_curso")
      .eq("id", courseId)
      .maybeSingle()
    : { data: null, error: null };
  if (error) console.error("[subscription-webhook] Error leyendo curso:", error.message);

  // Invitación al evento recurrente de Google Calendar
  if (curso?.google_event_id) {
    try {
      const res = await llamarFuncionInterna("crear-meet", { action: "add_attendee", eventId: curso.google_event_id, email });
      if (!res.ok) console.error(`[subscription-webhook] Falló la invitación al calendario: ${res.status}`);
    } catch (e) {
      console.error("[subscription-webhook] Error de red invitando al calendario:", e instanceof Error ? e.message : String(e));
    }
  }

  const datosCurso = curso ?? { nombre_curso: idioma === "en" ? "your course" : "tu curso", dias_semana: null, horarios_curso: null, meet_link: null };
  const correo = correoBienvenida(nombre, datosCurso, idioma);
  await enviarCorreo({ to: email, subject: correo.asunto, html: correo.html });

  await enviarCorreo({
    to: CORREO_INTERNO,
    subject: "Nuevo alumno en un curso",
    html: plantillaCorreo({
      idioma: "es",
      titulo: "Nuevo alumno en un curso",
      resumen: `${nombre ?? "Un alumno"} se ha apuntado a ${datosCurso.nombre_curso}.`,
      cuerpo: tablaDatos([
        ["Alumno", `${escapar(nombre ?? "Alumno")} (${escapar(email)})`],
        ["Curso", escapar(datosCurso.nombre_curso)],
      ]),
    }),
  });
}

async function alBorrarSuscripcion(sub: Stripe.Subscription): Promise<void> {
  await marcarCancelada(sub.id);

  // Si la cancelamos nosotros (cierre de curso o cuenta eliminada) ya se mandó otro correo
  const motivo = sub.cancellation_details?.comment;
  if (motivo === MOTIVO_BAJA.cursoCerrado || motivo === MOTIVO_BAJA.cuentaEliminada) return;

  const { email, nombre: nombreStripe } = await emailCliente(sub.customer);
  if (!email) return;
  const alumno = await datosAlumno(sub.metadata?.user_id);
  const idioma = resolverIdioma(sub.metadata?.idioma, alumno?.idioma_nativo);

  const courseId = enteroPositivo(sub.metadata?.course_id);
  const { data: curso } = courseId
    ? await clienteAdmin().from("cursos_grupales").select("nombre_curso").eq("id", courseId).maybeSingle()
    : { data: null };

  const correo = correoDespedida(alumno?.nombre || nombreStripe, curso?.nombre_curso ?? (idioma === "en" ? "the course" : "el curso"), idioma);
  await enviarCorreo({ to: email, subject: correo.asunto, html: correo.html });
}

async function webhook(req: Request, firma: string): Promise<Response> {
  const secreto = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET");
  if (!secreto) return errores.interno("Configuración incompleta.");

  let evento: Stripe.Event;
  try {
    evento = await eventoVerificado(await req.text(), firma, secreto);
  } catch (e) {
    console.error("[subscription-webhook] Firma no válida:", e instanceof Error ? e.message : String(e));
    return json({ error: "Firma no válida." }, 400);
  }

  try {
    switch (evento.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = evento.data.object as Stripe.Subscription;
        await syncSubscription(sub.id);
        if (evento.type === "customer.subscription.created") await alCrearSuscripcion(sub);
        break;
      }
      case "invoice.payment_succeeded": {
        const subId = idDe((evento.data.object as Stripe.Invoice).subscription);
        if (subId) await syncSubscription(subId);
        break;
      }
      case "customer.subscription.deleted":
        await alBorrarSuscripcion(evento.data.object as Stripe.Subscription);
        break;
    }
  } catch (e) {
    // Igual que antes: se registra y se responde 200 para que Stripe no reintente en bucle
    console.error(`[subscription-webhook] Error procesando ${evento.type}:`, e instanceof Error ? e.message : String(e));
  }
  return json({ received: true });
}

// =====================================================================
// B) Peticiones de la web
// =====================================================================

async function toggleCancel(userId: string, body: Record<string, unknown>): Promise<Response> {
  const subscriptionId = typeof body.subscriptionId === "string" ? body.subscriptionId : "";
  if (!subscriptionId || typeof body.cancel !== "boolean") return errores.entrada("Faltan subscriptionId o cancel.");

  const { data: fila } = await clienteAdmin()
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (!fila) return errores.noEncontrado("Suscripción no encontrada.");
  if (fila.user_id !== userId && !(await esAdmin(userId))) return errores.prohibido();

  try {
    const sub = await clienteStripe().subscriptions.update(subscriptionId, { cancel_at_period_end: body.cancel });
    await syncSubscription(sub.id);
    return json({ success: true, status: sub.status, cancel_at_period_end: sub.cancel_at_period_end });
  } catch (e) {
    console.error("[subscription-webhook] toggle_cancel:", e instanceof Error ? e.message : String(e));
    return errores.entrada("No se pudo actualizar la suscripción.");
  }
}

async function crearCheckout(req: Request, user: { id: string; email?: string }, body: Record<string, unknown>): Promise<Response> {
  const supabase = clienteAdmin();
  const stripe = clienteStripe();
  const courseId = enteroPositivo(body.course_id ?? body.courseId);
  if (!courseId) return errores.entrada("Falta el curso.");
  if (!user.email) return errores.entrada("Tu cuenta no tiene email.");

  const { data: curso, error } = await supabase
    .from("cursos_grupales")
    .select("id, nombre_curso, estado_curso, stripe_price_id, max_estudiantes, tipo_curso, visibilidad")
    .eq("id", courseId)
    .maybeSingle();
  if (error) throw error;
  if (!curso || curso.visibilidad === false) return errores.noEncontrado("Curso no encontrado.");
  if (curso.tipo_curso === "cerrado") return errores.entrada("Este curso se paga de una vez, no por suscripción.");
  if (curso.estado_curso !== "Activo") return errores.conflicto("El curso no admite inscripciones ahora mismo.");
  if (!curso.stripe_price_id) return errores.conflicto("El curso no tiene precio configurado.");

  // Plazas
  if (curso.max_estudiantes) {
    const { data: ocupacion, error: errOc } = await supabase.rpc("get_curso_ocupacion", { curso_id_param: curso.id });
    if (errOc) throw errOc;
    if (Number(ocupacion) >= curso.max_estudiantes) return errores.conflicto("El curso está completo.");
  }

  // ¿Ya suscrito?
  const { data: actual } = await supabase
    .from("user_subscriptions")
    .select("estado")
    .eq("user_id", user.id)
    .eq("course_id", curso.id)
    .maybeSingle();
  if (actual && ESTADOS_ACTIVOS.has(actual.estado ?? "")) return errores.conflicto("Ya estás suscrito/a a este curso.");

  // Cliente de Stripe (por el email de la sesión, no el de la web)
  const { data: perfil } = await supabase.from("datos_usuarios").select("nombre").eq("user_id", user.id).maybeSingle();
  const existentes = await stripe.customers.list({ email: user.email, limit: 1 });
  const customer = existentes.data[0] ?? await stripe.customers.create({
    email: user.email,
    name: perfil?.nombre || user.email,
    metadata: { user_id: user.id },
  });

  const idioma = idiomaDesde(body.idioma);
  const origen = origenSeguro(req);
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: curso.stripe_price_id, quantity: 1 }],
    subscription_data: {
      metadata: { user_id: user.id, course_id: String(curso.id), ...(idioma ? { idioma } : {}) },
    },
    success_url: `${origen}/AreaPersonal?success=true`,
    cancel_url: `${origen}/AreaPersonal?canceled=true`,
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

    const body = await leerJson(req);
    if (!body) return errores.entrada("JSON no válido.");

    if (body.action === "get_price_details") {
      if (typeof body.priceId !== "string" || !body.priceId.startsWith("price_")) return errores.entrada("priceId no válido.");
      try {
        const price = await clienteStripe().prices.retrieve(body.priceId);
        return json({ amount: price.unit_amount, currency: price.currency });
      } catch {
        return errores.entrada("No encontrado.");
      }
    }

    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();

    if (body.action === "toggle_cancel") return await toggleCancel(user.id, body);
    return await crearCheckout(req, user, body);
  } catch (e) {
    console.error("[subscription-webhook] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
