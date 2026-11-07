/**
 * checkout-curso — Checkout de Stripe (pago único) para un curso de fechas cerradas.
 *
 * Requiere sesión. Todo sale de cursos_grupales: tipo_curso = 'cerrado', estado 'Activo',
 * visible, que no haya terminado (hoy en Madrid < fecha_fin) y con plazas libres.
 * stripe-webhook (metadata.tipo = 'curso_cerrado') crea la inscripción al confirmarse el pago.
 *
 * Petición: POST { cursoId: number, idioma?: 'es'|'en', zonaHoraria?: string }
 * Respuesta: { url }
 */
import {
  clienteAdmin,
  enteroPositivo,
  errores,
  json,
  leerJson,
  origenSeguro,
  preflight,
  usuarioDesdePeticion,
} from "../_shared/auth.ts";
import { caducidadCheckout, clienteStripe } from "../_shared/stripe.ts";
import { idiomaDesde } from "../_shared/correo-comun.ts";
import { fechaCorta, hoyMadridISO, normalizarZona, ZONA_ESCUELA } from "../_shared/fechas.ts";

const IMPORTE_MINIMO = 50; // céntimos (mínimo de Stripe)

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();
    if (!user.email) return errores.entrada("Tu cuenta no tiene email.");

    const body = await leerJson(req);
    const cursoId = enteroPositivo(body?.cursoId);
    if (!cursoId) return errores.entrada("Falta cursoId.");

    const supabase = clienteAdmin();
    const { data: curso, error } = await supabase
      .from("cursos_grupales")
      .select("id, nombre_curso, tipo_curso, estado_curso, visibilidad, fecha_inicio, fecha_fin, precio_total_centimos, max_estudiantes")
      .eq("id", cursoId)
      .eq("tipo_curso", "cerrado")
      .eq("estado_curso", "Activo")
      .eq("visibilidad", true)
      .maybeSingle();
    if (error) throw error;
    if (!curso) return errores.noEncontrado("Curso no disponible.");
    if (!curso.fecha_fin || hoyMadridISO() >= curso.fecha_fin) return errores.conflicto("El curso ya ha terminado.");

    const importe = Number(curso.precio_total_centimos);
    if (!Number.isSafeInteger(importe) || importe < IMPORTE_MINIMO) return errores.conflicto("El curso no tiene precio configurado.");

    // ¿Ya inscrito?
    const { data: inscrito } = await supabase
      .from("inscripciones_curso")
      .select("curso_id")
      .eq("curso_id", curso.id)
      .eq("user_id", user.id)
      .eq("estado", "pagada")
      .limit(1);
    if (inscrito && inscrito.length > 0) return errores.conflicto("Ya estás inscrito/a en este curso.");

    // ¿Quedan plazas?
    if (curso.max_estudiantes) {
      const { count, error: errCount } = await supabase
        .from("inscripciones_curso")
        .select("curso_id", { count: "exact", head: true })
        .eq("curso_id", curso.id)
        .eq("estado", "pagada");
      if (errCount) throw errCount;
      if ((count ?? 0) >= curso.max_estudiantes) return errores.conflicto("El curso está completo.");
    }

    const idioma = idiomaDesde(body?.idioma);
    const zona = normalizarZona(body?.zonaHoraria);
    const origen = origenSeguro(req);

    const session = await clienteStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          unit_amount: importe,
          product_data: {
            name: curso.nombre_curso,
            description: `${fechaCorta(curso.fecha_inicio)} – ${fechaCorta(curso.fecha_fin)}`,
          },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      expires_at: caducidadCheckout(),
      metadata: {
        tipo: "curso_cerrado",
        curso_id: String(curso.id),
        user_id: user.id,
        ...(idioma ? { idioma } : {}),
        ...(zona !== ZONA_ESCUELA ? { zona } : {}),
      },
      success_url: `${origen}/ReservasCursos?id=${curso.id}&pago=ok`,
      cancel_url: `${origen}/ReservasCursos?id=${curso.id}`,
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("[checkout-curso] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno("No se pudo iniciar el pago.");
  }
});
