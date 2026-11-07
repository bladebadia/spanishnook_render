import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

const LOGO_URL = "https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png";
const URL_APP = "https://spanishnook.com";

// =====================================================================
// 🎨 PLANTILLA HTML CORPORATIVA (BILINGÜE) - CURSO ACTIVO
// =====================================================================
function generarEmailCursoActivoHTML(nombreAlumno: string, nombreCurso: string, linkReserva: string) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
    <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 40px 20px; color: #333333; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${LOGO_URL}" alt="Spanish Nook Logo" style="width: 80px; height: auto; border: 0; display: block; margin: 0 auto;">
        <p style="margin: 10px 0 0 0; color: #333333; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">SpanishNook</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Novedad / Update</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡El curso ya está activo! / The course is now active!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>¡Hola, <strong>${nombreAlumno}</strong>!</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">El curso <strong>${nombreCurso}</strong> ha cambiado de estado: <strong>está activo</strong>.</p>
        </div>

        <p>Dentro de poco comenzará... ¡Apúntate y no te quedes sin tu plaza!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkReserva}" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Apuntarme al curso</a>
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hello, <strong>${nombreAlumno}</strong>!</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">The course <strong>${nombreCurso}</strong> has changed status: <strong>it's active</strong>.</p>
        </div>

        <p>It will start soon... Sign up now and don't miss out!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkReserva}" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Sign up for the course</a>
        </div>
      </div>

      <div style="margin-top: 40px; font-size: 16px; color: #525553; text-align: center;">
        <p>¡Nos vemos en las aulas! / See you in class!</p>
        <p style="margin-bottom: 5px;"><strong>El equipo de SpanishNook</strong></p>
        <p style="margin-top: 0; font-size: 14px; color: #888888;">Creating your SpanishNook, at your pace.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
      <div style="text-align: center; font-size: 12px; color: #999999; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">© 2025 Spanish Nook. Todos los derechos reservados.</p>
        <p style="margin: 0;">
          <a href="mailto:contacto@spanishnook.com" style="color: #851319; text-decoration: none;">contacto@spanishnook.com</a> |
          <a href="${URL_APP}" style="color: #851319; text-decoration: none;">www.spanishnook.com</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// 📧 HELPER: ENVIAR EMAIL
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "SpanishNook <hola@spanishnook.com>", // <- Correo oficial
        to: [to],
        subject,
        html: htmlContent
      }),
    });
  } catch (e) {
    console.error("Email error:", e);
  }
}

// FUNCIÓN AUXILIAR: Para detectar si un string es un UUID válido de Supabase
const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { cursoId, nombreCurso, listaIds } = await req.json();

    if (!cursoId || !nombreCurso || !listaIds || listaIds.length === 0) {
      return new Response(JSON.stringify({ error: "Faltan parámetros o la lista está vacía" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SERVICE_ROLE_KEY") || ""
    );

    // 1. Separar IDs de usuarios registrados de los emails introducidos a mano
    const idsUsuarios = listaIds.filter(id => isUuid(id));
    const emailsManuales = listaIds.filter(id => !isUuid(id) && id.includes('@'));

    const listaFinalEmails = [];

    // 2. Obtener nombres y emails de los usuarios registrados
    if (idsUsuarios.length > 0) {
      const { data: perfiles, error } = await supabase
        .from('datos_usuarios')
        .select('nombre, email')
        .in('user_id', idsUsuarios);

      if (!error && perfiles) {
        perfiles.forEach(p => {
          if (p.email) listaFinalEmails.push({ email: p.email, nombre: p.nombre || 'Estudiante' });
        });
      }
    }

    // 3. Añadir los emails manuales (les ponemos "Estudiante" por defecto)
    emailsManuales.forEach(email => {
      listaFinalEmails.push({ email: email, nombre: 'Estudiante' });
    });

    // 4. Link directo al curso (ajusta la URL según tu enrutamiento)
    const linkReserva = `${URL_APP}/ReservasCursos?id=${cursoId}`;

    // 5. Enviar correos masivos en paralelo
    const promesasEmails = listaFinalEmails.map(destinatario => {
      const htmlFinal = generarEmailCursoActivoHTML(destinatario.nombre, nombreCurso, linkReserva);
      return sendEmail(destinatario.email, `¡El curso ${nombreCurso} ya está activo! 🎓`, htmlFinal);
    });

    await Promise.all(promesasEmails);

    // 6. Vaciar la lista de espera del curso una vez notificados
    const { error: errorUpdate } = await supabase
      .from('cursos_grupales')
      .update({ lista_espera: [] })
      .eq('id', cursoId);

    if (errorUpdate) {
        console.error("Correos enviados, pero falló el borrado de la lista en DB:", errorUpdate);
    }

    return new Response(JSON.stringify({ success: true, notificados: listaFinalEmails.length }), { status: 200, headers: corsHeaders });

  } catch (err: any) {
    console.error("Error en notify-waitlist:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});