/**
 * create-bono-checkout — Checkout de Stripe para comprar un pack de créditos.
 *
 * Requiere sesión. El precio y los créditos salen de la lista blanca PACKS (servidor);
 * la web solo elige el pack, por su id ('general-5'...) o por su price id de Stripe.
 *
 * Petición: POST { packId?: string, priceId?: string, successUrl?: string, cancelUrl?: string, idioma?: 'es'|'en' }
 * Respuesta: { url }
 * Metadata para stripe-webhook: { tipo_compra: 'bono_creditos', user_id, creditos_a_sumar, tipo_credito }
 */
import { errores, json, leerJson, origenSeguro, preflight, urlPermitida, usuarioDesdePeticion } from "../_shared/auth.ts";
import { clienteStripe } from "../_shared/stripe.ts";
import { idiomaDesde } from "../_shared/correo-comun.ts";

interface Pack {
  priceId: string;
  creditos: number;
  tipo: "normal" | "conversacion";
}

// Mismos packs que src/pages/ComprarPacks.vue (packsNormales / packsConversacion)
const PACKS: Record<string, Pack> = {
  "general-5": { priceId: "price_1T5z33PqNYrMmXl35sDcDBn1", creditos: 5, tipo: "normal" },
  "general-10": { priceId: "price_1T5z2ZPqNYrMmXl3PJsL4MLR", creditos: 10, tipo: "normal" },
  "conversacion-5": { priceId: "price_1T5z23PqNYrMmXl3PVDgH9Nv", creditos: 5, tipo: "conversacion" },
  "conversacion-10": { priceId: "price_1T5z1OPqNYrMmXl3fI17X5C8", creditos: 10, tipo: "conversacion" },
};

function buscarPack(packId: unknown, priceId: unknown): Pack | null {
  if (typeof packId === "string" && Object.hasOwn(PACKS, packId)) return PACKS[packId];
  if (typeof priceId === "string") return Object.values(PACKS).find((p) => p.priceId === priceId) ?? null;
  return null;
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();

    const body = await leerJson(req);
    const pack = buscarPack(body?.packId, body?.priceId);
    if (!pack) return errores.entrada("Pack no válido.");

    const origen = origenSeguro(req);
    // Solo se guarda el idioma si la web lo manda; si no, el webhook usa el del perfil
    const idioma = idiomaDesde(body?.idioma);
    const session = await clienteStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: urlPermitida(body?.successUrl, `${origen}/AreaPersonal`),
      cancel_url: urlPermitida(body?.cancelUrl, `${origen}/ComprarPacks`),
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        tipo_compra: "bono_creditos",
        creditos_a_sumar: String(pack.creditos),
        tipo_credito: pack.tipo,
        ...(idioma ? { idioma } : {}),
      },
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("[create-bono-checkout] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno("No se pudo iniciar el pago.");
  }
});
