-- =============================================================================
-- Textos de los cursos en inglés
-- -----------------------------------------------------------------------------
-- textos_en guarda la traducción opcional de los textos que ve el alumno:
--   { nombre_curso, descripcion, titulo_tarjeta, texto_tarjeta, boton_tarjeta, texto_promo }
-- La web los usa cuando está en inglés y el campo tiene texto; si no, el español.
-- Lectura pública por columna, como el resto de columnas visibles (20261110120000).
-- =============================================================================

alter table public.cursos_grupales
  add column if not exists textos_en jsonb not null default '{}'::jsonb;

alter table public.cursos_grupales
  drop constraint if exists cursos_grupales_textos_en_objeto;
alter table public.cursos_grupales
  add constraint cursos_grupales_textos_en_objeto check (jsonb_typeof(textos_en) = 'object');

grant select (textos_en) on public.cursos_grupales to anon, authenticated;
