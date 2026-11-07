import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOGO_URL = "https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png";
const URL_APP = "https://spanishnook.com";

// =====================================================================
// 🎨 PLANTILLA HTML CORPORATIVA (BILINGÜE) - CURSO FINALIZADO
// =====================================================================
function generarEmailCierreCursoHTML(nombreAlumno: string, nombreCurso: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Finalización curso / Course completion</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Cerramos el curso! / We're closing the course!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>¡Hola, <strong>${nombreAlumno}</strong>!</p>
        <p>Este curso <strong>${nombreCurso}</strong> se ha finalizado por parte del equipo de dirección.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">No te preocupes, el dinero proporcional correspondiente a tu fecha de suscripción te será reembolsado en los próximos días.</p>
        </div>
        <p>¡Gracias por haber sido parte de la familia de SpanishNook!</p>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hello, <strong>${nombreAlumno}</strong>!</p>
        <p>This <strong>${nombreCurso}</strong> course has been discontinued by the management team.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Don't worry, the pro-rata amount corresponding to your subscription date will be refunded to you in the coming days.</p>
        </div>
        <p>Thank you for being part of the SpanishNook family!</p>
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

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SpanishNook <hola@spanishnook.com>",
        to: [to],
        subject,
        html: htmlContent
      }),
    });
  } catch (e) { console.error("Email error:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !serviceKey) {
      throw new Error("Faltan claves de configuración en Supabase.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Falta autorización");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error("Usuario no autorizado");

    const { courseId } = await req.json();
    if (!courseId) throw new Error("Falta courseId");

    console.log(`🔒 Cerrando curso con REEMBOLSO + BORRADO CALENDAR + EMAIL: ${courseId}`);

    // 1. RECUPERAR DATOS DEL CURSO
    const { data: cursoData, error: cursoError } = await supabase
        .from('cursos_grupales')
        .select('nombre_curso, google_event_id, estado_curso')
        .eq('id', courseId)
        .single();

    if (cursoError) throw cursoError;

    // 2. BUSCAR SUSCRIPCIONES ACTIVAS
    const { data: suscripciones, error: dbError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, user_id')
      .eq('course_id', courseId)
      .in('estado', ['active', 'trialing']);

    if (dbError) throw dbError;

    const resultados = [];

    // 3. PROCESAR REEMBOLSOS Y EMAILS
    if (suscripciones && suscripciones.length > 0) {
      const now = Math.floor(Date.now() / 1000);

      for (const subRecord of suscripciones) {
        try {
          const sub = await stripe.subscriptions.retrieve(subRecord.stripe_subscription_id);
          let refundedAmount = 0;

          if (sub.status === 'active' && sub.current_period_end > now) {
            const latestInvoice = await stripe.invoices.retrieve(sub.latest_invoice as string);

            if (latestInvoice.payment_intent && latestInvoice.amount_paid > 0) {
              const totalDuration = sub.current_period_end - sub.current_period_start;
              const remainingDuration = sub.current_period_end - now;
              const refundRatio = remainingDuration / totalDuration;
              const amountToRefund = Math.floor(latestInvoice.amount_paid * refundRatio);

              if (amountToRefund > 0) {
                await stripe.refunds.create({
                  payment_intent: latestInvoice.payment_intent as string,
                  amount: amountToRefund,
                  reason: 'requested_by_customer',
                  metadata: { reason_custom: 'Curso finalizado por la academia' }
                });
                refundedAmount = amountToRefund;
              }
            }
          }

          // Cancelar suscripción
          await stripe.subscriptions.cancel(sub.id, { prorate: false });
          // Marcar como cancelado en BD
          await supabase.from('user_subscriptions').update({ estado: 'canceled' }).eq('stripe_subscription_id', sub.id);

          // 📧 OBTENER USUARIO Y ENVIAR EMAIL DE DESPIDO
          const { data: usuarioBD } = await supabase.from('datos_usuarios').select('nombre, email').eq('user_id', subRecord.user_id).single();
          if (usuarioBD && usuarioBD.email) {
             const nombreAlumno = usuarioBD.nombre || 'Estudiante';
             const htmlEmail = generarEmailCierreCursoHTML(nombreAlumno, cursoData.nombre_curso);
             await sendEmail(usuarioBD.email, "Finalización curso / Course completion", htmlEmail);
          }

          resultados.push({
            userId: subRecord.user_id,
            status: 'refunded_card',
            amount: refundedAmount / 100
          });

        } catch (err: any) {
          console.error(`Error procesando usuario ${subRecord.user_id}:`, err.message);
          resultados.push({ userId: subRecord.user_id, status: 'error', error: err.message });
        }
      }
    }

    // 4. BORRAR EVENTO GOOGLE CALENDAR
    if (cursoData?.google_event_id) {
        console.log(`🗑️ Borrando evento Google: ${cursoData.google_event_id}`);
        try {
            const functionsUrl = `${supabaseUrl}/functions/v1/crear-meet`;
            const resCalendar = await fetch(functionsUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'delete', eventId: cursoData.google_event_id })
            });

            if (!resCalendar.ok) console.error("Error llamando a crear-meet (delete):", await resCalendar.text());
        } catch (calErr) {
            console.error("Excepción borrando calendario:", calErr);
        }
    }

    // 5. CERRAR CURSO EN BD
    await supabase
      .from('cursos_grupales')
      .update({ estado_curso: 'Completo', visibilidad: false })
      .eq('id', courseId);

    return new Response(
      JSON.stringify({ success: true, procesados: resultados }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("CRASH:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});