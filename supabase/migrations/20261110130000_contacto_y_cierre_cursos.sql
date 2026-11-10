-- =============================================================================
-- 1. mensajes_contacto: solo la Edge Function "contacto" escribe (clave de servicio).
--    Antes cualquiera podía insertar directamente con la clave pública (sin límite ni aviso).
--    Aplicar junto con el despliegue de la función y de la web que la usa.
-- 2. Tarea diaria: los cursos de fechas cerradas con fecha_fin pasada pasan a 'Finalizado'
--    (dejan de bloquear horas en el calendario y de aparecer como activos).
-- =============================================================================

drop policy if exists "permiso escritura" on public.mensajes_contacto;

-- Hora de Madrid: un curso que acaba hoy sigue activo hasta mañana
select cron.unschedule(jobid) from cron.job where jobname = 'finalizar-cursos-cerrados';
select cron.schedule(
  'finalizar-cursos-cerrados',
  '15 3 * * *',
  $$
    update public.cursos_grupales
    set estado_curso = 'Finalizado'
    where tipo_curso = 'cerrado'
      and fecha_fin is not null
      and fecha_fin < (now() at time zone 'Europe/Madrid')::date
      and estado_curso in ('Activo', 'Completo', 'Lista de espera', 'En reserva', 'En preparacion');
  $$
);
