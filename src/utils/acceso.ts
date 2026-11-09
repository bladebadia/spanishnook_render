/**
 * Utilidades de inicio de sesión.
 *
 * LOGIN_GOOGLE_ACTIVO: muestra "Continuar con Google". Requiere el proveedor Google activo en
 * Supabase (cliente OAuth web del proyecto de Google Cloud "SpanishNook login") y la migración
 * 20261109100000_nombre_usuarios_google.sql (aplicada), que rellena el nombre de esas cuentas.
 */
export const LOGIN_GOOGLE_ACTIVO = true;

/** Ruta interna segura a la que volver tras entrar (?redirect=/ruta); si no, el área personal. */
export function destinoSeguro(valor: unknown): string {
  return typeof valor === 'string' && valor.startsWith('/') && !valor.startsWith('//')
    ? valor
    : '/AreaPersonal';
}
