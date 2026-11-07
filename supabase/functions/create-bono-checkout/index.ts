// Usamos la versión específica para Deno de Stripe para evitar conflictos
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. GESTIÓN DE CORS (Preflight) - Lo primero de todo
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. LOG DE ARRANQUE (Si no sale esto, es que falla la importación de Stripe)
    console.log("🟢 Función create-bono-checkout iniciada");

    const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_KEY) {
        throw new Error("Falta la variable STRIPE_SECRET_KEY");
    }

    const stripe = new Stripe(STRIPE_KEY, {
      apiVersion: '2023-10-16', // Usamos una versión estable reciente
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 3. PARSEAR BODY
    const body = await req.json();
    const { priceId, userId, userEmail, packCreditos, packTipo, successUrl, cancelUrl } = body;

    console.log(`🛒 Creando sesión para: ${userEmail}, Precio: ${priceId}`);

    // 4. CREAR SESIÓN STRIPE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        user_id: userId,
        tipo_compra: 'bono_creditos',
        creditos_a_sumar: String(packCreditos), // Convertir a string por seguridad
        tipo_credito: packTipo
      },
    })

    console.log("✅ Sesión creada:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("🔥 ERROR CRÍTICO:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})