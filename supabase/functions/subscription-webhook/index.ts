// supabase/functions/subscription-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.20.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SERVICE_ROLE_KEY") || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature, x-client-info, apikey",
  "Content-Type": "application/json",
};

// URL DEL LOGO Y APP
const LOGO_URL = "https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png";
const URL_APP = "https://spanishnook.com";

// =====================================================================
// 🎨 1. PLANTILLAS DE CORREO - BILINGÜES PARA CURSOS
// =====================================================================
function generarEmailSuscripcionCreada(nombre: string, nombreCurso: string, diasStrES: string, diasStrEN: string, horaStr: string, linkMaestro: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Suscripción confirmada / Subscription confirmed</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Gracias por unirte al curso! / Thank you for joining the course!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>¡Qué alegría tenerte con nosotros!</p>
        <p>¡Gracias por suscribirte al curso!</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <p style="margin-top: 0;">A partir de ahora nos veremos cada semana en <strong>${nombreCurso}</strong>.</p>
           <p style="margin-bottom: 0;">Todos los <strong>${diasStrES}</strong> a las <strong>${horaStr}</strong></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkMaestro !== '#' ? linkMaestro : `${URL_APP}/AreaPersonal`}" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Unirme al curso</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* Este enlace es único para el curso.</p>
        <p style="font-size: 14px; color: #888888;">* Recuerda: también puedes encontrar esta información en tu área personal.</p>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi <strong>${nombre}</strong>,</p>
        <p>We are happy to have you!</p>
        <p>Thank you for subscribing to the course!</p>

        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <p style="margin-top: 0;">From now on we will see each other every week at <strong>${nombreCurso}</strong>.</p>
           <p style="margin-bottom: 0;">Every <strong>${diasStrEN}</strong> at <strong>${horaStr}</strong></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkMaestro !== '#' ? linkMaestro : `${URL_APP}/AreaPersonal`}" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Join course</a>
        </div>

        <p style="font-size: 14px; color: #888888;">* This is the permanent link for the course.</p>
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

function generarEmailDespedidaCurso(nombre: string, nombreCurso: string) {
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
        <span style="color: #851319; text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">Fin de Suscripción / End of Subscription</span>
        <h1 style="color: #333333; font-size: 26px; margin: 10px 0 0 0; font-weight: 800;">¡Hasta pronto! / See you soon!</h1>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>El periodo de tu suscripción a <strong>${nombreCurso}</strong> ha terminado hoy.</p>
        <p>Esperamos verte de nuevo muy pronto. Tu plaza te estará esperando.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/Cursos" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Ver Cursos</a>
        </div>
      </div>

      <hr style="border: none; border-top: 1px dashed #eeeeee; margin: 40px 0;">

      <div style="font-size: 16px; line-height: 1.6; color: #525553;">
        <p>Hi <strong>${nombre}</strong>,</p>
        <p>Your subscription period for <strong>${nombreCurso}</strong> has ended today.</p>
        <p>We hope to see you again very soon. Your spot will be waiting for you.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${URL_APP}/Cursos" style="background-color: #851319; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">View Courses</a>
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

// 📧 HELPER EMAILS
async function sendEmail(to: string, subject: string, htmlContent: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return console.error("❌ Falta RESEND_API_KEY");

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
    console.log(`📧 Email enviado a ${to}`);
  } catch (err) {
    console.error("❌ Error enviando email:", err);
  }
}

const toISO = (ts: number | null | undefined) =>
  ts ? new Date(ts * 1000).toISOString() : new Date().toISOString();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const stripeSig = req.headers.get("stripe-signature");

    if (stripeSig) {
      const rawBody = await req.text();
      const webhookSecret = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET");
      let event;

      try {
        event = await stripe.webhooks.constructEventAsync(rawBody, stripeSig, webhookSecret!);
      } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }

      try {
        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated":
            const sub = event.data.object;
            await syncSubscription(sub.id);

            // 📧 BIENVENIDA (CREATED)
            if (event.type === "customer.subscription.created") {
                const customer = await stripe.customers.retrieve(sub.customer as string);

                // @ts-ignore
                if (customer.email) {

                    // ===============================================
                    // CORRECCIÓN: Obtener nombre real
                    // ===============================================
                    let nombre = "Estudiante";
                    if (sub.metadata?.user_id) {
                        const { data: usuarioBD } = await supabase
                            .from('datos_usuarios')
                            .select('nombre')
                            .eq('user_id', sub.metadata.user_id)
                            .maybeSingle();
                        if (usuarioBD?.nombre) nombre = usuarioBD.nombre;
                    } else {
                        // @ts-ignore
                        nombre = customer.name || "Estudiante";
                    }

                    // ===============================================
                    // LÓGICA DE CURSO Y HORA
                    // ===============================================
                    const { data: cursoData, error: errCurso } = await supabase
                      .from('cursos_grupales')
                      .select('nombre_curso, meet_link, google_event_id, dias_semana, horarios_curso')
                      .eq('id', sub.metadata.course_id)
                      .single();

                    if (errCurso) {
                        console.error("❌ Error DB buscando curso:", errCurso);
                    }

                    const nombreCurso = cursoData?.nombre_curso || "tu curso";
                    const linkMaestro = cursoData?.meet_link || '#';

                    // ======================================================
                    // 🔥 LOS DÍAS TRADUCIDOS
                    // ======================================================
                    let diasStrES = "los días acordados";
                    let diasStrEN = "the agreed days";

                    const diccDias: Record<string, string> = {
                        'lunes': 'Monday', 'martes': 'Tuesday', 'miercoles': 'Wednesday', 'miércoles': 'Wednesday',
                        'jueves': 'Thursday', 'viernes': 'Friday', 'sabado': 'Saturday', 'sábado': 'Saturday', 'domingo': 'Sunday'
                    };

                    const rawDias = cursoData?.dias_semana;
                    if (rawDias) {
                        let arrayDias: string[] = [];
                        if (Array.isArray(rawDias)) {
                            arrayDias = rawDias;
                        } else if (typeof rawDias === 'string') {
                            try { arrayDias = JSON.parse(rawDias); }
                            catch(e) { arrayDias = [rawDias]; }
                        }

                        if (arrayDias.length > 0) {
                            diasStrES = arrayDias.join(', ');
                            diasStrEN = arrayDias.map(d => {
                                const limpio = d.toLowerCase().trim();
                                return diccDias[limpio] || d;
                            }).join(', ');
                        }
                    }

                    // ======================================================
                    // 🔥 LA HORA (EXTRACCIÓN BLINDADA CON EXPRESIÓN REGULAR)
                    // ======================================================
                    let horaStr = "la hora acordada";
                    const rawHora = cursoData?.horarios_curso;

                    if (rawHora) {
                        const horaStringified = String(rawHora);
                        const matchHora = horaStringified.match(/\d{2}:\d{2}/);

                        if (matchHora) {
                            horaStr = matchHora[0];
                        } else {
                            horaStr = horaStringified.substring(0, 5);
                        }
                    } // <-- Aquí faltaba esta llave de cierre en el código anterior

                    // 📅 INVITACIÓN A GOOGLE CALENDAR
                    // @ts-ignore
                    if (cursoData?.google_event_id && customer.email) {
                        // @ts-ignore
                        console.log(`📅 Intentando invitar a ${customer.email} al evento ${cursoData.google_event_id}...`);
                        try {
                            const inviteUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/crear-meet`;

                            const resInvite = await fetch(inviteUrl, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    action: 'add_attendee',
                                    eventId: cursoData.google_event_id,
                                    // @ts-ignore
                                    email: customer.email
                                })
                            });

                            if (!resInvite.ok) {
                                const errorText = await resInvite.text();
                                console.error(`❌ FALLÓ LA INVITACIÓN AL CALENDARIO: ${resInvite.status} - ${errorText}`);
                            } else {
                                console.log("✅ Invitación de calendario aceptada por Google.");
                            }

                        } catch (calErr) {
                            console.error("⚠️ Error de red invitando al calendario:", calErr);
                        }
                    }

                    // 📨 ENVIAR CORREO HTML
                    const htmlSuscripcion = generarEmailSuscripcionCreada(nombre, nombreCurso, diasStrES, diasStrEN, horaStr, linkMaestro);
                    // @ts-ignore
                    await sendEmail(customer.email, `Suscripción confirmada / Subscription confirmed 🎓`, htmlSuscripcion);

                    // 🔥 B. Email a PAULA
                    await sendEmail("paulaf@spanishnook.com", "🔔 ¡Nuevo Alumno en Curso!", `
                        <div style="font-family: sans-serif; color: #333;">
                          <h2 style="color: #60aad8;">¡Tienes clase nueva!</h2>
                          <p><strong>${nombre}</strong> (${customer.email}) se ha apuntado a <strong>${nombreCurso}</strong>.</p>
                        </div>
                    `);
                }
            }
            break;

          case "invoice.payment_succeeded":
            const invoice = event.data.object;
            if (invoice.subscription) await syncSubscription(invoice.subscription as string);
            break;

          case "customer.subscription.deleted":
            const deletedSub = event.data.object;
            await deleteSubscription(deletedSub.id);

            // 📧 DESPEDIDA (DELETED)
            const customerDeleted = await stripe.customers.retrieve(deletedSub.customer as string);
            // @ts-ignore
            if (customerDeleted.email) {
                // Obtener nombre real
                let nombreDel = "Estudiante";
                if (deletedSub.metadata?.user_id) {
                    const { data: usuarioBD } = await supabase.from('datos_usuarios').select('nombre').eq('user_id', deletedSub.metadata.user_id).maybeSingle();
                    if (usuarioBD?.nombre) nombreDel = usuarioBD.nombre;
                } else {
                    // @ts-ignore
                    nombreDel = customerDeleted.name || "Estudiante";
                }

                const { data: cursoDel } = await supabase
                    .from('cursos_grupales')
                    .select('nombre_curso')
                    .eq('id', deletedSub.metadata.course_id)
                    .single();

                const nombreCursoDel = cursoDel?.nombre_curso || "el curso";

                const htmlDespedida = generarEmailDespedidaCurso(nombreDel, nombreCursoDel);
                // @ts-ignore
                await sendEmail(customerDeleted.email, "Tu suscripción ha finalizado / Subscription Ended 👋", htmlDespedida);
            }
            break;
        }
      } catch (err) {
        console.error("❌ Error DB/Email:", err);
      }

      return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });
    }

    // ---------------------------------------------------------
    // 2. FRONTEND API (CREAR SESIÓN DE PAGO)
    // ---------------------------------------------------------
    const body = await req.json();

    if (body.action === 'toggle_cancel') {
      const { subscriptionId, cancel } = body;
      try {
        const updatedSub = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancel });
        await syncSubscription(updatedSub.id);
        return new Response(JSON.stringify({ success: true, status: updatedSub.status, cancel_at_period_end: updatedSub.cancel_at_period_end }), { status: 200, headers: corsHeaders });
      } catch (err: any) { return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders }); }
    }

    if (body.action === 'get_price_details') {
      try {
        const price = await stripe.prices.retrieve(body.priceId);
        return new Response(JSON.stringify({ amount: price.unit_amount, currency: price.currency }), { status: 200, headers: corsHeaders });
      } catch { return new Response(JSON.stringify({ error: "No encontrado" }), { status: 400, headers: corsHeaders }); }
    }

    const { priceId, user_id, customer_email, customer_name, course_id } = body;
    if (!priceId) return new Response("Faltan datos", { status: 400, headers: corsHeaders });

    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customer = customers.data[0];

    // Si creamos cliente nuevo, guardamos metadatos también
    if (!customer) customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        metadata: { user_id }
    });

    const origin = req.headers.get("origin") || "http://localhost:9000";
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
          metadata: {
              user_id,
              course_id: String(course_id)
          }
      },
      success_url: `${origin}/AreaPersonal?success=true`,
      cancel_url: `${origin}/AreaPersonal?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

// FUNCIONES DB
async function syncSubscription(subId: string) {
  const sub = await stripe.subscriptions.retrieve(subId);
  const { user_id, course_id } = sub.metadata;

  if (!user_id || !course_id) {
      console.error("❌ Subscription missing metadata:", subId);
      return;
  }

  await supabase.from("user_subscriptions").upsert({
    user_id,
    course_id: parseInt(course_id),
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer as string,
    estado: sub.status,
    cancel_at_period_end: sub.cancel_at_period_end,
    current_period_start: toISO(sub.current_period_start),
    current_period_end: toISO(sub.current_period_end),
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });
}

async function deleteSubscription(subId: string) {
  await supabase.from("user_subscriptions").update({ estado: "canceled", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subId);
}