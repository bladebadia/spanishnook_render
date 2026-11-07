import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================================
// 🎨 1. PLANTILLA HTML CORPORATIVA
// =====================================================================
function generarEmailHTML({ idioma = 'es', tema, titulo, nombre, contenido }: any) {
  const t = {
    es: {
      despedida: '',
      equipo: 'El equipo de SpanishNook',
      derechos: 'Todos los derechos reservados.',
      slogan: 'Creating your SpanishNook, at your pace.'
    },
    en: {
      despedida: '',
      equipo: 'El equipo de SpanishNook',
      derechos: 'Todos los derechos reservados.',
      slogan: 'Creating your SpanishNook, at your pace.'
    }
  }[idioma] || t.en;

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
    <div style="font-family: 'Montserrat', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 40px 20px; color: #333333; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png" alt="Spanish Nook Logo" style="width: 80px; height: auto; border: 0; display: block; margin: 0 auto;">
        <p style="margin: 10px 0 0 0; color: #333333; font-weight: 800; font-size: 18px; letter-spacing: -0.5px;">SpanishNook</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">${tema}</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">${titulo}</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        ${nombre ? `<p>Hola <strong>${nombre}</strong>,</p>` : ''}
        ${contenido}
      </div>

      <div style="margin-top: 40px; font-size: 16px; color: #525553;">
        <p>${t.despedida}</p>
        <p style="margin-bottom: 5px;"><strong>${t.equipo}</strong></p>
        <p style="margin-top: 0; font-size: 14px; color: #888888;">${t.slogan}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
      <div style="text-align: center; font-size: 12px; color: #999999; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">© 2025 Spanish Nook. ${t.derechos}</p>
        <p style="margin: 0;">
          <a href="mailto:contacto@spanishnook.com" style="color: #851319; text-decoration: none;">contacto@spanishnook.com</a> |
          <a href="https://www.spanishnook.com" style="color: #851319; text-decoration: none;">www.spanishnook.com</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// =====================================================================
// 📝 2. LÓGICA DEL CONTENIDO (DICCIONARIO)
// =====================================================================
function obtenerPlantillaEliminarCuenta() {
  // Aquí no dependemos de la variable idioma porque mandamos los dos a la vez
  return {
    asunto: 'Eliminar cuenta / Delete account',
    tema: 'Cuenta Eliminada',
    titulo: '¡No es un adiós... Es un hasta luego! / It\'s not a goodbye... It\'s a see you later!',
    contenido: `
      <div style="margin-bottom: 30px;">
         <p>Hemos procesado tu solicitud de eliminación de cuenta.</p>
         <p>Recuerda que esta acción es irreversible. Tus datos ya han sido eliminados.</p>
         <p>¡Esperamos verte de nuevo!</p>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div>
         <p>We have processed your account deletion request.</p>
         <p>Please note that this action is irreversible. Your data has now been deleted.</p>
         <p>We hope to see you again!</p>
      </div>
    `
  };
}

// =====================================================================
// 🚀 3. EL SERVIDOR (LA FUNCIÓN PRINCIPAL)
// =====================================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Configuración del servidor incompleta" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // 1. OBTENEMOS AL USUARIO ANTES DE BORRARLO
  const { data: userData, error: getUserErr } = await admin.auth.getUser(token);

  if (getUserErr || !userData?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;
  const emailUsuario = userData.user.email;
  let nombreUsuario = "";
  let idiomaUsuario = "es"; // Por defecto

  // Intentamos obtener su nombre e idioma desde la tabla de datos_usuarios (opcional pero queda mejor)
  try {
    const { data: perfil } = await admin
      .from('datos_usuarios')
      .select('nombre')
      .eq('user_id', userId)
      .maybeSingle();

    if (perfil?.nombre) nombreUsuario = perfil.nombre;

    // Si tu frontend envía el idioma en el body, lo usamos. Si no, usamos el fallback.
    const bodyText = await req.text();
    if (bodyText) {
      const bodyParams = JSON.parse(bodyText);
      if (bodyParams.idioma) idiomaUsuario = bodyParams.idioma;
    }
  } catch (e) {
    console.error("No se pudo obtener datos extra del usuario:", e);
  }

  // 2. BORRAMOS LA CUENTA
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);

  if (delErr) {
    return new Response(JSON.stringify({ error: delErr.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. ENVIAMOS EL CORREO CON RESEND
  if (emailUsuario) {
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const plantilla = obtenerPlantillaEliminarCuenta();
        const htmlFinal = generarEmailHTML({
          idioma: idiomaUsuario,
          tema: plantilla.tema,
          titulo: plantilla.titulo,
          nombre: nombreUsuario,
          contenido: plantilla.contenido
        });

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SpanishNook <hola@spanishnook.com>", // Recuerda que usa el alias de envío
            to: [emailUsuario],
            subject: plantilla.asunto,
            html: htmlFinal,
          }),
        });
        console.log(`Correo de eliminación enviado a ${emailUsuario}`);
      }
    } catch (e) {
      console.error("Error enviando email de eliminación (No bloqueante):", e);
    }
  }

  // 4. RESPONDEMOS AL FRONTEND
  return new Response(JSON.stringify({ message: "Cuenta eliminada y correo enviado" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});