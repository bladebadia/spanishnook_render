-- =============================================================================
-- Curso de fechas cerradas + calendario de clases integrado con los cursos
--
-- 1. cursos_grupales: tipo_curso ('suscripcion' | 'cerrado'), precio total en
--    céntimos y duración de cada sesión. fecha_inicio y fecha_fin ya existían.
-- 2. inscripciones_curso: pagos únicos de cursos cerrados (las crea el webhook).
-- 3. franjas_cursos(): horas que ocupa cada curso activo, solo entre sus fechas.
-- 4. obtener_ocupacion() devuelve también esas franjas: la web deja de ofrecerlas
--    para clases individuales sin bloquearlas a mano.
-- 5. franja_reservable() y reservar_con_credito(): la misma regla en el servidor.
-- =============================================================================

begin;

-- 1. Tipo de curso ------------------------------------------------------------
alter table public.cursos_grupales
  add column if not exists tipo_curso text not null default 'suscripcion',
  add column if not exists precio_total_centimos integer,
  add column if not exists duracion_minutos smallint not null default 90;

alter table public.cursos_grupales
  add constraint cursos_grupales_tipo_curso_check
    check (tipo_curso in ('suscripcion', 'cerrado')),
  add constraint cursos_grupales_precio_total_check
    check (precio_total_centimos is null or precio_total_centimos >= 50),
  add constraint cursos_grupales_duracion_check
    check (duracion_minutos between 15 and 240),
  -- Un curso cerrado necesita fechas válidas y precio (mínimo de Stripe: 0,50 €)
  add constraint cursos_grupales_cerrado_completo_check
    check (
      tipo_curso <> 'cerrado'
      or (fecha_inicio is not null and fecha_fin is not null
          and fecha_fin >= fecha_inicio and precio_total_centimos is not null)
    );

-- 2. Inscripciones a cursos cerrados -------------------------------------------
create table if not exists public.inscripciones_curso (
  id uuid primary key default gen_random_uuid(),
  curso_id bigint not null references public.cursos_grupales(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_session_id text unique,
  stripe_payment_intent text,
  importe_centimos integer not null check (importe_centimos >= 0),
  estado text not null default 'pagada' check (estado in ('pagada', 'reembolsada', 'cancelada')),
  created_at timestamptz not null default now()
);
create unique index if not exists inscripciones_curso_unica_pagada
  on public.inscripciones_curso (curso_id, user_id) where estado = 'pagada';
create index if not exists inscripciones_curso_user_idx on public.inscripciones_curso (user_id);

alter table public.inscripciones_curso enable row level security;
-- El alumno ve las suyas; el admin todas. Nadie escribe desde la web (lo hace el webhook).
create policy "Alumno ve sus inscripciones" on public.inscripciones_curso
  for select to authenticated using (auth.uid() = user_id);
create policy "Admin gestiona inscripciones" on public.inscripciones_curso
  for all to authenticated
  using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true));

-- 2b. Una hora solo puede estar reservada una vez, pero las canceladas ya no
--     bloquean el hueco (antes la restricción única contaba también las canceladas).
alter table public.reservas drop constraint if exists reservas_fecha_hora_key;
create unique index if not exists reservas_fecha_hora_confirmada
  on public.reservas (fecha, hora) where estado = 'confirmada';

-- 3. Franjas ocupadas por cursos ----------------------------------------------
-- Para cada curso Activo o Completo: los días de la semana del curso entre su
-- fecha de inicio y su fecha de fin (los de suscripción no tienen fin), y cada
-- hora en punto que se solapa con la sesión (inicio + duración).
-- Ej.: curso los martes 18:30, 90 min → bloquea las 18:00 y las 19:00.
create or replace function public.franjas_cursos(p_desde date, p_hasta date)
returns table (fecha date, hora time, curso_id bigint)
language sql
stable
security definer
set search_path = public
as $$
  with cursos as (
    select c.id,
           c.dias_semana,
           c.horarios_curso,
           c.duracion_minutos,
           greatest(coalesce(c.fecha_inicio, p_desde), p_desde) as desde,
           least(coalesce(c.fecha_fin, p_hasta), p_hasta) as hasta
      from cursos_grupales c
     where c.estado_curso::text in ('Activo', 'Completo')
  ),
  dias as (
    select c.id, d::date as fecha, c.horarios_curso, c.duracion_minutos
      from cursos c
     cross join lateral generate_series(c.desde, c.hasta, interval '1 day') d
     where c.desde <= c.hasta
       and (array['domingo','lunes','martes','miercoles','jueves','viernes','sabado'])[extract(dow from d)::int + 1]
           = any (select lower(translate(x, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou')) from unnest(c.dias_semana) x)
  )
  select dd.fecha, s::time as hora, dd.id as curso_id
    from dias dd
   cross join lateral unnest(dd.horarios_curso) h
   cross join lateral generate_series(
           date_trunc('hour', ('2000-01-01 ' || left(h, 5))::timestamp),
           ('2000-01-01 ' || left(h, 5))::timestamp + make_interval(mins => dd.duracion_minutos) - interval '1 minute',
           interval '1 hour') s
   where h ~ '^\d{1,2}:\d{2}';
$$;

revoke execute on function public.franjas_cursos(date, date) from public, anon;
grant execute on function public.franjas_cursos(date, date) to authenticated, service_role;

-- 4. Ocupación pública: reservas confirmadas + cursos (sin datos personales) --
create or replace function public.obtener_ocupacion()
returns table (fecha date, hora time)
language sql
stable
security definer
set search_path = public
as $$
  select r.fecha, r.hora from reservas r where r.estado = 'confirmada'
  union
  select f.fecha, f.hora
    from franjas_cursos(current_date, (current_date + interval '10 months')::date) f;
$$;

grant execute on function public.obtener_ocupacion() to anon, authenticated, service_role;

-- Plazas ocupadas: suscripciones activas + inscripciones pagadas de cursos cerrados
create or replace function public.get_curso_ocupacion(curso_id_param integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select (
    (select count(*) from user_subscriptions
      where course_id = curso_id_param and estado in ('active', 'trialing'))
    +
    (select count(*) from inscripciones_curso
      where curso_id = curso_id_param and estado = 'pagada')
  )::int;
$$;

-- 5. ¿Se puede reservar esta franja? (lo usan el checkout y el canje de créditos)
create or replace function public.franja_reservable(p_fecha date, p_hora text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_hora time := left(p_hora, 5)::time;
begin
  -- 24 h de antelación, con la hora de Madrid de ese día
  if ((p_fecha + v_hora) at time zone 'Europe/Madrid') < now() + interval '24 hours' then
    return false;
  end if;
  -- Existe en el calendario de Paula
  if not exists (
    select 1 from "Calendario" c
     where c.fecha = p_fecha
       and c.tipo_dia::text in ('laborable', 'especial')
       and to_char(v_hora, 'HH24:MI') = any (select left(h, 5) from unnest(c.horario) h)
  ) then
    return false;
  end if;
  -- No hay otra reserva ni un curso a esa hora
  if exists (select 1 from reservas r where r.fecha = p_fecha and r.hora = v_hora and r.estado = 'confirmada') then
    return false;
  end if;
  if exists (select 1 from franjas_cursos(p_fecha, p_fecha) f where f.hora = v_hora) then
    return false;
  end if;
  return true;
end;
$$;

revoke execute on function public.franja_reservable(date, text) from public, anon;
grant execute on function public.franja_reservable(date, text) to authenticated, service_role;

-- reservar_con_credito: además, que no coincida con un curso
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
  if p_user_id is distinct from v_uid then
    return json_build_object('success', false, 'message', 'No autorizado.');
  end if;
  if p_tipo_clase not in ('normal', 'conversacion') then
    return json_build_object('success', false, 'message', 'Tipo de clase no válido.');
  end if;

  v_hora := left(p_hora, 5)::time;
  v_precio := case when p_tipo_clase = 'normal' then 32 else 27 end;

  if ((p_fecha + v_hora) at time zone 'Europe/Madrid') < now() + interval '24 hours' then
    return json_build_object('success', false, 'message', 'Las clases se reservan con al menos 24 horas de antelación.');
  end if;

  if not exists (
    select 1
    from "Calendario" c
    where c.fecha = p_fecha
      and c.tipo_dia::text in ('laborable', 'especial')
      and to_char(v_hora, 'HH24:MI') = any (select left(h, 5) from unnest(c.horario) h)
  ) then
    return json_build_object('success', false, 'message', 'Esa hora no está disponible.');
  end if;

  if exists (select 1 from franjas_cursos(p_fecha, p_fecha) f where f.hora = v_hora) then
    return json_build_object('success', false, 'message', 'Esa hora coincide con un curso.');
  end if;

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

commit;
