/**
 * Plantillas de correo de Supabase Auth con el diseño común (_shared/plantilla-correo.ts).
 *
 * Supabase Auth usa plantillas Go: cada correo lleva las dos versiones y elige por
 * user_metadata.idioma ('en' → inglés; cualquier otro valor o vacío → español).
 * La web guarda ese idioma al registrarse y al cambiar de idioma con sesión iniciada.
 *
 * Variables de Supabase: {{ .ConfirmationURL }}, {{ .Token }}, {{ .Email }}, {{ .NewEmail }},
 * {{ .SiteURL }}, {{ .Data }} (user_metadata).
 */
import { nota, parrafo, plantillaCorreo, type Idioma } from '../functions/_shared/plantilla-correo.ts';

export type TipoCorreo =
  | 'confirmation'
  | 'recovery'
  | 'magic_link'
  | 'email_change'
  | 'invite'
  | 'reauthentication';

interface Texto {
  asunto: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  boton?: { texto: string; url: string };
}

const URL = '{{ .ConfirmationURL }}';

/** "Hola, Ana:" si hay nombre en los metadatos; si no, "Hola:". */
function saludo(idioma: Idioma): string {
  return idioma === 'en'
    ? parrafo('{{ if .Data.nombre }}Hi {{ .Data.nombre }},{{ else }}Hi,{{ end }}')
    : parrafo('{{ if .Data.nombre }}Hola, {{ .Data.nombre }}:{{ else }}Hola:{{ end }}');
}

/** Código de un solo uso en grande, con el estilo de la tabla de datos. */
function codigo(token: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="padding:14px 24px;background:#FFFDF8;border:1px solid #EADFD5;border-radius:12px;font-family:Montserrat, Arial, Helvetica, sans-serif;font-size:28px;font-weight:700;letter-spacing:6px;color:#2B1D1F;">${token}</td></tr></table>`;
}

const TEXTOS: Record<TipoCorreo, Record<Idioma, Texto>> = {
  confirmation: {
    es: {
      asunto: 'Confirma tu cuenta de SpanishNook',
      titulo: 'Confirma tu cuenta',
      resumen: 'Un clic y tu cuenta de SpanishNook queda activada.',
      cuerpo:
        saludo('es') +
        parrafo('Ya casi formas parte de SpanishNook. Solo falta confirmar tu correo para activar tu cuenta.') +
        parrafo('Pulsa el botón y empieza a reservar tus clases:'),
      boton: { texto: 'Confirmar mi cuenta', url: URL },
    },
    en: {
      asunto: 'Confirm your SpanishNook account',
      titulo: 'Confirm your account',
      resumen: 'One click and your SpanishNook account is ready.',
      cuerpo:
        saludo('en') +
        parrafo("You're almost part of SpanishNook. Just confirm your email to activate your account.") +
        parrafo('Click the button and start booking your lessons:'),
      boton: { texto: 'Confirm my account', url: URL },
    },
  },
  recovery: {
    es: {
      asunto: 'Restablece tu contraseña de SpanishNook',
      titulo: 'Restablece tu contraseña',
      resumen: 'Elige una contraseña nueva para tu cuenta de SpanishNook.',
      cuerpo:
        saludo('es') +
        parrafo('Hemos recibido una petición para cambiar la contraseña de tu cuenta.') +
        parrafo('Pulsa el botón para elegir una nueva:'),
      boton: { texto: 'Elegir nueva contraseña', url: URL },
    },
    en: {
      asunto: 'Reset your SpanishNook password',
      titulo: 'Reset your password',
      resumen: 'Choose a new password for your SpanishNook account.',
      cuerpo:
        saludo('en') +
        parrafo('We received a request to change the password of your account.') +
        parrafo('Click the button to choose a new one:'),
      boton: { texto: 'Choose a new password', url: URL },
    },
  },
  magic_link: {
    es: {
      asunto: 'Tu enlace para entrar en SpanishNook',
      titulo: 'Entra en tu cuenta',
      resumen: 'Tu enlace de acceso a SpanishNook.',
      cuerpo: saludo('es') + parrafo('Pulsa el botón para entrar en tu cuenta sin contraseña:'),
      boton: { texto: 'Entrar en SpanishNook', url: URL },
    },
    en: {
      asunto: 'Your SpanishNook sign-in link',
      titulo: 'Sign in to your account',
      resumen: 'Your SpanishNook sign-in link.',
      cuerpo: saludo('en') + parrafo('Click the button to sign in without a password:'),
      boton: { texto: 'Sign in to SpanishNook', url: URL },
    },
  },
  email_change: {
    es: {
      asunto: 'Confirma tu nuevo correo en SpanishNook',
      titulo: 'Confirma tu nuevo correo',
      resumen: 'Confirma el cambio de correo de tu cuenta de SpanishNook.',
      cuerpo:
        saludo('es') +
        parrafo(
          'Has pedido cambiar el correo de tu cuenta de <strong>{{ .Email }}</strong> a <strong>{{ .NewEmail }}</strong>.',
        ) +
        parrafo('Pulsa el botón para confirmarlo:'),
      boton: { texto: 'Confirmar el cambio', url: URL },
    },
    en: {
      asunto: 'Confirm your new SpanishNook email',
      titulo: 'Confirm your new email',
      resumen: 'Confirm the email change on your SpanishNook account.',
      cuerpo:
        saludo('en') +
        parrafo(
          'You asked to change your account email from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>.',
        ) +
        parrafo('Click the button to confirm it:'),
      boton: { texto: 'Confirm the change', url: URL },
    },
  },
  invite: {
    es: {
      asunto: 'Te han invitado a SpanishNook',
      titulo: 'Te damos la bienvenida',
      resumen: 'Acepta la invitación y crea tu cuenta de SpanishNook.',
      cuerpo: saludo('es') + parrafo('Te han invitado a crear una cuenta en SpanishNook. Pulsa el botón para aceptar:'),
      boton: { texto: 'Aceptar la invitación', url: URL },
    },
    en: {
      asunto: "You've been invited to SpanishNook",
      titulo: 'Welcome to SpanishNook',
      resumen: 'Accept the invitation and create your SpanishNook account.',
      cuerpo: saludo('en') + parrafo("You've been invited to create a SpanishNook account. Click the button to accept:"),
      boton: { texto: 'Accept the invitation', url: URL },
    },
  },
  reauthentication: {
    es: {
      asunto: 'Tu código de verificación de SpanishNook',
      titulo: 'Tu código de verificación',
      resumen: 'Usa este código para confirmar la operación.',
      cuerpo: saludo('es') + parrafo('Usa este código para confirmar la operación en tu cuenta:') + codigo('{{ .Token }}'),
    },
    en: {
      asunto: 'Your SpanishNook verification code',
      titulo: 'Your verification code',
      resumen: 'Use this code to confirm the action.',
      cuerpo: saludo('en') + parrafo('Use this code to confirm the action on your account:') + codigo('{{ .Token }}'),
    },
  },
};

const AVISO: Record<TipoCorreo, Record<Idioma, string>> = {
  confirmation: {
    es: 'Si no has creado tú esta cuenta, ignora este correo.',
    en: "If you didn't create this account, just ignore this email.",
  },
  recovery: {
    es: 'Si no lo has pedido tú, ignora este correo: tu contraseña no cambia.',
    en: "If you didn't ask for this, ignore this email: your password stays the same.",
  },
  magic_link: {
    es: 'Si no has intentado entrar, ignora este correo.',
    en: "If you didn't try to sign in, ignore this email.",
  },
  email_change: {
    es: 'Si no has pedido este cambio, no pulses el botón y escríbenos.',
    en: "If you didn't ask for this change, don't click the button and contact us.",
  },
  invite: {
    es: 'Si no esperabas esta invitación, ignora este correo.',
    en: "If you weren't expecting this invitation, ignore this email.",
  },
  reauthentication: {
    es: 'Si no estás haciendo ningún cambio en tu cuenta, ignora este correo.',
    en: "If you aren't changing anything on your account, ignore this email.",
  },
};

const CONDICION_EN = '{{ if and .Data.idioma (eq .Data.idioma "en") }}';

/** Documento HTML de un idioma (sin la condición de Go). */
export function documento(tipo: TipoCorreo, idioma: Idioma): string {
  const t = TEXTOS[tipo][idioma];
  return plantillaCorreo({
    idioma,
    titulo: t.titulo,
    resumen: t.resumen,
    cuerpo: t.cuerpo,
    boton: t.boton,
  }).replace(
    // El aviso va después del botón, antes del pie de contacto
    /(<p style="margin:8px 0 20px;)/,
    `${nota(AVISO[tipo][idioma])}$1`,
  );
}

/** Contenido de la plantilla para Supabase: inglés si user_metadata.idioma = 'en', si no español. */
export function plantillaSupabase(tipo: TipoCorreo): { asunto: string; html: string } {
  const es = TEXTOS[tipo].es;
  const en = TEXTOS[tipo].en;
  return {
    asunto: `${CONDICION_EN}${en.asunto}{{ else }}${es.asunto}{{ end }}`,
    html: `${CONDICION_EN}${documento(tipo, 'en')}{{ else }}${documento(tipo, 'es')}{{ end }}`,
  };
}

export const TIPOS: TipoCorreo[] = [
  'confirmation',
  'recovery',
  'magic_link',
  'email_change',
  'invite',
  'reauthentication',
];
