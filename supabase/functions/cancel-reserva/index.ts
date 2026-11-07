import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

const LOGO_URL = "https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png";
const URL_APP = "https://spanishnook.com";

// =====================================================================
// 🎨 1. PLANTILLA HTML CORPORATIVA (BILINGÜE)
// =====================================================================
function generarEmailCancelacionHTML(nombre: string, reservasHtmlES: string, reservasHtmlEN: string, cantidad: number) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Cancelación / Cancellation</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Cancelación confirmada! / Cancellation confirmed!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Has cancelado las siguientes clases:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${reservasHtmlES}
          </ul>
        </div>

        <p style="color: green; font-weight: bold; font-size: 18px; text-align: center;">+${cantidad} Créditos Recuperados</p>
        <p>Tu saldo ha sido actualizado. Tus huecos en el calendario han quedado libres.</p>
        <p>¡No te preocupes, nos vemos en otro momento!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Ir a mi área</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* Recuerda: los créditos aparecerán actualizados automáticamente en tu área personal.</p>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi <strong>${nombre}</strong>,</p>
        <p>You cancelled the following lessons:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${reservasHtmlEN}
          </ul>
        </div>

        <p style="color: green; font-weight: bold; font-size: 18px; text-align: center;">+${cantidad} Recovered Credits</p>
        <p>Your balance has been updated. Your calendar slots have become available.</p>
        <p>Don't worry, we'll see each other another time!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Go to my area</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* Reminder: Your credits will automatically appear updated in your personal area.</p>
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

// 🔄 2. HELPER: OBTENER TOKEN DE GOOGLE (OAuth2)
async function getGoogleAccessToken() {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) return null;

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  return res.ok ? data.access_token : null;
}

// 🗓️ 3. HELPER: BORRAR EVENTO DE GOOGLE
async function borrarEventoGoogle(googleEventId: string, accessToken: string) {
  if (!googleEventId || !accessToken) return;
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");

  try {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${googleEventId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
  } catch (e) { console.error("Error Google Delete:", e); }
}

// 📧 4. HELPER: ENVIAR EMAIL
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SpanishNook <hola@spanishnook.com>", // Corregido a contacto
        to: [to],
        subject,
        html: htmlContent
      }),
    });
  } catch (e) { console.error("Email error:", e); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const { reservaId, reservaIds } = await req.json();

    let idsProcesar: string[] = [];
    if (reservaIds && Array.isArray(reservaIds)) idsProcesar = reservaIds;
    else if (reservaId) idsProcesar = [reservaId];

    if (idsProcesar.length === 0) return new Response(JSON.stringify({ error: "No IDs provided" }), { status: 400, headers: corsHeaders });

    const { data: reservas, error } = await supabase
      .from("reservas")
      .select("*")
      .in("id", idsProcesar)
      .eq("estado", "confirmada");

    if (error || !reservas || reservas.length === 0) {
      return new Response(JSON.stringify({ error: "Reservas no encontradas" }), { status: 404, headers: corsHeaders });
    }

    const accessToken = await getGoogleAccessToken();
    const ahora = new Date();

    const canceladasES = [];
    const canceladasEN = [];
    const fallidas = [];
    let creditosRecuperados = 0;
    let userId = "";

    // BUCLE MAESTRO
    for (const reserva of reservas) {
        userId = reserva.user_id;

        const fechaClase = new Date(`${reserva.fecha}T${reserva.hora}`);
        const diffHoras = (fechaClase.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (diffHoras < 24) {
            fallidas.push(`${reserva.fecha} ${reserva.hora} (Menos de 24h)`);
            continue;
        }

        try {
            const { error: rpcError } = await supabase.rpc('devolver_credito', {
                user_uuid: reserva.user_id,
                tipo_clase: reserva.tipo
            });

            if (rpcError) throw rpcError;
            creditosRecuperados++;

            if (reserva.google_event_id && accessToken) {
                await borrarEventoGoogle(reserva.google_event_id, accessToken);
            }

            await supabase.from("reservas").delete().eq("id", reserva.id);

            // Preparar las listas para el email bilingüe
            const horaCorta = reserva.hora.substring(0,5);

            const tipoES = reserva.tipo === 'normal' ? 'Clase Individual' : 'Conversación';
            canceladasES.push(`<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>Fecha:</strong> ${reserva.fecha}<br>⏰ <strong>Hora:</strong> ${horaCorta} (Madrid)<br>🎓 <strong>Tipo:</strong> ${tipoES}</li>`);

            const tipoEN = reserva.tipo === 'normal' ? 'Individual Class' : 'Conversation';
            canceladasEN.push(`<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>Date:</strong> ${reserva.fecha}<br>⏰ <strong>Time:</strong> ${horaCorta} (Madrid)<br>🎓 <strong>Type:</strong> ${tipoEN}</li>`);

        } catch (e) {
            console.error(`Error cancelando reserva ${reserva.id}`, e);
            fallidas.push(`${reserva.fecha} (Error técnico)`);
        }
    }

    // ENVIAR EMAIL RESUMEN
    if (canceladasES.length > 0) {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        const userEmail = userData.user?.email || "";

        if (userEmail) {
            // Buscamos el nombre del usuario en BD para un saludo personal
            let nombreUsuario = "Estudiante";
            const { data: perfil } = await supabase.from('datos_usuarios').select('nombre').eq('user_id', userId).maybeSingle();
            if (perfil?.nombre) nombreUsuario = perfil.nombre;

            const listaHtmlES = canceladasES.join("");
            const listaHtmlEN = canceladasEN.join("");

            const htmlFinal = generarEmailCancelacionHTML(nombreUsuario, listaHtmlES, listaHtmlEN, creditosRecuperados);

            await sendEmail(
                userEmail,
                "Cancelación de clase(s) / Class cancellation",
                htmlFinal
            );

            // Opcional: Aviso interno a Paula si quieres llevar el control
            await sendEmail(
                "paulaf@spanishnook.com",
                "🔔 ¡Clase cancelada por alumno!",
                `<p>El alumno <strong>${nombreUsuario}</strong> (${userEmail}) ha cancelado clases en el sistema y recuperado ${creditosRecuperados} crédito(s).</p>`
            );
        }
    }

    return new Response(JSON.stringify({
        success: true,
        canceladas: canceladasES.length,
        fallidas: fallidas.length,
        creditos: creditosRecuperados
    }), { status: 200, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});