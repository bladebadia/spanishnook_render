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
// 🎨 PLANTILLA DE CORREO - CANJEAR CRÉDITOS
// =====================================================================
function generarEmailCanjeCreditos(nombre: string, numCreditos: number, listaItemsES: string, listaItemsEN: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Reserva confirmada / Booking confirmed</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Has canjeado ${numCreditos} créditos! / You have redeemed ${numCreditos} credits!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>¡Hola, <strong>${nombre}</strong>!</p>
        <p>Has canjeado correctamente tus ${numCreditos} créditos. Aquí tienes el resumen de tu compra:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${listaItemsES}
          </ul>
        </div>

        <p>Ya puedes visualizar estas clases en tu área personal.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Ir a mi área</a>
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi, <strong>${nombre}</strong>!</p>
        <p>You have successfully redeemed your ${numCreditos} credits. Here is a summary of your purchase:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${listaItemsEN}
          </ul>
        </div>

        <p>You can now view these classes in your personal area.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Go to my area</a>
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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
        from: "SpanishNook <hola@spanishnook.com>", // Corregido a contacto
        to: [to],
        subject,
        html: htmlContent
    }),
  });

  if(!res.ok) {
      const errorData = await res.json();
      console.error("Error Resend:", errorData);
      throw new Error("Fallo al enviar email");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { reservas, userId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { data: usuario, error } = await supabase
      .from('datos_usuarios')
      .select('email, nombre')
      .eq('user_id', userId)
      .single();

    if (error || !usuario) throw new Error("Usuario no encontrado");

    // 1. Generamos las listas HTML con ENLACES DE VIDEO (ES y EN)
    const listaItemsES = reservas.map((r: any) => {
        const tipoTexto = r.tipo === 'normal' ? 'Clase Individual' : 'Clase de Conversación';

        const linkHtml = r.meet_link
            ? `<br><a href="${r.meet_link}" style="color: #60aad8; text-decoration: none; font-weight: bold;">🎥 Unirse a la videollamada</a>`
            : '';

        return `<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>${r.fecha}</strong> a las <strong>${r.hora.substring(0,5)}</strong> (Madrid)<br>🎓 <strong>${tipoTexto}</strong>${linkHtml}</li>`;
    }).join('');

    const listaItemsEN = reservas.map((r: any) => {
        const tipoTexto = r.tipo === 'normal' ? 'Individual Class' : 'Conversation Class';

        const linkHtml = r.meet_link
            ? `<br><a href="${r.meet_link}" style="color: #60aad8; text-decoration: none; font-weight: bold;">🎥 Join video call</a>`
            : '';

        return `<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>${r.fecha}</strong> at <strong>${r.hora.substring(0,5)}</strong> (Madrid)<br>🎓 <strong>${tipoTexto}</strong>${linkHtml}</li>`;
    }).join('');

    const numCreditos = reservas.length;
    const nombre = usuario.nombre || "Estudiante";

    // 2. Generamos el HTML Final con la plantilla
    const htmlAlumno = generarEmailCanjeCreditos(nombre, numCreditos, listaItemsES, listaItemsEN);

    // 3. Enviar al alumno
    await sendEmail(usuario.email, `Canjeaste tus créditos en SpanishNook / You redeemed your credits on SpanishNook`, htmlAlumno);

    // 4. Enviar a PAULA (Aviso interno)
    const resumenPaula = reservas.map((r: any) =>
        `<li>📅 <b>${r.fecha}</b> a las <b>${r.hora.substring(0,5)}</b><br>👤 ${nombre} (${usuario.email})<br>🎓 Tipo: ${r.tipo || 'Créditos'}</li>`
    ).join('<br>');

    await sendEmail(
        "paulaf@spanishnook.com",
        "🔔 ¡Nueva Reserva (Créditos)!",
        `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #b897cb;">¡Tienes clase nueva!</h2>
          <p>Un alumno ha reservado usando sus CRÉDITOS:</p>
          <ul>${resumenPaula}</ul>
          <p>Revisa tu Google Calendar.</p>
        </div>
        `
    );

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});