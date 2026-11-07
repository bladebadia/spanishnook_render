/**
 * checkout-material — Checkout de Stripe para comprar un material didáctico (PDF).
 *
 * Requiere sesión. De la web solo se usa el id del material: título y precio salen
 * de materiales_didacticos. Los materiales gratuitos (precio < 0,50 €) no pasan por Stripe.
 *
 * Petición: POST { materialId: number, returnUrl?: string, idioma?: 'es'|'en' }
 * Respuesta: { url }
 * Metadata para stripe-webhook: { tipo: 'material_didactico', material_id, user_id }
 */
import {
  clienteAdmin,
  enteroPositivo,
  errores,
  json,
  leerJson,
  origenSeguro,
  preflight,
  urlPermitida,
  usuarioDesdePeticion,
} from "../_shared/auth.ts";
import { clienteStripe } from "../_shared/stripe.ts";
import { idiomaDesde } from "../_shared/correo-comun.ts";

const PRECIO_MINIMO_EUR = 0.5; // mínimo de Stripe

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return errores.metodo();

  try {
    const user = await usuarioDesdePeticion(req);
    if (!user) return errores.sinSesion();

    const body = await leerJson(req);
    const materialId = enteroPositivo(body?.materialId);
    if (!materialId) return errores.entrada("Falta materialId.");

    const supabase = clienteAdmin();
    const { data: material, error } = await supabase
      .from("materiales_didacticos")
      .select("id, titulo, titulo_en, precio, visible")
      .eq("id", materialId)
      .maybeSingle();
    if (error) throw error;
    if (!material || material.visible !== true) return errores.noEncontrado("Material no encontrado.");

    const precio = Number(material.precio);
    if (!Number.isFinite(precio) || precio < PRECIO_MINIMO_EUR) {
      return errores.entrada("Este material es gratuito o no tiene precio.");
    }

    // ¿Ya lo tiene?
    const { data: compra } = await supabase
      .from("compras_materiales")
      .select("id")
      .eq("user_id", user.id)
      .eq("material_id", material.id)
      .maybeSingle();
    if (compra) return errores.conflicto("Ya tienes este material.");

    const idioma = idiomaDesde(body?.idioma);
    const nombre = idioma === "en" && material.titulo_en ? material.titulo_en : material.titulo;

    // URL de vuelta: la de la web si es de un origen permitido
    const porDefecto = `${origenSeguro(req)}/Materiales?pago=completado`;
    const exito = urlPermitida(body?.returnUrl, porDefecto);
    const cancelacion = exito.replace("?pago=completado", "");

    const session = await clienteStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: { currency: "eur", product_data: { name: nombre }, unit_amount: Math.round(precio * 100) },
        quantity: 1,
      }],
      customer_email: user.email ?? undefined,
      success_url: exito,
      cancel_url: cancelacion,
      client_reference_id: String(material.id),
      metadata: {
        tipo: "material_didactico",
        material_id: String(material.id),
        user_id: user.id,
        ...(idioma ? { idioma } : {}),
      },
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("[checkout-material] Error:", e instanceof Error ? e.message : String(e));
    return errores.interno("No se pudo iniciar el pago.");
  }
});
