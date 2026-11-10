/**
 * delete-account — El usuario borra su propia cuenta.
 *
 * La confirmación la comprueba ESTE servidor (no solo la página), así que una sesión
 * abierta no basta para borrar una cuenta llamando a la función directamente:
 *   - Cuenta con contraseña: hay que enviar la contraseña.
 *   - Cuenta sin contraseña (creada con Google): hay que pedir antes un código de 6 dígitos
 *     que se envía al email de la cuenta ({ accion: 'enviarCodigo' }) y enviarlo al borrar.
 *     Se guarda solo su hash en codigos_borrado_cuenta: caduca a los 15 min, 5 intentos.
 *
 * Al borrar:
 * 1. Cancela YA en Stripe sus suscripciones vivas (si alguna falla, no se borra la cuenta:
 *    así nunca queda una suscripción cobrando a una cuenta inexistente).
 * 2. Borra el usuario de Auth (las tablas con ON DELETE CASCADE se limpian solas).
 * 3. Correo de despedida.
 *
 * Peticiones:
 *   POST { accion: 'enviarCodigo', idioma? }        → { ok: true }
 *   POST { password? , codigo?, idioma? }           → { message }
 * Errores con { error, motivo }: motivo = 'contrasena_incorrecta' | 'codigo_incorrecto' |
 *   'codigo_caducado' | 'demasiados_intentos' | 'espera' | 'falta_confirmacion'.
 */
import { createClient, type User } from "jsr:@supabase/supabase-js@2";
import { clienteAdmin, errores, json, leerJson, preflight, usuarioDesdePeticion } from "../_shared/auth.ts";
import { clienteStripe, MOTIVO_BAJA } from "../_shared/stripe.ts";
import { enviarCorreo } from "../_shared/resend.ts";
import { codigoGrande, nota, parrafo, plantillaCorreo } from "../_shared/plantilla-correo.ts";
import { resolverIdioma, saludo, SITIO, type Idioma } from "../_shared/correo-comun.ts";

// Estados de Stripe en los que una suscripción todavía puede cobrar
const ESTADOS_VIVOS = ["active", "trialing", "past_due", "unpaid", "incomplete"];
const MINUTOS_CODIGO = 15;
const MAX_INTENTOS = 5;
const SEGUNDOS_ENTRE_ENVIOS = 60;

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

function correoCodigo(nombre: string | null, codigo: string, idioma: Idioma) {
  const en = idioma === "en";
  return {
    asunto: en ? "Code to delete your SpanishNook account" : "Código para eliminar tu cuenta de SpanishNook",
    html: plantillaCorreo({
      idioma,
      titulo: en ? "Confirm the deletion of your account" : "Confirma el borrado de tu cuenta",
      resumen: en ? "Your code to delete your account." : "Tu código para eliminar tu cuenta.",
      cuerpo:
        parrafo(saludo(nombre, idioma)) +
        parrafo(en
          ? `Enter this code in your personal area to delete your account. It expires in ${MINUTOS_CODIGO} minutes.`
          : `Escribe este código en tu área personal para eliminar tu cuenta. Caduca en ${MINUTOS_CODIGO} minutos.`) +
        codigoGrande(codigo) +
        nota(en
          ? "If you didn't ask for this, ignore this email: nothing will be deleted. If someone else is using your account, change your Google password."
          : "Si no lo has pedido tú, ignora este correo: no se borrará nada. Si alguien más está usando tu cuenta, cambia la contraseña de Google."),
    }),
  };
}

/** ¿La cuenta tiene contraseña? (identidad 'email'). Las creadas solo con Google, no. */
function tieneContrasena(user: User): boolean {
  const proveedores = user.app_metadata?.providers;
  if (Array.isArray(proveedores)) return proveedores.includes("email");
  return (user.identities ?? []).some((i) => i.provider === "email");
}

async function hashCodigo(userId: string, codigo: string): Promise<string> {
  const datos = new TextEncoder().encode(`${userId}:${codigo}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function codigoAleatorio(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, "0");
}

const rechazo = (motivo: string, error: string, status = 403) => json({ error, motivo }, status);

/** Comprueba la contraseña con un cliente público (no guarda la sesión que crea). */
async function contrasenaValida(email: string, password: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY");
  const cliente = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await cliente.auth.signInWithPassword({ email, password });
  return !error;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();
    if (!user.email) return errores.entrada("La cuenta no tiene email.");

    const body = (await leerJson(req)) ?? {};
    const supabase = clienteAdmin();

    const { data: perfil } = await supabase
      .from("datos_usuarios")
      .select("nombre, idioma_nativo")
      .eq("user_id", user.id)
      .maybeSingle();
    const idioma = resolverIdioma(body.idioma, perfil?.idioma_nativo);

    // A) Enviar el código (solo cuentas sin contraseña)
    if (body.accion === "enviarCodigo") {
      if (tieneContrasena(user)) return errores.entrada("Esta cuenta se confirma con la contraseña.");

      const { data: previo } = await supabase
        .from("codigos_borrado_cuenta")
        .select("creado")
        .eq("user_id", user.id)
        .maybeSingle();
      if (previo && Date.now() - new Date(previo.creado).getTime() < SEGUNDOS_ENTRE_ENVIOS * 1000) {
        return rechazo("espera", "Espera un minuto antes de pedir otro código.", 429);
      }

      const codigo = codigoAleatorio();
      const { error: errGuardar } = await supabase.from("codigos_borrado_cuenta").upsert({
        user_id: user.id,
        codigo_hash: await hashCodigo(user.id, codigo),
        expira: new Date(Date.now() + MINUTOS_CODIGO * 60_000).toISOString(),
        intentos: 0,
        creado: new Date().toISOString(),
      });
      if (errGuardar) throw errGuardar;

      const correo = correoCodigo(perfil?.nombre ?? null, codigo, idioma);
      const enviado = await enviarCorreo({ to: user.email, subject: correo.asunto, html: correo.html });
      if (!enviado) return errores.interno("No se pudo enviar el código. Inténtalo de nuevo.");
      return json({ ok: true });
    }

    // B) Confirmación antes de borrar (siempre en el servidor)
    if (tieneContrasena(user)) {
      if (typeof body.password !== "string" || !body.password) {
        return rechazo("falta_confirmacion", "Escribe tu contraseña.", 400);
      }
      if (!(await contrasenaValida(user.email, body.password))) {
        return rechazo("contrasena_incorrecta", "La contraseña no es correcta.");
      }
    } else {
      const codigo = typeof body.codigo === "string" ? body.codigo.replace(/\D/g, "") : "";
      if (codigo.length !== 6) return rechazo("falta_confirmacion", "Escribe el código de 6 dígitos.", 400);

      const { data: guardado, error: errLeer } = await supabase
        .from("codigos_borrado_cuenta")
        .select("codigo_hash, expira, intentos")
        .eq("user_id", user.id)
        .maybeSingle();
      if (errLeer) throw errLeer;
      if (!guardado || new Date(guardado.expira).getTime() < Date.now()) {
        return rechazo("codigo_caducado", "El código ha caducado. Pide uno nuevo.");
      }
      if (guardado.intentos >= MAX_INTENTOS) {
        await supabase.from("codigos_borrado_cuenta").delete().eq("user_id", user.id);
        return rechazo("demasiados_intentos", "Demasiados intentos. Pide un código nuevo.", 429);
      }
      if ((await hashCodigo(user.id, codigo)) !== guardado.codigo_hash) {
        await supabase.from("codigos_borrado_cuenta").update({ intentos: guardado.intentos + 1 }).eq("user_id", user.id);
        return rechazo("codigo_incorrecto", "El código no es correcto.");
      }
      await supabase.from("codigos_borrado_cuenta").delete().eq("user_id", user.id);
    }

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
          const codigoError = (e as { code?: string })?.code;
          const msg = e instanceof Error ? e.message : String(e);
          if (codigoError === "resource_missing" || /canceled|cancelled/i.test(msg)) continue;
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
    const correo = correoDespedida(perfil?.nombre ?? null, idioma);
    await enviarCorreo({ to: user.email, subject: correo.asunto, html: correo.html });

    return json({ message: "Cuenta eliminada y correo enviado" });
  } catch (e) {
    console.error("[delete-account] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
