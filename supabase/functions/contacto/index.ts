/**
 * contacto — Formulario de contacto de la web.
 *
 * 1. Valida los campos (longitudes, email) y descarta bots (campo trampa "web").
 * 2. Limita a 3 mensajes por email cada hora.
 * 3. Guarda el mensaje en mensajes_contacto (clave de servicio).
 * 4. Avisa a Paula (CORREO_INTERNO) con "Responder" directo al remitente.
 *
 * Antes la web insertaba en mensajes_contacto y nadie se enteraba.
 *
 * Petición: POST { nombre, email, asunto?, mensaje, web? }  — sin sesión
 * Respuesta: { ok: true }
 */
import { clienteAdmin, errores, json, leerJson, preflight } from "../_shared/auth.ts";
import { CORREO_INTERNO, enviarCorreo } from "../_shared/resend.ts";
import { escapar, plantillaCorreo, tablaDatos } from "../_shared/plantilla-correo.ts";

const MAX_POR_HORA = 3;

function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio.length > 0 && limpio.length <= max ? limpio : null;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const body = await leerJson(req);
    if (!body) return errores.entrada();

    // Campo trampa: invisible para personas; si viene relleno es un bot. Se responde ok sin hacer nada.
    if (typeof body.web === "string" && body.web.trim() !== "") return json({ ok: true });

    const nombre = texto(body.nombre, 120);
    const email = texto(body.email, 254)?.toLowerCase() ?? null;
    const asunto = typeof body.asunto === "string" ? body.asunto.trim().slice(0, 200) : "";
    const mensaje = texto(body.mensaje, 5000);
    if (!nombre || !email || !mensaje || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
      return errores.entrada("Revisa el nombre, el email y el mensaje.");
    }

    const supabase = clienteAdmin();

    const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: errCount } = await supabase
      .from("mensajes_contacto")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", haceUnaHora);
    if (errCount) throw errCount;
    if ((count ?? 0) >= MAX_POR_HORA) {
      return json({ error: "Has enviado varios mensajes seguidos. Inténtalo más tarde." }, 429);
    }

    // mensajes_contacto no tiene columna de asunto: va al principio del mensaje
    const textoGuardado = asunto ? `Asunto: ${asunto}\n\n${mensaje}` : mensaje;
    const { error: errInsert } = await supabase
      .from("mensajes_contacto")
      .insert({ nombre, email, mensaje: textoGuardado });
    if (errInsert) throw errInsert;

    await enviarCorreo({
      to: CORREO_INTERNO,
      replyTo: email,
      subject: `Mensaje de la web: ${asunto || nombre}`.slice(0, 150),
      html: plantillaCorreo({
        idioma: "es",
        titulo: "Nuevo mensaje de contacto",
        resumen: `${nombre} te ha escrito desde la web.`,
        cuerpo:
          tablaDatos([
            ["Nombre", escapar(nombre)],
            ["Email", escapar(email)],
            ...(asunto ? [["Asunto", escapar(asunto)] as [string, string]] : []),
          ]) +
          `<p style="white-space:pre-line;margin:16px 0 0">${escapar(mensaje)}</p>` +
          `<p style="color:#67585a;font-size:14px;margin:16px 0 0">Responde a este correo para contestar directamente.</p>`,
      }),
    });

    return json({ ok: true });
  } catch (e) {
    console.error("[contacto] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
