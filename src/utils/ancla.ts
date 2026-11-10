/**
 * Elemento al que apunta un ancla de la URL ("#grupos"), o null.
 *
 * Solo acepta anclas con forma de id. Al volver del login con Google la URL trae
 * "#access_token=...&expires_in=..." y document.querySelector lanzaba un SyntaxError.
 */
export function elementoDeAncla(hash: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (!/^#[A-Za-z][\w-]*$/.test(hash)) return null;
  return document.getElementById(hash.slice(1));
}
