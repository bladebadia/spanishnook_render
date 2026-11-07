# Edge Functions de Supabase (copia de solo lectura)

Exportadas el 2026-11-07 desde el proyecto `zleqsdfpjepdangitcxv` con `get_edge_function`.
Son una copia del código desplegado; el despliegue real sigue estando solo en Supabase.
Finales de línea normalizados a LF (el código desplegado usa CRLF en la mayoría de archivos).

Todas tienen `verify_jwt = false`: la pasarela de Supabase no comprueba el JWT y cada función es responsable de su propia autenticación.

| Slug | Versión desplegada | verify_jwt | Qué hace | Quién la llama |
|---|---|---|---|---|
| `stripe-webhook` | 88 | false | Doble uso. Con cabecera `stripe-signature`: webhook de Stripe (`checkout.session.completed` → bono de créditos vía RPC `procesar_bono_seguro`, reservas individuales pagadas con tarjeta + evento Google Meet + emails, compra de material en `compras_materiales`; `charge.refunded` → marca reservas como `cancelada`). Sin esa cabecera: crea una Checkout Session de pago para clases individuales (32 € normal / 27 € conversación). | Stripe + `src/pages/CarritoCompra.vue` (fetch directo) |
| `cancel-reserva` | 35 | false | Cancela reservas confirmadas (por `reservaId` o `reservaIds`) si faltan ≥24 h: devuelve 1 crédito (`devolver_credito`), borra el evento de Google Calendar, borra la fila de `reservas` y envía email bilingüe al alumno y aviso a Paula. | `AreaPersonal.vue`, `useReservasClases.ts` |
| `subscription-webhook` | 63 | false | Doble uso. Con `stripe-signature`: webhook de suscripciones (`customer.subscription.created/updated/deleted`, `invoice.payment_succeeded`) que sincroniza `user_subscriptions`, invita al alumno al evento recurrente del curso (vía `crear-meet`) y envía emails de alta/baja. Sin firma: `toggle_cancel` (cancelar/reactivar al final del periodo), `get_price_details` y creación de Checkout Session de suscripción a un curso grupal. | Stripe + `src/composables/useSuscripciones.ts` |
| `delete-account` | 13 | false | Valida el JWT del llamante (`auth.getUser`), borra su usuario de Auth (las tablas con FK `ON DELETE CASCADE` se limpian) y envía email de despedida. | `AreaPersonal.vue` |
| `crear-meet` | 24 | false | Google Calendar/Meet con OAuth2 (refresh token): crea evento individual para una reserva (`reservaId`), crea evento recurrente de curso (`esCurso`), añade asistente a un evento (`add_attendee`) o borra un evento (`delete`). | `CarritoCompra.vue`, `PanelAdministracion.vue`, `subscription-webhook`, `cerrar-curso` |
| `cerrar-curso` | 15 | false | Cierra un curso grupal: reembolso prorrateado a cada suscripción activa, cancela suscripciones en Stripe, email al alumno, borra el evento de Google, marca el curso `Completo` y oculto. Comprueba que el usuario esté logueado (no que sea admin). | `PanelAdministracion.vue` |
| `notify-waitlist` | 15 | false | Envía email “el curso ya está activo” a la lista de espera (UUIDs de usuarios o emails sueltos) y vacía `cursos_grupales.lista_espera`. | `PanelAdministracion.vue` |
| `send-booking-email` | 13 | false | Envía email de confirmación de reservas pagadas con créditos al alumno (`userId`) y aviso a Paula. Las reservas llegan en el body. | `CarritoCompra.vue` |
| `create-bono-checkout` | 6 | false | Crea Checkout Session de pago para un pack de créditos con `priceId`, nº de créditos y tipo enviados por el cliente (metadata `tipo_compra = bono_creditos`). | `src/pages/ComprarPacks.vue` (fetch directo) |
| `checkout-material` | 2 | false | Crea Checkout Session para comprar un material didáctico (PDF) con título y precio enviados por el cliente (metadata `tipo = material_didactico`). | `src/pages/MaterialesPage.vue` |

## Secretos usados (nombres, no valores)

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (stripe-webhook), `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET` (subscription-webhook), `SUPABASE_URL`, `SERVICE_ROLE_KEY` (todas salvo send-booking-email), `SUPABASE_SERVICE_ROLE_KEY` (send-booking-email), `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`.

## Emails

Todas envían con `fetch("https://api.resend.com/emails")` y `from: "SpanishNook <hola@spanishnook.com>"`. Las plantillas HTML están duplicadas en línea en cada función (sin módulo compartido) y son bilingües ES + EN en el mismo correo. Los avisos internos van a `paulaf@spanishnook.com`.
