# Edge Functions: cambios de la fase 2 (seguridad y correos)

Fecha: 2026-11-07. Solo código local: nada desplegado, ningún correo enviado.

## Resumen

- Todas las funciones se autentican solas (siguen con `verify_jwt = false`): `401` sin sesión, `403` sin permiso, `400` datos no válidos, `404` no encontrado, `409` conflicto.
- Ningún precio, enlace, email ni dato de reserva se toma de la web: todo se lee de la BD o de una lista blanca del servidor.
- Todos los correos usan `_shared/plantilla-correo.ts`, en **un solo idioma** y con todos los datos escapados. Se han borrado las plantillas HTML en línea.
- Importaciones unificadas: `jsr:@supabase/supabase-js@2` y `npm:stripe@14.25.0` (fetch + SubtleCrypto). `Deno.serve` en todas.

## Módulos compartidos (`_shared/`)

| Archivo | Qué contiene |
|---|---|
| `auth.ts` | `clienteAdmin()`, `usuarioDesdePeticion(req)`, `esAdmin(userId)`, `esLlamadaInterna(req)` (Bearer = `SERVICE_ROLE_KEY` o `SUPABASE_SERVICE_ROLE_KEY`, comparación en tiempo constante), `json()`, `corsHeaders`, `preflight()`, `errores.*`, `leerJson()`, `llamarFuncionInterna()`, `origenSeguro()` / `urlPermitida()` (solo `https://www.spanishnook.com`, `https://spanishnook.com`, `http://localhost:9000`), `esUuid()`, `enteroPositivo()`. |
| `fechas.ts` | Port de `src/utils/zonaHoraria.ts`: `instanteDesdeMadrid`, `horasHasta`, `hoyMadridISO`, `rangoHoraMadrid`, `rangoHoraEnZona`, `formatFechaCalendario`, `formatFechaClase`, `fechaCorta`, `sumarMinutosPared`, `zonaValida` / `normalizarZona` (zona IANA validada con Intl, Madrid por defecto). |
| `resend.ts` | `enviarCorreo({ to, subject, html, replyTo? })` → `true/false`, nunca lanza. Remitente `SpanishNook <info@spanishnook.com>` (bienvenidas a curso: `hola@`, con `from: REMITENTE_BIENVENIDA`), `CORREO_INTERNO = paulaf@spanishnook.com`. Los logs ocultan los emails. |
| `correo-comun.ts` | Idioma (`resolverIdioma`), saludo, nombres de tipo de clase, importes en €, días de curso traducidos, `filasClase()` (fecha y hora en Madrid y, si cambia, también en la zona del alumno), enlaces solo `https`. |
| `google.ts` | Token OAuth2, crear evento con Meet, añadir asistente, borrar evento, `crearEventoClase()`. |
| `stripe.ts` | `clienteStripe()` (API `2024-06-20`, la misma que usaban los webhooks), `eventoVerificado()`, `idDe()`, `caducidadCheckout()` (30 min), `MOTIVO_BAJA`. |
| `plantilla-correo.ts` | Sin cambios. |

### Idioma y zona horaria de los correos

- Idioma: el campo `idioma` de la petición (`'es'|'en'`, también acepta `es-ES`/`en-US`). Si no llega: inglés cuando `datos_usuarios.idioma_nativo` es inglés; si no, español. Los avisos internos a Paula van siempre en español.
- En los pagos con Stripe el idioma y la zona viajan en la metadata (`idioma`, `zona`) solo si la web los manda, para que el webhook los use.
- Hora: siempre en Madrid. Si llega una `zonaHoraria` válida y da otra fecha u hora, se añade una fila "Tu hora (Ciudad)".

## Cambios por función

### `cerrar-curso`
- **Cambio:** solo admin (`profiles.is_admin`). Antes cualquier usuario con sesión podía cerrar un curso y lanzar reembolsos.
- Borra el evento de Google directamente (sin pasar por `crear-meet`). Cancela con `cancellation_details.comment = 'curso_cerrado'` para que el alumno no reciba además el correo de "suscripción finalizada".
- **Contrato:** igual, `{ courseId }` → `{ success, procesados }`.
- **Web:** nada.

### `crear-meet`
- **Cambio:** acepta llamada interna, admin o el dueño de la reserva. `add_attendee`, `delete` y `esCurso` solo interna o admin. Un alumno solo puede crear el Meet de su reserva **confirmada**. Si la reserva ya tiene evento, devuelve el enlace existente (no crea duplicados).
- `esCurso` acepta `fechaFin` (fin de la recurrencia) y `duracionMinutos` (por defecto 90).
- **Contrato:** igual.
- **Web:** nada. Para cursos de fechas cerradas conviene enviar `fechaFin` desde `PanelAdministracion.vue` (línea ~2735).

### `send-booking-email`
- **Cambio:** requiere sesión. Ignora los datos y enlaces que manda la web: lee de `reservas` las del propio usuario, confirmadas y pagadas con créditos (`stripe_payment_intent` nulo). Envía solo al email de la sesión, más aviso a Paula. Usa `SERVICE_ROLE_KEY ?? SUPABASE_SERVICE_ROLE_KEY`.
- **Contrato nuevo:** `{ reservaIds: string[], idioma?, zonaHoraria? }` → `{ success, enviadas }`.
- **Compatibilidad:** sigue aceptando `{ reservas, userId }`; en ese caso usa las reservas con créditos del usuario creadas en los últimos 15 minutos.
- **Web (recomendado):** `src/pages/CarritoCompra.vue` línea ~374. Guardar los `nuevaReservaId` del bucle de créditos y enviar `{ reservaIds, idioma: locale.value, zonaHoraria: zonaUsuario() }`.

### `notify-waitlist`
- **Cambio:** solo admin o interna. Lee curso, `lista_espera` y nombres de la BD; el enlace se construye con el id del curso. Responde `409` si el curso no está `Activo`. Envía uno a uno (límite de Resend) y en `lista_espera` solo deja las entradas cuyo correo falló.
- **Contrato:** `{ cursoId }` → `{ success, notificados, fallidos }` (`nombreCurso` y `listaIds` se ignoran).
- **Web:** nada.

### `cancel-reserva`
- **Cambio:** requiere sesión; el alumno solo cancela las suyas, el admin cualquiera. La regla de 24 h se calcula con la hora de Madrid (antes interpretaba la hora como UTC: en invierno daba 1 h de más y en verano 2 h). Se aplica a todos, también al admin.
- La fila se borra primero con condición `estado = 'confirmada'`; así dos peticiones simultáneas no devuelven dos créditos. Si `devolver_credito` falla, se restaura la reserva.
- Correos agrupados por alumno, en su idioma.
- **Contrato:** `{ reservaId? , reservaIds?, idioma?, zonaHoraria? }` → `{ success, canceladas, fallidas, creditos, detalleFallidas }` (campo nuevo `detalleFallidas: [{ id, motivo }]`).
- **Web (opcional):** enviar `idioma` y `zonaHoraria` en `AreaPersonal.vue` (~907) y `useReservasClases.ts` (~273). En `useReservasClases.ts` la llamada no comprueba `error`: si la función responde `4xx`, la reserva desaparece de la lista local sin estar cancelada.

### `checkout-material`
- **Cambio:** requiere sesión. Solo usa `materialId`; título y precio salen de `materiales_didacticos` (visible). Rechaza materiales gratuitos o por debajo de 0,50 € (`400`) y los ya comprados (`409`). `returnUrl` solo se acepta si es de un origen permitido.
- **Contrato:** `{ materialId, returnUrl?, idioma? }` → `{ url }`. Metadata igual: `tipo: 'material_didactico'`, `material_id`, `user_id`.
- **Web:** nada (titulo, precio y userId se ignoran).

### `create-bono-checkout`
- **Cambio:** requiere sesión. Lista blanca en el servidor:

  | packId | price id | créditos | tipo |
  |---|---|---|---|
  | `general-5` | `price_1T5z33PqNYrMmXl35sDcDBn1` | 5 | normal |
  | `general-10` | `price_1T5z2ZPqNYrMmXl3PJsL4MLR` | 10 | normal |
  | `conversacion-5` | `price_1T5z23PqNYrMmXl3PVDgH9Nv` | 5 | conversacion |
  | `conversacion-10` | `price_1T5z1OPqNYrMmXl3fI17X5C8` | 10 | conversacion |

  Acepta `packId` o `priceId`, pero solo si está en la lista; los créditos salen de la lista. `successUrl`/`cancelUrl` solo de orígenes permitidos.
- **Contrato:** `{ packId? | priceId?, successUrl?, cancelUrl?, idioma? }` → `{ url }`. Metadata igual (`tipo_compra`, `user_id`, `creditos_a_sumar`, `tipo_credito`).
- **Web:** nada. Si se cambia un precio en Stripe hay que actualizar esta tabla y `ComprarPacks.vue`.

### `subscription-webhook`
- **Webhook:** sigue verificando la firma. Corrige la re-suscripción: con `UNIQUE(user_id, course_id)` el antiguo `upsert` por `stripe_subscription_id` fallaba en silencio; ahora se actualiza la fila existente del alumno y un evento tardío de la suscripción vieja no pisa una nueva activa. No manda el correo de despedida si la baja viene de `cerrar-curso` o `delete-account`.
- **Checkout:** requiere sesión. Usa `course_id` (o `courseId`) y el `stripe_price_id` del curso en BD; `priceId` de la web se ignora. Rechaza: curso no visible (`404`), `tipo_curso = 'cerrado'` (`400`), no `Activo`, sin precio, completo (`get_curso_ocupacion` ≥ `max_estudiantes`) o ya suscrito (`409`). Email y cliente de Stripe salen de la sesión.
- **toggle_cancel:** ahora requiere sesión y que la suscripción sea del usuario (o admin).
- **Web:** nada obligatorio. `useSuscripciones.ts` puede dejar de mandar `priceId`, `user_id`, `customer_email` y `customer_name`, y enviar `idioma`.

### `delete-account`
- **Cambio:** antes de borrar la cuenta cancela al momento sus suscripciones vivas en Stripe. Si alguna cancelación falla (salvo "ya no existe / ya cancelada") no borra la cuenta y responde `502`.
- **Contrato:** igual, `{ idioma? }` → `{ message }`.
- **Web:** nada (opcional: enviar `idioma` en `AreaPersonal.vue` ~1041).

### `stripe-webhook`
- **Creación de sesión (sin firma):** requiere sesión; `user_id` y email salen del token (se ignoran los del body). Cada franja se valida antes con `franja_reservable(p_fecha, p_hora)`; si alguna falla → `409 { error, franjasNoValidas: [{ fecha, hora }] }`. Precio fijo en servidor (3200 / 2700). Máximo 8 clases por pago (límite de 500 caracteres de la metadata). La sesión caduca a los 30 min.
- **checkout.session.completed – clases:**
  - Cada par (fecha, hora) se comprueba por separado (antes cruzaba todas las fechas con todas las horas y reembolsaba pedidos enteros sin motivo).
  - Antes de insertar se borran filas `cancelada` de esa franja (la restricción `UNIQUE(fecha, hora)` también las cuenta).
  - Si una franja no se puede insertar: reembolso **parcial** de esas franjas en el `payment_intent`, correo al alumno y a Paula, y se responde `200` a Stripe. Si el reembolso falla, Paula recibe "URGENTE: reembolso manual necesario".
  - Idempotente: si ya hay reservas con ese `stripe_payment_intent`, o un reembolso hecho por esta función, no se repite.
  - El evento de Google se crea después de insertar (no quedan eventos de franjas fallidas).
- **checkout.session.completed – `curso_cerrado` (nuevo):** inserta en `inscripciones_curso` con `on conflict (stripe_session_id) do nothing`; si el curso ya no está `Activo`, ha terminado o está completo → reembolso total, inscripción `reembolsada`, correo a Paula y al alumno. Si todo va bien: añade el `user_id` a `cursos_grupales.usuarios`, invita al evento de Google si existe y manda la confirmación (curso, fechas, días, horario de Madrid y del alumno, Meet, total pagado).
- **charge.refunded:** solo un reembolso **total** marca las reservas `cancelada` (antes cualquier reembolso parcial cancelaba todo el pedido) y la inscripción `reembolsada`.
- Bonos y materiales: misma lógica y mismos contratos; correos nuevos con la plantilla.
- **Web (recomendado):** `src/pages/CarritoCompra.vue` línea ~423 (`irAStripe`): enviar `{ reservas, idioma: locale.value, zonaHoraria: zonaUsuario() }` y, si la respuesta es `409`, marcar como conflictivas las de `franjasNoValidas`. El mensaje `errorData.error` ya se muestra tal cual. `user_id` y `user_email` se ignoran.

### `checkout-curso` (nueva)
- Requiere sesión. Curso con `tipo_curso = 'cerrado'`, `estado_curso = 'Activo'`, `visibilidad = true` y hoy (Madrid) < `fecha_fin`. Rechaza si ya está inscrito (`pagada`) o completo (`pagada` ≥ `max_estudiantes`), o si `precio_total_centimos` < 50.
- **Contrato:** `{ cursoId, idioma?, zonaHoraria? }` → `{ url }`. Metadata `{ tipo: 'curso_cerrado', curso_id, user_id, idioma?, zona? }`. Vuelta a `/ReservasCursos?id=<id>&pago=ok` (o sin `pago` si cancela).
- **Web (obligatorio para el producto nuevo):** en `src/pages/ReservasCursos.vue` (~472), si `curso.tipo_curso === 'cerrado'` llamar a `supabase.functions.invoke('checkout-curso', { body: { cursoId, idioma, zonaHoraria } })` en lugar de `handleSubscribe`, y mostrar el aviso de pago correcto con `?pago=ok`.

## Requisitos de base de datos antes de desplegar

Desplegar estas funciones **después** de aplicar la migración que crea:

1. `franja_reservable(p_fecha date, p_hora text) returns boolean` con `EXECUTE` para `service_role`. Se llama con la clave de servicio: no puede depender de `auth.uid()`. Sin ella, el pago con tarjeta de clases devuelve `500`.
2. Tabla `inscripciones_curso (curso_id bigint, user_id uuid, stripe_session_id text UNIQUE, stripe_payment_intent text, importe_centimos int, estado text)`. `estado` debe admitir `'pagada'` y `'reembolsada'`. `user_id` con `ON DELETE CASCADE` hacia `auth.users`, o `delete-account` fallará para alumnos inscritos.
3. Columnas en `cursos_grupales`: `tipo_curso`, `precio_total_centimos`, `duracion_minutos`. `subscription-webhook` (checkout) y `stripe-webhook` (curso cerrado) las leen: sin ellas esas consultas fallan.

## Despliegue

- Los archivos de `_shared/` se empaquetan con cada función (`supabase functions deploy <slug>`; con la herramienta MCP hay que incluirlos en `files`).
- Mantener `verify_jwt = false` en todas, incluida `checkout-curso`.
- Sin secretos nuevos.
- Los mensajes de error van en el JSON (`{ error }`). Con `supabase.functions.invoke`, un `4xx` llega como `FunctionsHttpError` y el texto está en `error.context` (respuesta), no en `error.message`.

## Riesgos abiertos

- **Plazas de cursos cerrados:** la comprobación de aforo no es atómica. Dos pagos simultáneos por la última plaza pueden acabar ambos reembolsados. Solución propuesta: función SQL `inscribir_en_curso` con `SELECT ... FOR UPDATE` sobre el curso.
- `cerrar-curso` solo gestiona suscripciones; no reembolsa inscripciones de cursos cerrados.
- `UNIQUE(fecha, hora)` en `reservas` cuenta filas `cancelada`. El webhook ya las libera, pero `reservar_con_credito` no: una franja reembolsada (marcada `cancelada`) no se puede volver a reservar con créditos. Propuesta: índice único parcial `WHERE estado = 'confirmada'`.
- `charge.refunded` total marca las reservas `cancelada` pero no borra el evento de Google (comportamiento anterior).
- `cancel-reserva` devuelve un crédito también por clases pagadas con tarjeta (comportamiento anterior, se mantiene).
- `notify-waitlist` envía con 0,6 s de pausa: con más de ~200 entradas puede superar el tiempo máximo de la función.
- Validación hecha sin Deno: sintaxis y tipos con `tsc` y módulos remotos simulados. Hay que probar en local (`supabase functions serve`) antes de producción.
