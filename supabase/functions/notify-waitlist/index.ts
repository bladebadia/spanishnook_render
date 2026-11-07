/**
 * notify-waitlist — Avisa a la lista de espera de que un curso ya está activo.
 *
 * Solo admin (o llamada interna). El nombre del curso, la lista y el enlace se leen de la BD;
 * lo que mande la web aparte de cursoId se ignora.
 *
 * Petición: POST { cursoId: number }
 * Respuesta: { success: true, notificados: number, fallidos: number }
 * Al terminar, en lista_espera solo quedan las entradas cuyo correo falló.
 */
import {
  clienteAdmin,
  enteroPositivo,
  errores,
  esAdmin,
  esLlamadaInterna,
  esUuid,
  json,
  leerJson,
  preflight,
  usuarioDesdePeticion,
} from "../_shared/auth.ts";
import { enviarCorreo, pausa } from "../_shared/resend.ts";
import { escapar, nota, parrafo, plantillaCorreo } from "../_shared/plantilla-correo.ts";
import { resolverIdioma, saludo, SITIO, type Idioma } from "../_shared/correo-comun.ts";

interface Destinatario {
  entrada: string; // valor original en lista_espera (uuid o email)
  email: string;
  nombre: string | null;
  idioma: Idioma;
}

function correoCursoActivo(d: Destinatario, curso: string, enlace: string) {
  const en = d.idioma === "en";
  const c = `<strong>${escapar(curso)}</strong>`;
  return {
    asunto: en ? `The course ${curso} is now open` : `El curso ${curso} ya está abierto`,
    html: plantillaCorreo({
      idioma: d.idioma,
      titulo: en ? "The course is now open" : "El curso ya está abierto",
      resumen: en ? `${curso} is open for sign-ups.` : `${curso} ya admite inscripciones.`,
      cuerpo:
        parrafo(saludo(d.nombre, d.idioma)) +
        parrafo(en
          ? `You were on the waiting list for ${c}. Good news: the course is now open.`
          : `Estabas en la lista de espera de ${c}. Buenas noticias: el curso ya está abierto.`) +
        nota(en ? "Places are limited. Sign up soon to keep yours." : "Las plazas son limitadas. Apúntate pronto para asegurar la tuya."),
      boton: { texto: en ? "Sign up for the course" : "Apuntarme al curso", url: enlace },
    }),
  };
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    if (!esLlamadaInterna(req)) {
      const user = await usuarioDesdePeticion(req);
      if (!user) return errores.sinSesion();
      if (!(await esAdmin(user.id))) return errores.prohibido();
    }

    const body = await leerJson(req);
    const cursoId = enteroPositivo(body?.cursoId);
    if (!cursoId) return errores.entrada("Falta cursoId.");

    const supabase = clienteAdmin();
    const { data: curso, error } = await supabase
      .from("cursos_grupales")
      .select("id, nombre_curso, estado_curso, lista_espera")
      .eq("id", cursoId)
      .maybeSingle();
    if (error) throw error;
    if (!curso) return errores.noEncontrado("Curso no encontrado.");
    if (curso.estado_curso !== "Activo") return errores.conflicto("El curso no está activo.");

    const lista: string[] = (curso.lista_espera ?? []).map((x: unknown) => String(x).trim()).filter(Boolean);
    if (lista.length === 0) return json({ success: true, notificados: 0, fallidos: 0 });

    // 1. Usuarios registrados (uuid) → datos de la BD; emails sueltos → tal cual
    const ids = lista.filter(esUuid);
    const perfiles = new Map<string, { email: string; nombre: string | null; idioma_nativo: string | null }>();
    if (ids.length) {
      const { data } = await supabase
        .from("datos_usuarios")
        .select("user_id, email, nombre, idioma_nativo")
        .in("user_id", ids);
      for (const p of data ?? []) if (p.email) perfiles.set(p.user_id, p);
    }

    const vistos = new Set<string>();
    const destinatarios: Destinatario[] = [];
    for (const entrada of lista) {
      let d: Destinatario | null = null;
      if (esUuid(entrada)) {
        const p = perfiles.get(entrada);
        if (p) d = { entrada, email: p.email, nombre: p.nombre, idioma: resolverIdioma(null, p.idioma_nativo) };
      } else if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(entrada)) {
        d = { entrada, email: entrada, nombre: null, idioma: "es" };
      }
      if (!d || vistos.has(d.email.toLowerCase())) continue;
      vistos.add(d.email.toLowerCase());
      destinatarios.push(d);
    }

    // 2. Envío uno a uno (Resend limita las peticiones por segundo)
    const enlace = `${SITIO}/ReservasCursos?id=${curso.id}`;
    const fallidas: string[] = [];
    let notificados = 0;
    for (const d of destinatarios) {
      const correo = correoCursoActivo(d, curso.nombre_curso, enlace);
      if (await enviarCorreo({ to: d.email, subject: correo.asunto, html: correo.html })) notificados++;
      else fallidas.push(d.entrada);
      await pausa(600);
    }

    // 3. En la lista solo se quedan los que no recibieron el correo
    const { error: errUpd } = await supabase
      .from("cursos_grupales")
      .update({ lista_espera: fallidas })
      .eq("id", curso.id);
    if (errUpd) console.error("[notify-waitlist] Correos enviados, pero no se pudo actualizar la lista:", errUpd.message);

    return json({ success: true, notificados, fallidos: fallidas.length });
  } catch (e) {
    console.error("[notify-waitlist] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno();
  }
});
