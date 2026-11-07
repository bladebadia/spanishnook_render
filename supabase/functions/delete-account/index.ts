/**
 * delete-account — El usuario borra su propia cuenta.
 *
 * 1. Valida el JWT del llamante.
 * 2. Cancela YA en Stripe sus suscripciones vivas (si alguna falla, no se borra la cuenta:
 *    así nunca queda una suscripción cobrando a una cuenta inexistente).
 * 3. Borra el usuario de Auth (las tablas con ON DELETE CASCADE se limpian solas).
 * 4. Correo de despedida.
 *
 * Petición: POST { idioma?: 'es'|'en' }
 * Respuesta: { message }
 */
import { clienteAdmin, errores, json, leerJson, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { clienteStripe, MOTIVO_BAJA } from "../_shared/stripe.ts";
import { enviarCorreo } from "../_shared/resend.ts";
import { nota, parrafo, plantillaCorreo } from "../_shared/plantilla-correo.ts";
import { resolverIdioma, saludo, SITIO, type Idioma } from "../_shared/correo-comun.ts";

// Estados de Stripe en los que una suscripción todavía puede cobrar
const ESTADOS_VIVOS = ["active", "trialing", "past_due", "unpaid", "incomplete"];

function correoDespedida(nombre: string | null, idioma: Idioma) {
  const en = idioma === "en";
  return {
    asunto: en ? "Your account has been deleted" : "Tu cuenta se ha eliminado",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "It's not goodbye, it's see you later" : "No es un adiós, es un hasta luego",
      resumen: en ? "We have deleted your SpanishNook account." : "Hemos eliminado tu cuenta de SpanishNook.",
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en ? "We have processed your request to delete your account." : "Hemos procesado tu solicitud para eliminar tu cuenta.") +
        nota(en
          ? "This action cannot be undone. Your data has been deleted and any active course subscription has been cancelled."
          : "Esta acción no se puede deshacer. Tus datos se han eliminado y cualquier suscripción activa a un curso se ha cancelado.") +
        parrafo(en ? "We hope to see you again." : "Esperamos verte de nuevo."),
      boton: { texto: en ? "Visit SpanishNook" : "Visitar SpanishNook", url: SITIO },
    }),
  };
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();

    const body = (await leerJson(req)) ?? {};
    const supabase = clienteAdmin();

    const { data: perfil } = await supabase
      .from("datos_usuarios")
      .select("nombre, idioma_nativo")
      .eq("user_id", user.id)
      .maybeSingle();

    // 1. Cancelar suscripciones de Stripe antes de borrar nada
    const { data: subs, error: errSubs } = await supabase
      .from("user_subscriptions")
      .select("stripe_subscription_id, estado")
      .eq("user_id", user.id)
      .not("stripe_subscription_id", "is", null)
      .in("estado", ESTADOS_VIVOS);
    if (errSubs) throw errSubs;

    if (subs && subs.length > 0) {
      const stripe = clienteStripe();
      for (const s of subs) {
        try {
          await stripe.subscriptions.cancel(s.stripe_subscription_id, {
            prorate: false,
            // subscription-webhook ve este motivo y no manda el correo de "suscripción finalizada"
            cancellation_details: { comment: MOTIVO_BAJA.cuentaEliminada },
          });
        } catch (e) {
          // Si ya no existe o ya estaba cancelada, se sigue; cualquier otro error para el borrado
          const codigo = (e as { code?: string })?.code;
          const msg = e instanceof Error ? e.message : String(e);
          if (codigo === "resource_missing" || /canceled|cancelled/i.test(msg)) continue;
          console.error(`[delete-account] No se pudo cancelar la suscripción ${s.stripe_subscription_id}: ${msg}`);
          return json({ error: "No se pudo cancelar tu suscripción. Inténtalo de nuevo o escríbenos." }, 502);
        }
      }
    }

    // 2. Borrar la cuenta
    const { error: errDel } = await supabase.auth.admin.deleteUser(user.id);
    if (errDel) {
      console.error("[delete-account] Error borrando usuario:", errDel.message);
      return errores.interno("No se pudo eliminar la cuenta.");
    }

    // 3. Correo de despedida (no bloquea)
    if (user.email) {
      const correo = correoDespedida(perfil?.nombre ?? null, resolverIdioma(body.idioma, perfil?.idioma_nativo));
      await enviarCorreo({ to: user.email, subject: correo.asunto, html: correo.html });
    }

    return json({ message: "Cuenta eliminada y correo enviado" });
  } catch (e) {
    console.error("[delete-account] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
