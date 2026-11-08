-- Categoría de los cursos en grupo: conversación o general (gramática, vocabulario...).
-- Independiente de tipo_curso (suscripción mensual o fechas cerradas con pago único).
-- Los cursos existentes quedan como 'conversacion', que es lo que eran hasta ahora.
alter table public.cursos_grupales
  add column if not exists categoria text not null default 'conversacion';

alter table public.cursos_grupales
  drop constraint if exists cursos_grupales_categoria_check;
alter table public.cursos_grupales
  add constraint cursos_grupales_categoria_check
  check (categoria in ('conversacion', 'general'));
