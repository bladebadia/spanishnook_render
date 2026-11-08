/**
 * Idioma de la web: se guarda en la cookie `sn_idioma` para que el servidor (SSR)
 * pinte la página en el idioma correcto y el cliente hidrate sin cambios.
 * Sin cookie, el servidor elige por Accept-Language y la crea.
 */
import { Cookies, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import langEs from 'quasar/lang/es.js';
import langEn from 'quasar/lang/en-US.js';
import { supabase } from 'src/supabaseClient';

export type Idioma = 'es-ES' | 'en-US';

export const COOKIE_IDIOMA = 'sn_idioma';
export const IDIOMA_POR_DEFECTO: Idioma = 'es-ES';

const UN_ANO_EN_DIAS = 365;

/** 'en', 'en-GB', 'EN-us'... → 'en-US'; 'es', 'es-MX'... → 'es-ES'; otro → null. */
export function normalizarIdioma(valor: string | null | undefined): Idioma | null {
  const base = (valor ?? '').trim().toLowerCase().slice(0, 2);
  if (base === 'es') return 'es-ES';
  if (base === 'en') return 'en-US';
  return null;
}

/** Primer idioma soportado de una cabecera Accept-Language, por orden de preferencia (q). */
export function idiomaDesdeAcceptLanguage(cabecera: string | null | undefined): Idioma {
  const candidatos = (cabecera ?? '')
    .split(',')
    .map((parte, i) => {
      const [etiqueta = '', ...params] = parte.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const peso = q ? Number(q.slice(2)) : 1;
      return { etiqueta, peso: Number.isFinite(peso) ? peso : 0, i };
    })
    .filter((c) => c.etiqueta && c.peso > 0)
    .sort((a, b) => b.peso - a.peso || a.i - b.i);

  for (const c of candidatos) {
    const idioma = normalizarIdioma(c.etiqueta);
    if (idioma) return idioma;
  }
  return IDIOMA_POR_DEFECTO;
}

export function paqueteQuasar(idioma: Idioma) {
  return idioma === 'en-US' ? langEn : langEs;
}

export function opcionesCookieIdioma() {
  return {
    path: '/',
    expires: UN_ANO_EN_DIAS,
    sameSite: 'Lax' as const,
    secure: !process.env.DEV,
  };
}

/** 'es-ES' → 'es', 'en-US' → 'en': lo que guardan los metadatos del usuario y usan los correos. */
export function idiomaCorto(idioma: Idioma): 'es' | 'en' {
  return idioma === 'en-US' ? 'en' : 'es';
}

/** Idioma guardado en la cookie del navegador (o el de por defecto). Solo cliente. */
export function idiomaActualCliente(): Idioma {
  return normalizarIdioma(Cookies.get(COOKIE_IDIOMA)) ?? IDIOMA_POR_DEFECTO;
}

/**
 * Guarda el idioma en user_metadata.idioma de la cuenta con sesión, si cambia.
 * Lo leen las plantillas de correo de Supabase Auth (confirmación, recuperación...).
 */
export async function guardarIdiomaEnCuenta(idioma: Idioma): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const usuario = data.session?.user;
    if (!usuario) return;
    const corto = idiomaCorto(idioma);
    if (usuario.user_metadata?.idioma === corto) return;
    const { error } = await supabase.auth.updateUser({ data: { idioma: corto } });
    if (error) throw error;
  } catch (e) {
    console.warn('No se pudo guardar el idioma en la cuenta:', e);
  }
}

/** Cambia el idioma en caliente (i18n, componentes de Quasar, cookie y cuenta). */
export function useIdioma() {
  const { locale } = useI18n();
  const $q = useQuasar();

  function cambiarIdioma(valor: string) {
    const idioma = normalizarIdioma(valor) ?? IDIOMA_POR_DEFECTO;
    locale.value = idioma;
    $q.lang.set(paqueteQuasar(idioma));
    Cookies.set(COOKIE_IDIOMA, idioma, opcionesCookieIdioma());
    void guardarIdiomaEnCuenta(idioma);
  }

  return { locale, cambiarIdioma };
}
