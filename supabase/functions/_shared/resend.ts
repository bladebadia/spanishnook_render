/**
 * Envío de correos con Resend. Nunca lanza excepciones al llamante:
 * devuelve true/false y deja el error en el log (sin direcciones completas).
 */

/** Remitente general (info@ es un alias del buzón de Paula). */
export const REMITENTE = "SpanishNook <info@spanishnook.com>";
/** Remitente de los correos de bienvenida (alias hola@). */
export const REMITENTE_BIENVENIDA = "SpanishNook <hola@spanishnook.com>";
/** Destinataria de los avisos internos. */
export const CORREO_INTERNO = "paulaf@spanishnook.com";

export interface CorreoSaliente {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  /** Remitente; por defecto REMITENTE (info@). */
  from?: string;
}

/** 'paula@dominio.com' → 'pa***@dominio.com' (para logs). */
export function ocultarEmail(email: string | null | undefined): string {
  const [usuario, dominio] = String(email ?? "").split("@");
  if (!dominio) return "(sin email)";
  return `${usuario.slice(0, 2)}***@${dominio}`;
}

function esEmail(valor: string): boolean {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(valor);
}

export async function enviarCorreo({ to, subject, html, replyTo, from }: CorreoSaliente): Promise<boolean> {
  const destinatarios = (Array.isArray(to) ? to : [to]).filter((d) => typeof d === "string" && esEmail(d));
  if (destinatarios.length === 0) {
    console.error("[resend] Sin destinatario válido");
    return false;
  }
  const clave = Deno.env.get("RESEND_API_KEY");
  if (!clave) {
    console.error("[resend] Falta RESEND_API_KEY");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${clave}` },
      body: JSON.stringify({
        from: from ?? REMITENTE,
        to: destinatarios,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      console.error(`[resend] Error ${res.status} enviando a ${destinatarios.map(ocultarEmail).join(", ")}: ${detalle.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[resend] Error de red:", e instanceof Error ? e.message : String(e));
    return false;
  }
}

/** Pausa corta entre envíos masivos (Resend limita a ~2 peticiones por segundo). */
export function pausa(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
