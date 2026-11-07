import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Recibimos el precio y el título directamente de tu web
    const { materialId, titulo, precio, returnUrl, userId } = await req.json()

    if (!materialId || !userId || !precio || !titulo) {
      throw new Error('Faltan datos obligatorios')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: titulo, // El nombre que verá el cliente al pagar
            },
            unit_amount: Math.round(precio * 100), // Stripe exige céntimos (5€ = 500)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: returnUrl,
      cancel_url: returnUrl.replace('?pago=completado', ''),
      client_reference_id: materialId.toString(),
      metadata: {
        tipo: 'material_didactico',
        material_id: materialId.toString(),
        user_id: userId,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})