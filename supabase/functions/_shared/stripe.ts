/**
 * Cliente de Stripe para Deno (fetch + SubtleCrypto para verificar webhooks).
 */
import Stripe from "npm:stripe@14.25.0";

export { Stripe };

let cache: Stripe | null = null;

/** Cliente de Stripe. Misma versión de API que usaban los webhooks en producción. */
export function clienteStripe(): Stripe {
  if (cache) return cache;
  const clave = Deno.env.get("STRIPE_SECRET_KEY");
  if (!clave) throw new Error("Falta STRIPE_SECRET_KEY");
  cache = new Stripe(clave, {
    // deno-lint-ignore no-explicit-any
    apiVersion: "2024-06-20" as any,
    httpClient: Stripe.createFetchHttpClient(),
  });
  return cache;
}

const proveedorCripto = Stripe.createSubtleCryptoProvider();

/** Verifica la firma de un webhook. Lanza error si no es válida. */
export async function eventoVerificado(cuerpo: string, firma: string, secreto: string): Promise<Stripe.Event> {
  return await clienteStripe().webhooks.constructEventAsync(cuerpo, firma, secreto, undefined, proveedorCripto);
}

/** Id del PaymentIntent de una sesión o factura (puede venir como texto u objeto). */
export function idDe(valor: unknown): string | null {
  if (typeof valor === "string") return valor;
  if (valor && typeof valor === "object" && "id" in valor) return String((valor as { id: unknown }).id);
  return null;
}

/**
 * Motivos que se guardan en cancellation_details.comment al cancelar una suscripción
 * desde el servidor. subscription-webhook los lee para no mandar un segundo correo.
 */
export const MOTIVO_BAJA = {
  cursoCerrado: "curso_cerrado",
  cuentaEliminada: "cuenta_eliminada",
} as const;

/** Caducidad mínima de una Checkout Session (30 min + margen) para no retener franjas un día entero. */
export function caducidadCheckout(): number {
  return Math.floor(Date.now() / 1000) + 31 * 60;
}
