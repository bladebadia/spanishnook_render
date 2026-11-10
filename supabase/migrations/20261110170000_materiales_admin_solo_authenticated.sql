-- =============================================================================
-- Arreglo de 20261110150000
-- -----------------------------------------------------------------------------
-- La política de administración de materiales se aplicaba a todos los roles (public) y
-- consulta profiles, que anon no puede leer. Mientras la lectura pública era "true" no
-- se evaluaba; al pasar a "visible = true", los visitantes sin sesión recibían
-- "permission denied for table profiles" y la página de Materiales fallaba.
-- Aplicada el 10-nov justo después de detectarlo.
-- =============================================================================

drop policy if exists "Admins gestionan catálogo" on public.materiales_didacticos;
create policy "Admins gestionan catálogo" on public.materiales_didacticos
  for all to authenticated
  using (exists (select 1 from profiles where profiles.user_id = (select auth.uid()) and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.user_id = (select auth.uid()) and profiles.is_admin = true));
