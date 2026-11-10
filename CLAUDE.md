# SpanishNook

Web de clases de español online de Paula (hermana de Miguel). Producción: https://www.spanishnook.com

## Cómo trabajar con Miguel

- Español de España, frases cortas, al grano. Datos concretos antes que adjetivos. Sin exclamaciones ni urgencia falsa.
- Si pide una decisión: una sola recomendación.
- Commits en local en la rama `rediseno`: libres. **Antes de push o merge a `master`, preguntar** (Vercel despliega `master` a producción).
- **Antes de cualquier cambio en producción, preguntar**: migraciones de BD, despliegue de Edge Functions, SQL que escriba datos.
- Stripe está en **modo live**: nada de pagos de prueba sin que Miguel lo pida; los reembolsos los hace él en el dashboard.
- En español es "inicio", nunca "home". Todo texto nuevo va en i18n (`src/i18n/es-ES` y `src/i18n/en-US`; `en-US` es el esquema de tipos).

## Stack

- Vue 3 + Quasar 2 (Composition API, TypeScript), **SSR** en Vercel (`npm run build:ssr`). vue-i18n es/en.
- Supabase (proyecto `zleqsdfpjepdangitcxv`): Auth, Postgres con RLS, Storage, Edge Functions (Deno).
- Stripe (Checkout, webhooks), Resend (correo desde `info@spanishnook.com`; bienvenidas desde `hola@`; avisos internos a `paulaf@`). `contacto@` no existe, Google Calendar/Meet (OAuth de Paula).

## Comandos

- `npm run dev` (puerto 9000), `npm run lint`, `npx quasar build -m ssr`.
- Edge Functions: no hay `supabase/config.toml`. Primero `supabase link --project-ref zleqsdfpjepdangitcxv`.
  Desplegar siempre con `supabase functions deploy <nombre> --no-verify-jwt` (cada función se autentica sola en `_shared/auth.ts`).
- `tsconfig.json` excluye `./supabase`: el código Deno no pasa por vue-tsc.

## Reglas del dominio (no romper)

- **Zonas horarias**: en BD, `fecha` 'YYYY-MM-DD' + `hora` 'HH:mm' son hora de pared de **Europe/Madrid**.
  Conversión solo con Intl: `src/utils/zonaHoraria.ts` (web) y `supabase/functions/_shared/fechas.ts` (servidor).
  Al alumno se le muestra su hora local y la de Madrid.
- Clases individuales: 32 € general, 27 € conversación. Precio fijado en el servidor. Cancelación hasta 24 h antes (hora de Madrid) con devolución de crédito.
- Packs (allowlist en servidor): general-5 148 €, general-10 272 €, conversación-5 125 €, conversación-10 230 €.
- Cursos: `tipo_curso` 'suscripcion' (mensual, 65/75 €) o 'cerrado' (fechas fijas, pago único con `precio_total_centimos`, tabla `inscripciones_curso`).
- Los cursos en estado 'Activo' o 'Completo' bloquean sus horas en el calendario de clases (`franjas_cursos`, `obtener_ocupacion`, `franja_reservable`). Cerrar un curso lo pone en 'Finalizado'.
- Seguridad: RLS en todas las tablas; el saldo de créditos solo cambia vía funciones SECURITY DEFINER o clave de servicio; `reservar_con_credito` usa `auth.uid()`.
- Webhooks de Stripe: firma verificada (`constructEventAsync`), idempotentes, dispatch por `metadata`.
- Correos: plantilla común `_shared/plantilla-correo.ts` (logo `public/img/logo-correo.png`), en el idioma de la reserva. Cancelar eventos de Google sin aviso (`sendUpdates=none`).

## Diseño

Sistema "Papel y tinta" en `src/css/app.scss`: tokens `--sn-*` (burdeos #851319, papel #fffdf8, tinta #2b1d1f), sellos por tipo de clase (general #2f6e9f, conversación #7b4f96), Montserrat + Nunito Sans (WOFF recortadas). Móvil primero: muchos alumnos llegan desde redes sociales.

## Documentación

- `supabase/esquema-actual.md`: esquema de BD.
- `supabase/functions/README.md` y `CAMBIOS-FASE2.md`: qué hace cada función.
- `supabase/migrations/`: migraciones ya aplicadas en producción.

## Pendiente (10-nov-2026, tarde)

1. ~~Aplicar migraciones 20261110*, desplegar funciones y subir a `master`~~ Hecho el 10-nov.
2. Probar (escriben en producción; preguntar antes): reserva con crédito y cancelación, lista de espera, opinión, formulario de contacto (debe llegar correo a Paula), registro y confirmación de email, reset de contraseña, borrar cuenta (también con cuenta solo de Google), flujos de admin (lista de cursos vía `admin_cursos()`), y todo Stripe (clase con tarjeta, bono, material y PDF, suscripción, curso cerrado).
3. El remitente de los correos de Supabase Auth está en el SMTP del panel de Supabase, no en el código.
4. Login con Google: falta la verificación de marca de Google (hasta entonces la pantalla muestra el dominio de Supabase).
5. Inglés: privacidad, aviso legal y condiciones siguen en español; los textos de cursos de la BD no tienen versión en inglés.
6. `check_email_exists` (registro) deja comprobar sin sesión si un email tiene cuenta. Se mantiene por la experiencia del registro; valorar quitarlo.
7. Panel de administración con el estilo antiguo (funciona; solo es visual).
