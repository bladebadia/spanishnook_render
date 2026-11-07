/**
 * Autenticación, CORS y respuestas JSON comunes a todas las Edge Functions.
 *
 * Todas las funciones se despliegan con verify_jwt = false: la pasarela de Supabase
 * no comprueba nada y cada función tiene que autenticarse a sí misma con estas utilidades.
 */
import { createClient, type SupabaseClient, type User } from "jsr:@supabase/supabase-js@2";

// --- CORS y respuestas ------------------------------------------------------

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

/** Respuesta al preflight OPTIONS (o null si la petición no es OPTIONS). */
export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  return null;
}

/** Respuesta JSON con CORS. */
export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Errores estándar (mensajes cortos, sin detalles internos). */
export const errores = {
  sinSesion: () => json({ error: "Debes iniciar sesión." }, 401),
  prohibido: () => json({ error: "No tienes permiso para esta acción." }, 403),
  metodo: () => json({ error: "Método no permitido." }, 405),
  entrada: (msg = "Datos no válidos.") => json({ error: msg }, 400),
  noEncontrado: (msg = "No encontrado.") => json({ error: msg }, 404),
  conflicto: (msg: string, extra: Record<string, unknown> = {}) => json({ error: msg, ...extra }, 409),
  interno: (msg = "Error interno del servidor.") => json({ error: msg }, 500),
};

/** Lee el cuerpo JSON. Devuelve {} si viene vacío y null si no es JSON válido. */
export async function leerJson(req: Request): Promise<Record<string, unknown> | null> {
  const texto = await req.text().catch(() => "");
  if (!texto.trim()) return {};
  try {
    const valor = JSON.parse(texto);
    return valor && typeof valor === "object" && !Array.isArray(valor) ? valor : null;
  } catch {
    return null;
  }
}

// --- Cliente con clave de servicio -------------------------------------------

/** Claves de servicio aceptadas (el proyecto usa SERVICE_ROLE_KEY; Supabase inyecta SUPABASE_SERVICE_ROLE_KEY). */
function clavesServicio(): string[] {
  return [Deno.env.get("SERVICE_ROLE_KEY"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")]
    .filter((k): k is string => !!k && k.length > 0);
}

/** Clave de servicio principal: SERVICE_ROLE_KEY ?? SUPABASE_SERVICE_ROLE_KEY. */
export function claveServicio(): string {
  return Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

let clienteCache: SupabaseClient | null = null;

/** Cliente de Supabase con la clave de servicio (salta RLS: usar solo en el servidor). */
export function clienteAdmin(): SupabaseClient {
  if (clienteCache) return clienteCache;
  const url = Deno.env.get("SUPABASE_URL");
  const clave = claveServicio();
  if (!url || !clave) throw new Error("Faltan SUPABASE_URL o la clave de servicio");
  clienteCache = createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return clienteCache;
}

// --- Identidad del llamante ---------------------------------------------------

function tokenBearer(req: Request): string | null {
  const cabecera = req.headers.get("Authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(cabecera.trim());
  return m ? m[1].trim() : null;
}

/** Comparación en tiempo constante para no filtrar la clave por tiempos de respuesta. */
function igualSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** true si la petición trae como Bearer la clave de servicio (llamadas entre funciones). */
export function esLlamadaInterna(req: Request): boolean {
  const token = tokenBearer(req);
  if (!token) return false;
  return clavesServicio().some((clave) => igualSeguro(token, clave));
}

/** Usuario autenticado a partir del JWT del Bearer, o null. */
export async function usuarioDesdePeticion(req: Request): Promise<User | null> {
  const token = tokenBearer(req);
  if (!token || esLlamadaInterna(req)) return null;
  try {
    const { data, error } = await clienteAdmin().auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/** true si el usuario tiene profiles.is_admin = true. */
export async function esAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await clienteAdmin()
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] Error leyendo profiles:", error.message);
    return false;
  }
  return data?.is_admin === true;
}

/** Llama a otra Edge Function del proyecto con la clave de servicio. */
export async function llamarFuncionInterna(nombre: string, body: unknown): Promise<Response> {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${nombre}`;
  return await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${claveServicio()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- Orígenes permitidos (URLs de vuelta de Stripe) ---------------------------

export const ORIGEN_POR_DEFECTO = "https://www.spanishnook.com";
const ORIGENES_PERMITIDOS = new Set([
  "https://www.spanishnook.com",
  "https://spanishnook.com",
  "http://localhost:9000",
]);

/** Origen de la petición si está en la lista blanca; si no, la web de producción. */
export function origenSeguro(req: Request): string {
  const origen = req.headers.get("origin") ?? "";
  return ORIGENES_PERMITIDOS.has(origen) ? origen : ORIGEN_POR_DEFECTO;
}

/** Devuelve `url` solo si su origen está en la lista blanca; si no, `porDefecto`. */
export function urlPermitida(url: unknown, porDefecto: string): string {
  if (typeof url !== "string") return porDefecto;
  try {
    const u = new URL(url);
    return ORIGENES_PERMITIDOS.has(u.origin) ? u.toString() : porDefecto;
  } catch {
    return porDefecto;
  }
}

/** Valida un UUID (ids de reservas y usuarios). */
export function esUuid(valor: unknown): valor is string {
  return typeof valor === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}

/** Convierte a entero positivo (ids bigint que llegan como número o texto). */
export function enteroPositivo(valor: unknown): number | null {
  const n = typeof valor === "number" ? valor : typeof valor === "string" ? Number(valor) : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
