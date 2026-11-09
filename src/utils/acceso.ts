/**
 * Utilidades de inicio de sesión.
 *
 * LOGIN_GOOGLE_ACTIVO: ponerlo a true solo cuando el proveedor Google esté configurado
 * (Google Cloud: cliente OAuth web con la URL de callback de Supabase; Supabase:
 * Authentication → Providers → Google con ese Client ID/Secret) y aplicada la migración
 * supabase/migraciones-pendientes/20261109100000_nombre_usuarios_google.sql, que rellena el nombre de las cuentas de Google.
 */
export const LOGIN_GOOGLE_ACTIVO = true;

/** Ruta interna segura a la que volver tras entrar (?redirect=/ruta); si no, el área personal. */
export function destinoSeguro(valor: unknown): string {
  return typeof valor === 'string' && valor.startsWith('/') && !valor.startsWith('//')
    ? valor
    : '/AreaPersonal';
}
