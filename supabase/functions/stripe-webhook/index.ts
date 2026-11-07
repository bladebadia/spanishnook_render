import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.20.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient()
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature, x-client-info, apikey",
  "Content-Type": "application/json"
};

const LOGO_URL = "https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png";
const URL_APP = "https://spanishnook.com";

// =====================================================================
// 🎨 1. PLANTILLAS DE CORREO (INDIVIDUAL Y PACKS)
// =====================================================================

function generarEmailCompraIndividual(nombre: string, reservasHtmlES: string, reservasHtmlEN: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Confirmación de compra / Booking Confirmed</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Gracias por tu compra en Spanish Nook! / Thank you for your purchase!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Qué alegría!</p>
        <p>Tu clase en Spanish Nook está confirmada. Aquí tienes los detalles:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${reservasHtmlES}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Acceder a mi área</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* Recuerda: también puedes encontrar esta información en tu área personal.</p>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi <strong>${nombre}</strong>,</p>
        <p>Great news!</p>
        <p>Your Spanish Nook class has successfully been confirmed. Here are the details:</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${reservasHtmlEN}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Go to my area</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* Reminder: you can also find this data in your personal dashboard.</p>
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

function generarEmailCompraPack(nombre: string, cantidad: string | number, tipoES: string, tipoEN: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Pack de Créditos / Credits Pack</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Ya tienes tus créditos! / You now have your credits!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Qué bien!</p>
        <p>Has comprado <strong>${cantidad}</strong> créditos para clases <strong>${tipoES}</strong>. Ahora tienes saldo para canjear por clases cuando tú quieras.</p>
        <p>Revisa tu área personal y reserva nuevas fechas en el calendario.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Acceder a mi área personal</a>
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi <strong>${nombre}</strong>,</p>
        <p>Great!</p>
        <p>You have purchased <strong>${cantidad}</strong> credits for <strong>${tipoEN}</strong> classes. You now have plenty of credits to redeem for classes whenever you want.</p>
        <p>Check your personal area and book new dates on the calendar.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/AreaPersonal" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Access my personal area</a>
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

// 🔄 2. HELPER: CONSEGUIR TOKEN DE GOOGLE (OAuth2)
async function getGoogleAccessToken() {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Faltan credenciales OAuth2 en .env");
  }

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
  if (!res.ok) {
    console.error("❌ Error renovando token Google:", data);
    return null;
  }
  return data.access_token;
}

// 🗓️ 3. HELPER: CREAR EVENTO Y RETORNAR DATOS
async function createMeeting(nombreUsuario: string, emailUsuario: string, fecha: string, hora: string, tipo: string) {
  try {
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
    const accessToken = await getGoogleAccessToken();
    const TIMEZONE = "Europe/Madrid";

    if (!calendarId || !accessToken) {
      console.error("❌ Fallo en credenciales Google o Token");
      return null;
    }

    const [h, m] = hora.split(':').map(Number);
    const finH = h + 1;
    const horaFin = `${String(finH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const startDateTime = `${fecha}T${hora}:00`;
    const endDateTime = `${fecha}T${horaFin}:00`;

    const event = {
      summary: `Spanish Class (${tipo}) - ${nombreUsuario}`,
      description: `Clase reservada via Spanish Nook.\nTipo: ${tipo}\nAlumno: ${emailUsuario}`,
      start: { dateTime: startDateTime, timeZone: TIMEZONE },
      end: { dateTime: endDateTime, timeZone: TIMEZONE },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: emailUsuario ? [{ email: emailUsuario }] : [],
    };

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=none`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error Google API:", data);
      return null;
    }

    return {
      link: data.conferenceData?.entryPoints?.[0]?.uri || null,
      eventId: data.id
    };

  } catch (error) {
    console.error("Error creando meeting:", error);
    return null;
  }
}

// 📧 4. HELPER: EMAILS
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SpanishNook <hola@spanishnook.com>",
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });
  } catch (err) { console.error("Error email:", err); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const stripeSig = req.headers.get("stripe-signature");

    // ==========================================
    // A. WEBHOOK (STRIPE NOTIFICA EL PAGO)
    // ==========================================
    if (stripeSig) {
      const rawBody = await req.text();
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) return new Response("Config Error", { status: 500 });

      let event;
      try {
        event = await stripe.webhooks.constructEventAsync(rawBody, stripeSig, webhookSecret);
      } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        // Extraemos el ID del pago
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

        // ========================================================
        // 🔥 LÓGICA 1: COMPRA DE BONO DE CRÉDITOS
        // ========================================================
        if (session.metadata?.tipo_compra === 'bono_creditos') {
            console.log(`💰 Procesando compra de bono. Sesión: ${session.id}`);

            const userId = session.metadata.user_id;
            const creditosSumar = parseInt(session.metadata.creditos_a_sumar || "0", 10);
            const tipoCredito = session.metadata.tipo_credito;
            const sessionId = session.id;

            // 1. ESCUDO ATÓMICO EN BASE DE DATOS
            // La base de datos es la única que decide si esto se suma o no.
            const { data: fueProcesado, error: errRpc } = await supabase.rpc('procesar_bono_seguro', {
                p_user_id: userId,
                p_session_id: sessionId,
                p_cantidad: creditosSumar,
                p_tipo: tipoCredito
            });

            if (errRpc) {
                console.error("❌ Error CRÍTICO en la base de datos procesando bono:", errRpc);
                return new Response("DB Error", { status: 500 });
            }

            // 2. COMPROBACIÓN DEL ESCUDO
            if (fueProcesado === false) {
                // El SQL detectó que el id_pago ya existía y abortó la suma.
                console.warn(`🛡️ BLOQUEO DE DUPLICADO: La sesión ${sessionId} ya ha sido procesada previamente.`);
                return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200, headers: corsHeaders });
            }

            console.log(`✅ SALDO ACTUALIZADO: +${creditosSumar} créditos tipo ${tipoCredito} para usuario ${userId}`);

            // 3. ENVÍO DE CORREOS (Solo llega aquí si la BD confirmó que es un pago nuevo)
            try {
                // Obtenemos los datos limpios para el email
                const { data: usuarioBD } = await supabase.from('datos_usuarios').select('nombre, email').eq('user_id', userId).single();

                const emailCliente = usuarioBD?.email || session.customer_details?.email;
                const nombreCliente = usuarioBD?.nombre || "Estudiante";
                const tipoES = tipoCredito === 'normal' ? 'individuales' : 'de conversación';
                const tipoEN = tipoCredito === 'normal' ? 'individual' : 'conversation';

                const htmlPack = generarEmailCompraPack(nombreCliente, creditosSumar, tipoES, tipoEN);

                await Promise.all([
                    sendEmail(emailCliente, "Confirmación compra pack de créditos / Credits pack purchase confirmation", htmlPack),
                    sendEmail("paulaf@spanishnook.com", "🔔 ¡Han comprado un Pack de Créditos!", `<p>Alumno: <strong>${nombreCliente}</strong> ha sumado ${creditosSumar} créditos ${tipoES}.</p>`)
                ]);
            } catch (mailErr) {
                console.error("⚠️ Error enviando correos, pero los créditos están a salvo:", mailErr);
            }

            return new Response(JSON.stringify({ received: true, processed: 'bono' }), { status: 200, headers: corsHeaders });
        }

        // ========================================================
        // 🗓️ LÓGICA 2: COMPRA DE RESERVAS INDIVIDUALES
        // ========================================================

        // 🛡️ ESCUDO PARA CLASES INDIVIDUALES 🛡️
        if (paymentIntentId) {
            const { data: yaProcesado } = await supabase
                .from("reservas")
                .select("id")
                .eq("stripe_payment_intent", paymentIntentId)
                .maybeSingle();

            if (yaProcesado) {
                console.log("🛡️ Pago duplicado bloqueado:", paymentIntentId);
                return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200, headers: corsHeaders });
            }
        }

        const userId = session.metadata?.user_id;
        const rawReservas = session.metadata?.reservas ?? "[]";

        // Obtener nombre de la BD para no usar "Miguel2"
        let customerName = "Estudiante";
        const { data: userData } = await supabase.from('datos_usuarios').select('nombre').eq('user_id', userId).maybeSingle();
        if (userData?.nombre) {
            customerName = userData.nombre;
        } else if (session.customer_details?.name) {
            customerName = session.customer_details.name;
        }

        const customerEmail = session.metadata?.user_email || session.customer_details?.email;

        let reservas = [];
        try { reservas = JSON.parse(rawReservas); } catch {}

        if (Array.isArray(reservas) && reservas.length > 0 && userId && paymentIntentId) {

          const { data: ocupadas } = await supabase.from("reservas")
            .select("fecha, hora")
            .eq("estado", "confirmada")
            .in("fecha", reservas.map((r: any) => r.fecha))
            .in("hora", reservas.map((r: any) => r.hora + ":00"));

          if (ocupadas && ocupadas.length > 0) {
            console.log("⚠️ Colisión detectada. Iniciando reembolso...");
            try {
                await stripe.refunds.create({ payment_intent: paymentIntentId });
            } catch (e) {
                console.error("Error procesando reembolso:", e);
            }

            if (customerEmail) {
                await sendEmail(customerEmail, "Reembolso: Hueco no disponible / Refund: Slot not available", `<p>Hola ${customerName}, lo sentimos, el hueco fue ocupado. Hemos emitido el reembolso.</p>`);
            }
            return new Response(JSON.stringify({ error: "Slot taken, refunded" }), { status: 409 });
          }

          let lineItems = [];
          try {
            const sessionExpanded = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items.data'] });
            lineItems = sessionExpanded.line_items?.data || [];
          } catch (e) {}

          const promesasGoogle = reservas.map(async (r: any) => {
             const googleData = await createMeeting(customerName, customerEmail, r.fecha, r.hora, r.tipo);
             return { ...r, googleData };
          });
          const reservasConGoogle = await Promise.all(promesasGoogle);

          const reservasToInsert = [];
          for (let i = 0; i < reservasConGoogle.length; i++) {
             const r = reservasConGoogle[i];
             const precio = lineItems[i] ? lineItems[i].amount_total : (r.tipo === 'conversacion' ? 2700 : 3200);

             reservasToInsert.push({
               fecha: r.fecha,
               hora: r.hora + ":00",
               estado: "confirmada",
               user_id: userId,
               stripe_payment_intent: paymentIntentId,
               precio: precio,
               tipo: r.tipo,
               meet_link: r.googleData?.link || null,
               google_event_id: r.googleData?.eventId || null,
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             });
          }

          const { data: reservasInsertadas, error } = await supabase.from("reservas").insert(reservasToInsert).select();

          if (!error && customerEmail && reservasInsertadas) {
             const listaHtmlES = reservasInsertadas.map((r: any) => {
               const clase = r.tipo === 'normal' ? 'Clase Individual' : 'Clase de Conversación';
               return `<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>Fecha:</strong> ${r.fecha}<br>⏰ <strong>Hora:</strong> ${r.hora.substring(0,5)} (Madrid)<br>🎓 <strong>Tipo:</strong> ${clase}</li>`;
             }).join('');

             const listaHtmlEN = reservasInsertadas.map((r: any) => {
               const clase = r.tipo === 'normal' ? 'Individual Class' : 'Conversation Class';
               return `<li style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">📅 <strong>Date:</strong> ${r.fecha}<br>⏰ <strong>Time:</strong> ${r.hora.substring(0,5)} (Madrid)<br>🎓 <strong>Type:</strong> ${clase}</li>`;
             }).join('');

             const htmlFinalAlumno = generarEmailCompraIndividual(customerName, listaHtmlES, listaHtmlEN);
             await sendEmail(customerEmail, "Confirmación compra en Spanish Nook / Purchase Confirmation", htmlFinalAlumno);

             const resumenPaula = reservasInsertadas.map((r: any) => `<li>📅 <b>${r.fecha}</b> a las <b>${r.hora.substring(0,5)}</b><br>👤 ${customerName} (${customerEmail})<br>🎓 Tipo: ${r.tipo}</li>`).join('<br>');

             await sendEmail("paulaf@spanishnook.com", "🔔 ¡Nueva Reserva (Pago Directo)!", `
               <div style="font-family: sans-serif; color: #333;">
                 <h2 style="color: #60aad8;">¡Tienes clase nueva!</h2>
                 <p>Un alumno ha reservado pagando directamente:</p>
                 <ul>${resumenPaula}</ul>
                 <p>Revisa tu Google Calendar.</p>
               </div>
             `);
          }
        }

        // ========================================================
        // 📚 LÓGICA 3: COMPRA DE MATERIALES DIDÁCTICOS (PDF)
        // ========================================================
        if (session.metadata?.tipo === 'material_didactico') {
            console.log(`📚 Procesando compra de material. Sesión: ${session.id}`);

            const userId = session.metadata.user_id;
            const materialId = parseInt(session.metadata.material_id, 10);

            if (!userId || !materialId) {
                console.error("❌ Faltan datos en los metadatos de Stripe para el material.");
                return new Response("Faltan datos", { status: 400 });
            }

            // Insertamos la compra ajustada a tus columnas reales
            const { error: errorCompra } = await supabase
                .from('compras_materiales')
                .insert({
                    user_id: userId,
                    material_id: materialId
                });

            if (errorCompra) {
                if (errorCompra.code === '23505') {
                    console.log("⚠️ El usuario ya tenía este material comprado.");
                    return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200, headers: corsHeaders });
                }
                console.error("❌ Error guardando la compra del material:", errorCompra);
                return new Response("DB Error", { status: 500 });
            }

            console.log(`✅ Material ${materialId} desbloqueado para el usuario ${userId}`);
            return new Response(JSON.stringify({ received: true, processed: 'material' }), { status: 200, headers: corsHeaders });
        }
      } // <--- ¡AQUÍ SE CIERRA EL CHECKOUT.SESSION.COMPLETED!

      // REEMBOLSOS
      if (event.type === "charge.refunded") {
         const charge = event.data.object as any;
         if(charge.payment_intent) {
           await supabase.from("reservas").update({ estado: "cancelada" }).eq("stripe_payment_intent", charge.payment_intent);
         }
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });
    }

    // ==========================================
    // B. FRONTEND (CREAR SESIÓN DE PAGO INDIVIDUAL)
    // ==========================================
    const body = await req.json().catch(() => null);
    if (!body) return new Response("Invalid JSON", { status: 400, headers: corsHeaders });

    const { reservas, user_id, user_email } = body;
    if (!reservas) return new Response("Missing data", { status: 400, headers: corsHeaders });

    const line_items = reservas.map((reserva: any) => {
        const esNormal = reserva.tipo === 'normal';
        return {
          price_data: {
            currency: 'eur',
            product_data: { name: `${esNormal ? 'Clase General' : 'Clase Conversación'} (${reserva.fecha})` },
            unit_amount: esNormal ? 3200 : 2700,
          },
          quantity: 1,
        };
    });

    const origin = req.headers.get("origin") || "http://localhost:9000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${origin}/AreaPersonal?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/CarritoCompra`,
      metadata: {
        reservas: JSON.stringify(reservas),
        user_id,
        user_email
      }
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders });

  } catch (err: any) {
    console.error("Server Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});