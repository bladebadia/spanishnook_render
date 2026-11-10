-- =============================================================================
-- Inscripción a curso cerrado sin carreras
-- -----------------------------------------------------------------------------
-- Antes el webhook insertaba la inscripción y DESPUÉS contaba. Con una plaza libre y dos
-- pagos a la vez, los dos contaban 7/6 y se reembolsaba a los dos. Además, si un alumno
-- pagaba dos veces el mismo curso, el índice único hacía fallar el webhook y Stripe
-- reintentaba sin fin.
--
-- inscribir_curso_cerrado() bloquea la fila del curso (FOR UPDATE), comprueba y guarda en
-- una sola transacción. Devuelve:
--   'ok'         inscripción pagada creada
--   'duplicada'  ya se procesó esta sesión de Stripe (reintento del webhook)
--   otro texto   motivo de rechazo; la fila queda 'cancelada' y el webhook reembolsa
--                (y la pasa a 'reembolsada' si el reembolso sale bien)
-- Solo la usa stripe-webhook con la clave de servicio.
-- =============================================================================

create or replace function public.inscribir_curso_cerrado(
  p_curso_id bigint,
  p_user_id uuid,
  p_session_id text,
  p_payment_intent text,
  p_importe integer
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curso record;
  v_pagadas integer;
  v_motivo text;
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  -- Serializa las inscripciones de este curso
  select id, estado_curso, max_estudiantes, fecha_fin
    into v_curso
    from cursos_grupales
   where id = p_curso_id
   for update;

  if not found then
    -- Sin curso no se puede guardar la fila (clave foránea): solo se rechaza
    return 'el curso no existe';
  end if;

  -- Dentro del bloqueo: dos avisos simultáneos de la misma sesión no pasan los dos
  if exists (select 1 from inscripciones_curso where stripe_session_id = p_session_id) then
    return 'duplicada';
  end if;

  if v_curso.estado_curso <> 'Activo' then
    v_motivo := 'el curso está en estado ' || v_curso.estado_curso;
  elsif v_curso.fecha_fin is not null and v_hoy >= v_curso.fecha_fin then
    v_motivo := 'el curso ya ha terminado';
  elsif exists (select 1 from inscripciones_curso
                 where curso_id = p_curso_id and user_id = p_user_id and estado = 'pagada') then
    v_motivo := 'el alumno ya estaba inscrito';
  else
    select count(*) into v_pagadas
      from inscripciones_curso
     where curso_id = p_curso_id and estado = 'pagada';
    if v_curso.max_estudiantes is not null and v_pagadas >= v_curso.max_estudiantes then
      v_motivo := 'el curso está completo';
    end if;
  end if;

  insert into inscripciones_curso
    (curso_id, user_id, stripe_session_id, stripe_payment_intent, importe_centimos, estado)
  values
    (p_curso_id, p_user_id, p_session_id, p_payment_intent, greatest(coalesce(p_importe, 0), 0),
     case when v_motivo is null then 'pagada' else 'cancelada' end)
  on conflict (stripe_session_id) do nothing;

  return coalesce(v_motivo, 'ok');
end;
$$;

revoke all on function public.inscribir_curso_cerrado(bigint, uuid, text, text, integer) from public, anon, authenticated;
