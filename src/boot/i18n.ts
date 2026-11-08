import { defineBoot } from '#q-app/wrappers';
import { Cookies, Lang } from 'quasar';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import {
  COOKIE_IDIOMA,
  idiomaDesdeAcceptLanguage,
  normalizarIdioma,
  opcionesCookieIdioma,
  paqueteQuasar,
} from 'src/utils/idioma';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(({ app, ssrContext }) => {
  // Idioma: cookie > (solo servidor) Accept-Language > español.
  // El servidor deja la cookie puesta para que el cliente hidrate en el mismo idioma.
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
  let idioma = normalizarIdioma(cookies.get(COOKIE_IDIOMA));
  if (!idioma) {
    if (process.env.SERVER) {
      idioma = idiomaDesdeAcceptLanguage(ssrContext?.req.headers['accept-language']);
      cookies.set(COOKIE_IDIOMA, idioma, opcionesCookieIdioma());
    } else {
      idioma = idiomaDesdeAcceptLanguage(navigator.languages?.join(',') || navigator.language);
    }
  }

  const i18n = createI18n({
    locale: idioma,
    fallbackLocale: 'en-US',
    legacy: false,
    messages: messages,
    globalInjection: true,
  });

  if (process.env.SERVER) {
    Lang.set(paqueteQuasar(idioma), ssrContext);
  } else {
    Lang.set(paqueteQuasar(idioma));
  }

  app.use(i18n);
});
