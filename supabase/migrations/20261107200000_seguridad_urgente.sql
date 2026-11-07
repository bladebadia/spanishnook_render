-- =============================================================================
-- Seguridad urgente (7-nov-2026)
-- Problemas confirmados en producción:
--   1. Cualquiera (sin sesión) podía leer todos los perfiles: email, teléfono, saldo.
--   2. Un usuario podía cambiarse su propio saldo de créditos con un UPDATE.
--   3. Cualquiera (sin sesión) podía ejecutar sumar_creditos / devolver_credito /
--      consumir_credito / procesar_* y regalarse créditos o quitárselos a otros.
--   4. reservar_con_credito aceptaba cualquier p_user_id: se podían gastar créditos ajenos.
--   5. Un usuario podía crear o confirmar reservas directamente en la tabla sin pagar.
--   6. Cualquiera podía modificar mensajes de contacto y la tabla tarjetas.
--
-- Comprobado antes de escribir esto:
--   - La web solo lee/escribe el perfil propio; el panel usa la política de admin.
--   - Ninguna página escribe en reservas salvo el panel (política permisos_admin).
--   - Las Edge Functions usan la clave de servicio (no les afectan RLS ni estos GRANT).
--   - Nadie modifica el saldo desde la web salvo a través de funciones del servidor.
-- Todo el script va en una transacción: si algo falla, no se aplica nada.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1 y 2. datos_usuarios: cada uno ve y edita lo suyo, y nunca su saldo
-- ---------------------------------------------------------------------------
drop policy if exists "Enable read access for all users" on public.datos_usuarios;
drop policy if exists "Enable insert for authenticated users only" on public.datos_usuarios;
drop policy if exists "actualiza" on public.datos_usuarios;
alter policy "Usuarios pueden editar su propio perfil" on public.datos_usuarios
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Permisos por columna: el saldo y el email no se pueden escribir desde la web.
-- (Las funciones SECURITY DEFINER y la clave de servicio no se ven afectadas.)
revoke insert, update on public.datos_usuarios from anon, authenticated;
grant insert (user_id, nombre, apellido1, email, telefono, idioma_nativo, nivel_estimado,
              ha_estudiado_antes, detalles_estudio_previo, uso_espanol, intereses)
  on public.datos_usuarios to authenticated;
grant update (user_id, nombre, apellido1, telefono, idioma_nativo, nivel_estimado,
              ha_estudiado_antes, detalles_estudio_previo, uso_espanol, intereses)
  on public.datos_usuarios to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Funciones de créditos: solo las llama el servidor (clave de servicio)
-- ---------------------------------------------------------------------------
revoke execute on function public.sumar_creditos(uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.devolver_credito(uuid, text) from public, anon, authenticated;
revoke execute on function public.consumir_credito(uuid, text) from public, anon, authenticated;
revoke execute on function public.procesar_bono_seguro(uuid, text, integer, text) from public, anon, authenticated;
revoke execute on function public.procesar_compra_bono(uuid, text, integer, text) from public, anon, authenticated;
revoke execute on function public.limpiar_reservas_antiguas() from public, anon, authenticated;
grant execute on function public.sumar_creditos(uuid, integer, text) to service_role;
grant execute on function public.devolver_credito(uuid, text) to service_role;
grant execute on function public.consumir_credito(uuid, text) to service_role;
grant execute on function public.procesar_bono_seguro(uuid, text, integer, text) to service_role;
grant execute on function public.procesar_compra_bono(uuid, text, integer, text) to service_role;
grant execute on function public.limpiar_reservas_antiguas() to service_role;

-- ---------------------------------------------------------------------------
-- 4. reservar_con_credito: el usuario es el de la sesión, el precio lo fija el
--    servidor y se comprueban calendario, antelación de 24 h y saldo con bloqueo.
--    Misma firma y misma respuesta JSON: la web no necesita cambios.
-- ---------------------------------------------------------------------------
create or replace function public.reservar_con_credito(
  p_user_id uuid,
  p_tipo_clase text,
  p_fecha date,
  p_hora text,
  p_precio numeric,
  p_meet_link text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hora time;
  v_precio numeric;
  v_saldo int;
  v_reserva_id uuid;
begin
  if v_uid is null then
    return json_build_object('success', false, 'message', 'Debes iniciar sesión para reservar.');
  end if;
  -- p_user_id se mantiene por compatibilidad, pero debe ser el propio usuario
  if p_user_id is distinct from v_uid then
    return json_build_object('success', false, 'message', 'No autorizado.');
  end if;
  if p_tipo_clase not in ('normal', 'conversacion') then
    return json_build_object('success', false, 'message', 'Tipo de clase no válido.');
  end if;

  v_hora := left(p_hora, 5)::time;
  -- Precio fijado en el servidor (antes lo mandaba la web)
  v_precio := case when p_tipo_clase = 'normal' then 32 else 27 end;

  -- Antelación mínima de 24 h, con la hora de Madrid del día de la clase
  if ((p_fecha + v_hora) at time zone 'Europe/Madrid') < now() + interval '24 hours' then
    return json_build_object('success', false, 'message', 'Las clases se reservan con al menos 24 horas de antelación.');
  end if;

  -- La franja tiene que existir en el calendario de Paula
  if not exists (
    select 1
    from "Calendario" c
    where c.fecha = p_fecha
      and c.tipo_dia::text in ('laborable', 'especial')
      and to_char(v_hora, 'HH24:MI') = any (select left(h, 5) from unnest(c.horario) h)
  ) then
    return json_build_object('success', false, 'message', 'Esa hora no está disponible.');
  end if;

  -- Saldo con bloqueo de fila: dos reservas a la vez no gastan el mismo crédito
  select case when p_tipo_clase = 'normal' then saldo_normal else saldo_conversacion end
    into v_saldo
    from datos_usuarios
   where user_id = v_uid
   for update;

  if coalesce(v_saldo, 0) < 1 then
    return json_build_object('success', false, 'message', 'No tienes saldo suficiente.');
  end if;

  begin
    insert into reservas (user_id, fecha, hora, tipo, precio, estado, meet_link, created_at)
    values (v_uid, p_fecha, v_hora, p_tipo_clase, v_precio, 'confirmada', null, now())
    returning id into v_reserva_id;

    if p_tipo_clase = 'normal' then
      update datos_usuarios set saldo_normal = saldo_normal - 1 where user_id = v_uid;
    else
      update datos_usuarios set saldo_conversacion = saldo_conversacion - 1 where user_id = v_uid;
    end if;

    return json_build_object('success', true, 'reserva_id', v_reserva_id);
  exception
    when unique_violation then
      return json_build_object('success', false, 'message', '¡Lo sentimos! Alguien acaba de reservar esa hora hace un instante.');
  end;
end;
$$;

revoke execute on function public.reservar_con_credito(uuid, text, date, text, numeric, text) from public, anon;
grant execute on function public.reservar_con_credito(uuid, text, date, text, numeric, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5. reservas: el alumno solo las ve; las crean/cambian el servidor y el admin
-- ---------------------------------------------------------------------------
drop policy if exists "Usuarios pueden crear sus reservas" on public.reservas;
drop policy if exists "Usuarios pueden actualizar sus reservas" on public.reservas;
drop policy if exists "Usuarios pueden eliminar sus reservas" on public.reservas;

-- ---------------------------------------------------------------------------
-- 6. mensajes_contacto y tarjetas
-- ---------------------------------------------------------------------------
drop policy if exists "Permiso actualiza" on public.mensajes_contacto;
create policy "Admin gestiona mensajes" on public.mensajes_contacto
  for all to authenticated
  using (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.is_admin = true));

drop policy if exists "Politica general" on public.tarjetas;
create policy "Lectura publica de tarjetas" on public.tarjetas
  for select to anon, authenticated using (true);
create policy "Admin gestiona tarjetas" on public.tarjetas
  for all to authenticated
  using (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.user_id = auth.uid() and profiles.is_admin = true));

commit;
