/**
 * cerrar-curso — Cierra un curso grupal (solo admin).
 *
 * Para cada suscripción activa: reembolso prorrateado del periodo pagado que queda,
 * cancelación inmediata en Stripe, estado 'canceled' en BD y correo al alumno.
 * Después borra el evento de Google Calendar y marca el curso 'Completo' y oculto.
 *
 * Petición: POST { courseId: number }   (Authorization: Bearer <jwt de admin>)
 * Respuesta: { success: true, procesados: [{ userId, status, amount? , error? }] }
 */
import { clienteAdmin, enteroPositivo, errores, esAdmin, json, leerJson, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { clienteStripe, MOTIVO_BAJA } from "../_shared/stripe.ts";
import { borrarEvento, tokenGoogle } from "../_shared/google.ts";
import { enviarCorreo } from "../_shared/resend.ts";
import { nota, parrafo, plantillaCorreo, escapar } from "../_shared/plantilla-correo.ts";
import { resolverIdioma, saludo, URL_CURSOS, type Idioma } from "../_shared/correo-comun.ts";

function correoCierre(nombre: string | null, curso: string, idioma: Idioma) {
  const en = idioma === "en";
  const c = `<strong>${escapar(curso)}</strong>`;
  return {
    asunto: en ? "Course closed" : "Curso finalizado",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "We're closing the course" : "Cerramos el curso",
      resumen: en ? `The course ${curso} has been closed.` : `El curso ${curso} se ha cerrado.`,
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en
          ? `The course ${c} has been closed by the SpanishNook team.`
          : `El curso ${c} se ha cerrado por parte del equipo de SpanishNook.`) +
        nota(en
          ? "Your subscription has been cancelled and you will not be charged again. The proportional amount for the rest of your current period will be refunded to your card in the coming days."
          : "Tu suscripción se ha cancelado y no se te cobrará más. El importe proporcional al resto de tu periodo actual se te devolverá a la tarjeta en los próximos días.") +
        parrafo(en ? "Thank you for being part of SpanishNook." : "Gracias por haber sido parte de SpanishNook."),
      boton: { texto: en ? "See other courses" : "Ver otros cursos", url: URL_CURSOS },
    }),
  };
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    // Solo administradores
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();
    if (!(await esAdmin(user.id))) return errores.prohibido();

    const body = await leerJson(req);
    const courseId = enteroPositivo(body?.courseId);
    if (!courseId) return errores.entrada("Falta courseId.");

    const supabase = clienteAdmin();
    const stripe = clienteStripe();

    // 1. Curso
    const { data: curso, error: errCurso } = await supabase
      .from("cursos_grupales")
      .select("id, nombre_curso, google_event_id, estado_curso")
      .eq("id", courseId)
      .maybeSingle();
    if (errCurso) throw errCurso;
    if (!curso) return errores.noEncontrado("Curso no encontrado.");

    console.log(`[cerrar-curso] Cerrando curso ${courseId} (admin ${user.id})`);

    // 2. Suscripciones activas
    const { data: suscripciones, error: errSubs } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id, user_id")
      .eq("course_id", courseId)
      .in("estado", ["active", "trialing"]);
    if (errSubs) throw errSubs;

    const procesados: Array<Record<string, unknown>> = [];
    const ahora = Math.floor(Date.now() / 1000);

    // 3. Reembolso prorrateado + cancelación + correo, alumno a alumno
    for (const fila of suscripciones ?? []) {
      try {
        if (!fila.stripe_subscription_id) throw new Error("Suscripción sin id de Stripe");
        const sub = await stripe.subscriptions.retrieve(fila.stripe_subscription_id);
        let reembolsado = 0;

        if (sub.status === "active" && sub.current_period_end > ahora && sub.latest_invoice) {
          const factura = await stripe.invoices.retrieve(String(sub.latest_invoice));
          if (factura.payment_intent && factura.amount_paid > 0) {
            const total = sub.current_period_end - sub.current_period_start;
            const restante = sub.current_period_end - ahora;
            const importe = Math.floor(factura.amount_paid * (restante / total));
            if (importe > 0) {
              await stripe.refunds.create({
                payment_intent: String(factura.payment_intent),
                amount: importe,
                reason: "requested_by_customer",
                metadata: { reason_custom: "Curso finalizado por la academia" },
              });
              reembolsado = importe;
            }
          }
        }

        await stripe.subscriptions.cancel(sub.id, {
          prorate: false,
          // subscription-webhook ve este motivo y no manda además el correo de "suscripción finalizada"
          cancellation_details: { comment: MOTIVO_BAJA.cursoCerrado },
        });
        await supabase
          .from("user_subscriptions")
          .update({ estado: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);

        // Correo al alumno, en su idioma
        const { data: alumno } = await supabase
          .from("datos_usuarios")
          .select("nombre, email, idioma_nativo")
          .eq("user_id", fila.user_id)
          .maybeSingle();
        if (alumno?.email) {
          const idioma = resolverIdioma(sub.metadata?.idioma, alumno.idioma_nativo);
          const correo = correoCierre(alumno.nombre, curso.nombre_curso, idioma);
          await enviarCorreo({ to: alumno.email, subject: correo.asunto, html: correo.html });
        }

        procesados.push({ userId: fila.user_id, status: "refunded_card", amount: reembolsado / 100 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[cerrar-curso] Error con el usuario ${fila.user_id}: ${msg}`);
        procesados.push({ userId: fila.user_id, status: "error", error: msg });
      }
    }

    // 4. Borrar el evento de Google Calendar
    if (curso.google_event_id) {
      try {
        const token = await tokenGoogle();
        if (token) await borrarEvento(token, curso.google_event_id);
      } catch (e) {
        console.error("[cerrar-curso] Error borrando evento de Google:", e instanceof Error ? e.message : String(e));
      }
    }

    // 5. Cerrar el curso en BD
    const { error: errCierre } = await supabase
      .from("cursos_grupales")
      .update({ estado_curso: "Completo", visibilidad: false })
      .eq("id", courseId);
    if (errCierre) throw errCierre;

    return json({ success: true, procesados });
  } catch (e) {
    console.error("[cerrar-curso] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno("No se pudo cerrar el curso.");
  }
});
