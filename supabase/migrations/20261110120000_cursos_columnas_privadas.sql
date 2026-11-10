-- =============================================================================
-- cursos_grupales: columnas privadas fuera de la lectura pública
-- -----------------------------------------------------------------------------
-- Antes, anon y authenticated podían leer TODAS las columnas (política SELECT true):
-- meet_link y google_event_id del curso, usuarios (ids de alumnos) y lista_espera
-- (ids y emails de invitados). Ahora:
--   - Lectura pública solo de las columnas que la web necesita (permiso por columna).
--   - La administradora lee todo con admin_cursos().
--   - El alumno obtiene el Meet de SUS cursos con mis_cursos_meet().
--   - La ficha de curso pregunta si ya estás en la lista con en_lista_espera().
--   - add_to_waitlist: con sesión solo te apuntas a ti; sin sesión, solo un email válido.
-- Las Edge Functions usan la clave de servicio y no se ven afectadas.
-- =============================================================================

-- 1. Permisos de columna
revoke select on public.cursos_grupales from anon, authenticated;
grant select (
  id, created_at, codigo_curso, nombre_curso, estado_curso, fecha_inicio, fecha_fin,
  precio_curso, descripcion, imagen_tarjeta, titulo_tarjeta, texto_tarjeta, boton_tarjeta,
  nivel, max_estudiantes, dias_semana, horarios_curso, visibilidad, texto_promo,
  mostrar_promo, mostrar_precio, precio_original, stripe_price_id, tipo_curso,
  precio_total_centimos, duracion_minutos, categoria
) on public.cursos_grupales to anon, authenticated;

-- 2. Administradora: todos los cursos con todas sus columnas
create or replace function public.admin_cursos()
returns setof public.cursos_grupales
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where user_id = auth.uid() and is_admin = true) then
    raise exception 'Solo administración' using errcode = '42501';
  end if;
  return query select * from cursos_grupales order by created_at desc;
end;
$$;
revoke all on function public.admin_cursos() from public, anon;
grant execute on function public.admin_cursos() to authenticated;

-- 3. Alumno: enlace de Meet de los cursos en los que está (suscripción viva o inscripción pagada)
create or replace function public.mis_cursos_meet()
returns table (curso_id bigint, meet_link text)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.meet_link
  from cursos_grupales c
  where c.meet_link is not null
    and (
      exists (select 1 from user_subscriptions s
              where s.course_id = c.id and s.user_id = auth.uid()
                and s.estado in ('active', 'trialing'))
      or exists (select 1 from inscripciones_curso i
                 where i.curso_id = c.id and i.user_id = auth.uid() and i.estado = 'pagada')
    );
$$;
revoke all on function public.mis_cursos_meet() from public, anon;
grant execute on function public.mis_cursos_meet() to authenticated;

-- 4. ¿Ya estoy en la lista de espera? (con sesión: mi id; sin sesión: el email que escribo)
create or replace function public.en_lista_espera(p_course_id bigint, p_email text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select lista_espera @> array[
      case when auth.uid() is not null then auth.uid()::text
           else lower(trim(coalesce(p_email, ''))) end
    ]
    from cursos_grupales where id = p_course_id
  ), false);
$$;
revoke all on function public.en_lista_espera(bigint, text) from public;
grant execute on function public.en_lista_espera(bigint, text) to anon, authenticated;

-- 5. Apuntarse a la lista de espera sin poder apuntar a otros
create or replace function public.add_to_waitlist(p_course_id integer, p_email_or_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valor text;
begin
  if auth.uid() is not null then
    v_valor := auth.uid()::text;
  else
    v_valor := lower(trim(coalesce(p_email_or_id, '')));
    if v_valor !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_valor) > 254 then
      raise exception 'Email no válido' using errcode = '22023';
    end if;
  end if;

  update cursos_grupales
  set lista_espera = array_append(coalesce(lista_espera, '{}'), v_valor)
  where id = p_course_id
    and not (coalesce(lista_espera, '{}') @> array[v_valor]);
end;
$$;
revoke all on function public.add_to_waitlist(integer, text) from public;
grant execute on function public.add_to_waitlist(integer, text) to anon, authenticated;
