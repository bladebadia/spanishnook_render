# Esquema actual de la base de datos (producción)

Proyecto Supabase `zleqsdfpjepdangitcxv`. Exportado el 2026-11-07 con consultas SELECT sobre `information_schema` y `pg_catalog`. Postgres `supabase-postgres-17.4.1.074`.

Recuento de filas en el momento de la exportación: `Calendario` 383 (2025-12-01 → 2027-05-31), `datos_usuarios` 9, `reservas` 2 (ambas `cancelada`, 2026-04-07), `cursos_grupales` 0, `user_subscriptions` 0, `materiales_didacticos` 1, `compras_materiales` 0, `pagos_control` 0, `profiles` con `is_admin = true` 3.

## Tipos enumerados (schema public)

| Tipo | Valores |
|---|---|
| `tipo_dia` | laborable, festivo, especial |
| `estado_curso` | En reserva, Activo, Finalizado, En preparacion, Completo, Lista de espera |
| `estado_reserva` | reservada, facturada, terminada (no usado por ninguna columna) |
| `app_role` | admin, colaborador, usuario, anonimo (no usado) |
| `app_permisos` | eliminar, crear_fila, modificar (no usado) |
| `moneda` | €, $ (no usado) |

## Tablas

Todas las tablas de `public` tienen **RLS activado** (ninguna con `FORCE RLS`). `anon` y `authenticated` tienen los GRANT por defecto de Supabase (SELECT/INSERT/UPDATE/DELETE/TRUNCATE...) en todas salvo `profiles` (solo SELECT para `authenticated`), así que el control real lo hacen las políticas RLS.

### `Calendario` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| fecha | date | YES | |
| tipo_dia | tipo_dia | YES | |
| horario | text[] | YES | `'{}'::text[]` |
| created_at | timestamp without time zone | YES | `now()` |
| updated_at | timestamp without time zone | YES | `now()` |
| estado | text | YES | (valores vistos: `Habilitado`, `Deshabilitado`, null; todas las fechas futuras tienen null) |
| fecha_text | text | YES | (ej. `lunes, 15 de diciembre de 2025`) |

- PK `calendario_pkey (id)`; UNIQUE `calendario_fecha_key (fecha)`; índice extra `idx_configuracion_horarios_fecha (fecha)` (duplicado del UNIQUE).
- Formato de `horario`: array de horas de inicio en hora de Madrid, ej. `{09:00,10:00,11:00,12:00,13:00,15:00,16:00,17:00,18:00,19:00}`.

### `reservas` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | |
| fecha | date | NO | |
| hora | time without time zone | NO | |
| estado | text | YES | `'pendiente'::text` |
| created_at | timestamptz | YES | `now()` |
| updated_at | timestamptz | YES | `now()` |
| stripe_payment_intent | text | YES | |
| precio | integer | YES | (céntimos cuando viene de Stripe, euros cuando viene de `reservar_con_credito`) |
| tipo | text | YES | (`normal` / `conversacion`) |
| meet_link | text | YES | |
| google_event_id | text | YES | |

- PK `reservas_pkey (id)`.
- UNIQUE `reservas_fecha_hora_key (fecha, hora)` — aplica a todas las filas, también `cancelada`.
- CHECK `reservas_estado_check`: `estado IN ('pendiente','confirmada','cancelada','temporal','reservado')`.
- FK `user_id → auth.users(id) ON DELETE CASCADE` (sin índice).

### `datos_usuarios` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| created_at | timestamptz | NO | `now()` |
| user_id | uuid | YES | `auth.uid()` |
| nombre | text | NO | |
| apellido1 | text | YES | |
| email | text | NO | |
| telefono | text | YES | |
| saldo_normal | integer | YES | `0` |
| saldo_conversacion | integer | YES | `0` |
| idioma_nativo | text | YES | |
| nivel_estimado | text | YES | |
| ha_estudiado_antes | boolean | YES | |
| detalles_estudio_previo | text | YES | |
| uso_espanol | text | YES | |
| intereses | text[] | YES | |

- PK `usuarios_grupales_pkey (id)`; UNIQUE `usuarios_grupales_usuario_id_key (user_id)`; UNIQUE `datos_usuarios_email_key (email)`.
- FK `user_id → auth.users(id) ON DELETE CASCADE`.

### `cursos_grupales` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| created_at | timestamptz | NO | `now()` |
| codigo_curso | text | NO | |
| nombre_curso | text | NO | |
| estado_curso | estado_curso | YES | |
| fecha_inicio | date | YES | |
| fecha_fin | date | YES | |
| precio_curso | text | NO | |
| descripcion | text | YES | |
| usuarios | text[] | YES | `'{}'::text[]` |
| imagen_tarjeta | text | YES | |
| titulo_tarjeta | text | YES | |
| texto_tarjeta | text | YES | |
| boton_tarjeta | text | YES | |
| nivel | text | YES | |
| max_estudiantes | smallint | YES | |
| dias_semana | text[] | YES | `'{}'::text[]` |
| horarios_curso | text[] | YES | `'{}'::text[]` |
| visibilidad | boolean | YES | `true` |
| texto_promo | text | YES | |
| mostrar_promo | boolean | YES | |
| mostrar_precio | boolean | YES | |
| precio_original | text | YES | |
| lista_espera | text[] | YES | `'{}'::text[]` |
| stripe_price_id | text | YES | |
| meet_link | text | YES | |
| google_event_id | text | YES | |

- PK `reservasGrupales_pkey (id)`. Sin FKs ni CHECKs.

### `user_subscriptions` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | |
| stripe_customer_id | text | YES | |
| stripe_subscription_id | text | YES | |
| estado | text | YES | (estados de Stripe: active, trialing, canceled...) |
| current_period_start | timestamptz | YES | |
| current_period_end | timestamptz | YES | |
| created_at | timestamptz | YES | `now()` |
| updated_at | timestamptz | YES | `now()` |
| course_id | bigint | YES | |
| cancel_at_period_end | boolean | YES | `false` |

- PK `user_subscriptions_pkey (id)`; UNIQUE `user_subscriptions_stripe_subscription_id_key (stripe_subscription_id)`; UNIQUE `unique_user_course (user_id, course_id)`.
- FK `user_id → auth.users(id) ON DELETE CASCADE`; FK `user_subscriptions_course_id_fkey_cascade: course_id → cursos_grupales(id) ON DELETE CASCADE` (sin índice).

### `materiales_didacticos` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| titulo | text | NO | |
| descripcion_breve | text | YES | |
| descripcion_larga | text | YES | |
| youtube_url | text | YES | |
| imagen_portada | text | YES | |
| archivo_pdf | text | YES | |
| precio | numeric | NO | `0` |
| stripe_price_id | text | YES | |
| visible | boolean | YES | `false` |
| created_at | timestamptz | NO | `timezone('utc'::text, now())` |
| titulo_en | text | YES | |
| descripcion_breve_en | text | YES | |
| descripcion_larga_en | text | YES | |

- PK `materiales_didacticos_pkey (id)`.

### `compras_materiales` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | uuid | NO | `uuid_generate_v4()` |
| user_id | uuid | NO | |
| material_id | bigint | NO | |
| fecha_compra | timestamptz | NO | `timezone('utc'::text, now())` |

- PK `compras_materiales_pkey (id)`; UNIQUE `compras_materiales_user_id_material_id_key (user_id, material_id)`.
- FK `material_id → materiales_didacticos(id) ON DELETE CASCADE` (sin índice propio); FK `user_id → auth.users(id) ON DELETE CASCADE`.

### `pagos_control` (RLS: sí, sin políticas)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id_pago | text | NO | |
| user_id | uuid | YES | |
| procesado_at | timestamptz | YES | `now()` |

- PK `pagos_control_pkey (id_pago)`. Tabla de idempotencia de bonos (`procesar_bono_seguro`).

### `profiles` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| user_id | uuid | NO | |
| is_admin | boolean | NO | `false` |

- PK `profiles_pkey (user_id)`; FK `user_id → auth.users(id) ON DELETE CASCADE`.

### `mensajes_contacto` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| created_at | timestamptz | YES | `now()` |
| nombre | text | YES | |
| email | text | YES | |
| mensaje | text | YES | |
| leido | boolean | YES | `false` |

- PK `mensajes_contacto_pkey (id)`.

### `opiniones_verificadas` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| created_at | timestamptz | NO | `now()` |
| user_id | uuid | YES | `auth.uid()` |
| nombre | text | YES | |
| email | text | NO | |
| comentario | text | NO | |
| rating | real | NO | |
| verified | boolean | NO | |
| pais | text | YES | |

- PK `opiniones_verificadas_pkey (id)`; UNIQUE `opiniones_verificadas_user_id_key (user_id)`.

### `tarjetas` (RLS: sí)

| Columna | Tipo | Null | Default |
|---|---|---|---|
| id | bigint (identity by default) | NO | |
| created_at | timestamptz | NO | `now()` |
| imagen | text | YES | |
| titulo | text | YES | |
| texto | text | YES | |
| texto_boton | text | YES | |
| enlace | text | YES | |

- PK `tarjetas_pkey (id)`.

## Políticas RLS (`pg_policies`, schema public)

`ADMIN` = `EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)`. Todas son PERMISSIVE.

| Tabla | Política | Cmd | Roles | USING | WITH CHECK |
|---|---|---|---|---|---|
| Calendario | calendario_write_admin_only_delete | DELETE | authenticated | ADMIN | |
| Calendario | calendario_write_admin_only_insert | INSERT | authenticated | | ADMIN |
| Calendario | lectura para todos | SELECT | public | `true` | |
| Calendario | calendario_write_admin_only_update | UPDATE | authenticated | ADMIN | ADMIN |
| compras_materiales | Usuarios ven sus propias compras | SELECT | authenticated | `auth.uid() = user_id` | |
| cursos_grupales | cursos_grupales_admin_delete | DELETE | authenticated | ADMIN | |
| cursos_grupales | cursos_grupales_admin_insert | INSERT | authenticated | | ADMIN |
| cursos_grupales | cursos_grupales_select_authenticated | SELECT | anon, authenticated | `true` | |
| cursos_grupales | cursos_grupales_admin_update | UPDATE | authenticated | ADMIN | ADMIN |
| datos_usuarios | Enable insert for authenticated users only | INSERT | authenticated | | `true` |
| datos_usuarios | Usuarios pueden crear su propio perfil | INSERT | public | | `auth.uid() = user_id` |
| datos_usuarios | Admin ve todos los perfiles | SELECT | authenticated | ADMIN | |
| datos_usuarios | Enable read access for all users | SELECT | public | `true` | |
| datos_usuarios | Usuarios pueden ver su propio perfil | SELECT | public | `auth.uid() = user_id` | |
| datos_usuarios | Usuarios pueden editar su propio perfil | UPDATE | public | `auth.uid() = user_id` | (ninguno) |
| datos_usuarios | actualiza | UPDATE | public | `user_id = auth.uid()` | (ninguno) |
| materiales_didacticos | Admins gestionan catálogo | ALL | public | ADMIN | |
| materiales_didacticos | Publico puede ver catálogo | SELECT | public | `true` | |
| mensajes_contacto | permiso escritura | INSERT | public | | `true` |
| mensajes_contacto | Permiso actualiza | UPDATE | public | `true` | |
| opiniones_verificadas | opiniones_verificadas_insert_authenticated | INSERT | authenticated | | `true` |
| opiniones_verificadas | opiniones_verificadas_select_public | SELECT | public | `true` | |
| opiniones_verificadas | opiniones_verificadas_update_authenticated | UPDATE | authenticated | `user_id = (SELECT auth.uid())` | `user_id = (SELECT auth.uid())` |
| pagos_control | (ninguna) | | | | |
| profiles | Usuarios pueden ver su perfil | SELECT | authenticated | `auth.uid() = user_id` | |
| reservas | permisos_admin | ALL | authenticated | ADMIN | ADMIN |
| reservas | Usuarios pueden eliminar sus reservas | DELETE | public | `auth.uid() = user_id` | |
| reservas | Usuarios pueden crear sus reservas | INSERT | public | | `auth.uid() = user_id` |
| reservas | Usuarios pueden ver sus propias reservas | SELECT | public | `auth.uid() = user_id` | |
| reservas | Usuarios pueden actualizar sus reservas | UPDATE | public | `auth.uid() = user_id` | (ninguno) |
| tarjetas | Politica general | ALL | public | `true` | |
| user_subscriptions | Admin ve todas las suscripciones | SELECT | authenticated | ADMIN | |
| user_subscriptions | Los usuarios pueden ver sus propias suscripciones | SELECT | public | `auth.uid() = user_id` | |
| user_subscriptions | Ver mis propias suscripciones | SELECT | public | `auth.uid() = user_id` | |

### Storage (`storage.objects`)

| Política | Cmd | Roles | USING |
|---|---|---|---|
| Admins gestionan archivos | ALL | public | ADMIN |
| Publico puede ver portadas | SELECT | public | `bucket_id = 'portadas_materiales'` |

### Buckets

| Bucket | Público |
|---|---|
| imagenes | sí |
| pdfs_materiales | no |
| portadas_materiales | sí |
| video | sí |

## Triggers

| Tabla | Trigger | Función |
|---|---|---|
| auth.users | on_auth_user_created (AFTER INSERT) | public.handle_new_user() |
| public.profiles | on_profile_admin_change (AFTER INSERT OR UPDATE OF is_admin) | public.sync_admin_status() |
| public.reservas | update_reservas_updated_at (BEFORE UPDATE) | public.update_updated_at_column() |

(Los triggers internos de `storage.buckets` / `storage.objects` son de Supabase y no se listan.)

## Funciones / RPC (schema public)

Ninguna fija `search_path`. `anon` y `authenticated` tienen EXECUTE en todas salvo `custom_access_token_hook`.

| Función | Argumentos | Devuelve | SECURITY DEFINER |
|---|---|---|---|
| add_to_waitlist | p_course_id integer, p_email_or_id text | void | sí |
| check_email_exists | email_check text | boolean | sí |
| consumir_credito | user_uuid uuid, tipo_clase text | boolean | sí |
| custom_access_token_hook | event jsonb | jsonb | no |
| devolver_credito | user_uuid uuid, tipo_clase text | void | sí |
| get_curso_ocupacion | curso_id_param integer | integer | sí |
| handle_new_user | () | trigger | sí |
| limpiar_reservas_antiguas | () | void | sí |
| obtener_ocupacion | () | TABLE(fecha date, hora time) | sí |
| procesar_bono_seguro | p_user_id uuid, p_session_id text, p_cantidad integer, p_tipo text | boolean | no |
| procesar_compra_bono | p_user_id uuid, p_payment_intent_id text, p_creditos_a_sumar integer, p_tipo_credito text | boolean | no (usa la tabla `pagos_procesados`, que no existe) |
| reservar_con_credito | p_user_id uuid, p_tipo_clase text, p_fecha date, p_hora text, p_precio numeric, p_meet_link text DEFAULT NULL | json | sí |
| sumar_creditos | user_uuid uuid, cantidad integer, columna_destino text | void | sí |
| sync_admin_status | () | trigger | sí |
| update_updated_at_column | () | trigger | no |

### Definiciones completas (`pg_get_functiondef`)

```sql
CREATE OR REPLACE FUNCTION public.add_to_waitlist(p_course_id integer, p_email_or_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.cursos_grupales
  SET lista_espera = array_append(COALESCE(lista_espera, '{}'), p_email_or_id)
  WHERE id = p_course_id
  AND NOT (lista_espera @> ARRAY[p_email_or_id]); -- Solo si no está ya en la lista
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.check_email_exists(email_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Comprueba en la tabla de autenticación real
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = email_check);
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.consumir_credito(user_uuid uuid, tipo_clase text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  suficiente boolean;
BEGIN
  -- LÓGICA PARA CLASES NORMALES
  IF tipo_clase = 'normal' THEN
    -- Verificamos si tiene saldo positivo
    SELECT saldo_normal > 0 INTO suficiente FROM public.datos_usuarios WHERE user_id = user_uuid;
    
    IF suficiente THEN
       -- Restamos 1 crédito
       UPDATE public.datos_usuarios 
       SET saldo_normal = saldo_normal - 1 
       WHERE user_id = user_uuid;
       RETURN true; -- ¡Compra aceptada!
    ELSE
       RETURN false; -- Sin saldo, rechazar
    END IF;

  -- LÓGICA PARA CLASES DE CONVERSACIÓN
  ELSE
    SELECT saldo_conversacion > 0 INTO suficiente FROM public.datos_usuarios WHERE user_id = user_uuid;
    
    IF suficiente THEN
       UPDATE public.datos_usuarios 
       SET saldo_conversacion = saldo_conversacion - 1 
       WHERE user_id = user_uuid;
       RETURN true;
    ELSE
       RETURN false;
    END IF;
  END IF;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  claims jsonb;
  is_admin boolean;
begin
  -- Obtener flag is_admin desde profiles
  select p.is_admin
  into is_admin
  from public.profiles p
  where p.user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Asegurarnos de que app_metadata existe como objeto
  if jsonb_typeof(claims->'app_metadata') is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;

  -- Insertar o actualizar la flag is_admin dentro de app_metadata
  if is_admin is not null and is_admin = true then
    claims := jsonb_set(claims, '{app_metadata,is_admin}', 'true'::jsonb, true);
  else
    -- explícitamente poner false para mayor claridad (opcional)
    claims := jsonb_set(claims, '{app_metadata,is_admin}', 'false'::jsonb, true);
  end if;

  -- Volver a insertar 'claims' en el evento
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.devolver_credito(user_uuid uuid, tipo_clase text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF tipo_clase = 'normal' THEN
    UPDATE public.datos_usuarios 
    SET saldo_normal = COALESCE(saldo_normal, 0) + 1 
    WHERE user_id = user_uuid;
  ELSE
    UPDATE public.datos_usuarios 
    SET saldo_conversacion = COALESCE(saldo_conversacion, 0) + 1 
    WHERE user_id = user_uuid;
  END IF;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.get_curso_ocupacion(curso_id_param integer)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT count(*)::int
  FROM public.user_subscriptions
  WHERE course_id = curso_id_param
  AND estado IN ('active', 'trialing');
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.datos_usuarios (
    user_id,
    email,
    nombre,
    apellido1,
    idioma_nativo,
    nivel_estimado,
    ha_estudiado_antes,
    detalles_estudio_previo,
    uso_espanol,
    intereses,
    saldo_normal,
    saldo_conversacion
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    new.raw_user_meta_data->>'apellido1',
    new.raw_user_meta_data->>'idiomaNativo',
    new.raw_user_meta_data->>'nivelEstimado',
    (new.raw_user_meta_data->>'haEstudiadoAntes')::boolean,
    new.raw_user_meta_data->>'detallesEstudio',
    new.raw_user_meta_data->>'usoEspanol',
    -- Truco para convertir el array de JSON a array de texto de Postgres
    ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'intereses')), 
    0, -- Saldo inicial
    0  -- Saldo inicial
  );
  RETURN new;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.limpiar_reservas_antiguas()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  DELETE FROM reservas 
  WHERE fecha < CURRENT_DATE - INTERVAL '2 years' 
  AND estado = 'confirmada';
  
  -- Opcional: registrar la limpieza
  RAISE NOTICE 'Reservas antiguas limpiadas el %', CURRENT_DATE;
END;$function$
```

```sql
CREATE OR REPLACE FUNCTION public.obtener_ocupacion()
 RETURNS TABLE(fecha date, hora time without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT r.fecha, r.hora
  FROM reservas r
  WHERE r.estado = 'confirmada';
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.procesar_bono_seguro(p_user_id uuid, p_session_id text, p_cantidad integer, p_tipo text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    inserted_id TEXT;
BEGIN
    -- 1. Intentamos insertar. Si ya existe, NO hace nada y no devuelve id.
    -- Esto es una operación atómica a nivel de motor de base de datos.
    INSERT INTO pagos_control (id_pago, user_id)
    VALUES (p_session_id, p_user_id)
    ON CONFLICT (id_pago) DO NOTHING
    RETURNING id_pago INTO inserted_id;

    -- 2. Si no devolvió ID, significa que el pago ya estaba registrado (es un duplicado de Stripe).
    IF inserted_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 3. Si devolvió ID, el pago es nuevo. Sumamos los créditos.
    -- OJO: No leemos el saldo anterior, simplemente le decimos a la BD: "A lo que haya, súmale X".
    IF p_tipo = 'normal' THEN
        UPDATE datos_usuarios 
        SET saldo_normal = COALESCE(saldo_normal, 0) + p_cantidad 
        WHERE user_id = p_user_id;
    ELSE
        UPDATE datos_usuarios 
        SET saldo_conversacion = COALESCE(saldo_conversacion, 0) + p_cantidad 
        WHERE user_id = p_user_id;
    END IF;

    RETURN TRUE;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.procesar_compra_bono(p_user_id uuid, p_payment_intent_id text, p_creditos_a_sumar integer, p_tipo_credito text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_ya_existe BOOLEAN;
BEGIN
    -- Comprobamos si el pago ya existe (bloqueando la fila para evitar carreras)
    SELECT EXISTS (SELECT 1 FROM pagos_procesados WHERE payment_intent_id = p_payment_intent_id) INTO v_ya_existe;
    
    IF v_ya_existe THEN
        RETURN FALSE; -- Ya procesado, no hacemos nada
    END IF;

    -- Registramos el pago (Si dos intentan esto a la vez, uno fallará por el PRIMARY KEY)
    INSERT INTO pagos_procesados (payment_intent_id, user_id, tipo_compra)
    VALUES (p_payment_intent_id, p_user_id, 'bono_creditos');

    -- Sumamos los créditos según el tipo
    IF p_tipo_credito = 'normal' THEN
        UPDATE datos_usuarios SET saldo_normal = saldo_normal + p_creditos_a_sumar WHERE user_id = p_user_id;
    ELSIF p_tipo_credito = 'conversacion' THEN
        UPDATE datos_usuarios SET saldo_conversacion = saldo_conversacion + p_creditos_a_sumar WHERE user_id = p_user_id;
    END IF;

    RETURN TRUE;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.reservar_con_credito(p_user_id uuid, p_tipo_clase text, p_fecha date, p_hora text, p_precio numeric, p_meet_link text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_saldo_actual int;
  v_columna_saldo text;
  v_nueva_reserva_id uuid;
BEGIN
  -- 1. ELEGIR QUÉ SALDO MIRAR
  IF p_tipo_clase = 'normal' THEN
    SELECT saldo_normal INTO v_saldo_actual FROM datos_usuarios WHERE user_id = p_user_id;
  ELSE
    SELECT saldo_conversacion INTO v_saldo_actual FROM datos_usuarios WHERE user_id = p_user_id;
  END IF;

  -- 2. VALIDACIÓN SALDO
  IF v_saldo_actual IS NULL OR v_saldo_actual < 1 THEN
     RETURN json_build_object('success', false, 'message', 'No tienes saldo suficiente.');
  END IF;

  -- 3. INTENTO DE RESERVA (Con control de errores)
  BEGIN
    -- Insertamos primero para ver si choca. Si choca, salta al EXCEPTION de abajo.
    INSERT INTO reservas (user_id, fecha, hora, tipo, precio, estado, meet_link, created_at)
    VALUES (
        p_user_id, 
        p_fecha, 
        p_hora::time, 
        p_tipo_clase, 
        p_precio, 
        'confirmada', 
        p_meet_link, 
        now()
    )
    RETURNING id INTO v_nueva_reserva_id;

    -- Si ha llegado aquí, el hueco era libre. AHORA cobramos el crédito.
    IF p_tipo_clase = 'normal' THEN
       UPDATE datos_usuarios SET saldo_normal = saldo_normal - 1 WHERE user_id = p_user_id;
    ELSE
       UPDATE datos_usuarios SET saldo_conversacion = saldo_conversacion - 1 WHERE user_id = p_user_id;
    END IF;

    RETURN json_build_object('success', true, 'reserva_id', v_nueva_reserva_id);

  EXCEPTION 
    -- 👇 AQUÍ ESTÁ LA MAGIA PARA EL MENSAJE BONITO
    WHEN unique_violation THEN
      RETURN json_build_object('success', false, 'message', '¡Lo sentimos! Alguien acaba de reservar esa hora hace un instante.');
    WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'message', SQLERRM);
  END;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.sumar_creditos(user_uuid uuid, cantidad integer, columna_destino text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Si es para conversación
  if columna_destino = 'saldo_conversacion' then
    update datos_usuarios 
    set saldo_conversacion = coalesce(saldo_conversacion, 0) + cantidad
    where user_id = user_uuid;
  
  -- Si es para clases normales (cualquier otro valor)
  else
    update datos_usuarios 
    set saldo_normal = coalesce(saldo_normal, 0) + cantidad
    where user_id = user_uuid;
  end if;
end;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.sync_admin_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{is_admin}', 
    to_jsonb(NEW.is_admin)
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$function$
```

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

## Advisors de Supabase (2026-11-07)

### Seguridad

| Nivel | Hallazgo | Detalle |
|---|---|---|
| WARN | `anon_security_definer_function_executable` (11) | `anon` puede ejecutar por `/rest/v1/rpc/...` las SECURITY DEFINER: add_to_waitlist, check_email_exists, consumir_credito, devolver_credito, get_curso_ocupacion, handle_new_user, limpiar_reservas_antiguas, obtener_ocupacion, reservar_con_credito, sumar_creditos, sync_admin_status. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) |
| WARN | `authenticated_security_definer_function_executable` (11) | Las mismas 11 funciones, para `authenticated`. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) |
| WARN | `function_search_path_mutable` (15) | Ninguna función de `public` fija `search_path`. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) |
| WARN | `auth_otp_long_expiry` | El OTP de email caduca en más de 1 hora. [Docs](https://supabase.com/docs/guides/platform/going-into-prod#security) |
| WARN | `auth_leaked_password_protection` | Protección de contraseñas filtradas (HaveIBeenPwned) desactivada. [Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) |
| WARN | `vulnerable_postgres_version` | `supabase-postgres-17.4.1.074` tiene parches de seguridad pendientes. [Docs](https://supabase.com/docs/guides/platform/upgrading) |
| INFO | `rls_enabled_no_policy` | `public.pagos_control` tiene RLS sin políticas (correcto si solo la usa el service role). [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) |

El linter no marca las políticas `true` de escritura (`tarjetas` ALL, `mensajes_contacto` UPDATE, `datos_usuarios` SELECT público), pero son riesgos reales (ver informe).

### Rendimiento

| Nivel | Hallazgo | Detalle |
|---|---|---|
| INFO | `unindexed_foreign_keys` (3) | `compras_materiales.material_id`, `reservas.user_id`, `user_subscriptions.course_id`. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) |
| WARN | `auth_rls_initplan` (22) | Políticas que usan `auth.uid()` sin `(select auth.uid())` en reservas, datos_usuarios, user_subscriptions, Calendario, cursos_grupales, materiales_didacticos, profiles, compras_materiales. [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan) |
| WARN | `multiple_permissive_policies` (25) | Políticas duplicadas para el mismo rol/acción en datos_usuarios (SELECT, INSERT, UPDATE), materiales_didacticos (SELECT), reservas (todas), user_subscriptions (SELECT). [Docs](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies) |
