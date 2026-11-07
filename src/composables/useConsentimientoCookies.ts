/**
 * Consentimiento de cookies.
 *
 * Google Analytics solo se carga si el visitante pulsa "Aceptar".
 * Seguir navegando no cuenta como consentimiento (criterio de la AEPD).
 */

export type EstadoConsentimiento = 'aceptadas' | 'rechazadas';

const CLAVE = 'sn_consentimiento_cookies';
// Banner anterior: solo tenía "Aceptar" y guardaba esta clave
const CLAVE_ANTIGUA = 'cookies_accepted';

/** Evento que se lanza en `window` cuando el visitante acepta. */
export const EVENTO_COOKIES_ACEPTADAS = 'sn:cookies-aceptadas';

/** Decisión guardada, o null si el visitante aún no ha elegido (o en el servidor). */
export function leerConsentimiento(): EstadoConsentimiento | null {
  if (typeof window === 'undefined') return null;
  try {
    const valor = localStorage.getItem(CLAVE);
    if (valor === 'aceptadas' || valor === 'rechazadas') return valor;
    if (localStorage.getItem(CLAVE_ANTIGUA) === 'true') return 'aceptadas';
  } catch {
    // Almacenamiento bloqueado (modo privado estricto): se pregunta de nuevo
  }
  return null;
}

/** Guarda la decisión y, si acepta, avisa para cargar Analytics sin recargar. */
export function guardarConsentimiento(estado: EstadoConsentimiento): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLAVE, estado);
  } catch {
    // Sin almacenamiento la decisión vale solo para esta visita
  }
  if (estado === 'aceptadas') {
    window.dispatchEvent(new Event(EVENTO_COOKIES_ACEPTADAS));
  }
}
