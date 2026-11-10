-- =============================================================================
-- Opiniones y endurecimiento general
-- -----------------------------------------------------------------------------
-- 1. opiniones_verificadas
--    Antes: cualquier usuario con sesión podía insertar una opinión ya "verificada"
--    (salía en inicio sin aprobar), editar una aprobada y seguir verificada, y
--    cualquiera podía leer el email de quien opinaba.
--    Ahora: se publica solo lo verificado; cada alumno ve además la suya; al crear o
--    editar queda pendiente (verified = false) hasta que la apruebe la administradora;
--    el email no es legible desde la web.
-- 2. materiales_didacticos: el público solo lee los visibles (la administración, todos).
-- 3. search_path fijo en todas las funciones de public (aviso del linter).
-- 4. Funciones de trigger fuera de la API (no sirven fuera de un trigger).
-- =============================================================================

-- 1. Opiniones -----------------------------------------------------------------
drop policy if exists opiniones_verificadas_select_public on public.opiniones_verificadas;
drop policy if exists opiniones_verificadas_insert_authenticated on public.opiniones_verificadas;
drop policy if exists opiniones_verificadas_update_authenticated on public.opiniones_verificadas;

create policy opiniones_publicas_y_propias on public.opiniones_verificadas
  for select to anon, authenticated
  using (verified = true or user_id = (select auth.uid()));

create policy opiniones_crear_propia_pendiente on public.opiniones_verificadas
  for insert to authenticated
  with check (user_id = (select auth.uid()) and verified = false);

create policy opiniones_editar_propia_pendiente on public.opiniones_verificadas
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and verified = false);

create policy opiniones_admin on public.opiniones_verificadas
  for all to authenticated
  using (exists (select 1 from profiles where user_id = (select auth.uid()) and is_admin = true))
  with check (exists (select 1 from profiles where user_id = (select auth.uid()) and is_admin = true));

-- El email solo lo guarda la web y lo ve la administración (por la clave de servicio o el panel)
revoke select on public.opiniones_verificadas from anon, authenticated;
grant select (id, created_at, user_id, nombre, pais, rating, comentario, verified)
  on public.opiniones_verificadas to anon, authenticated;

-- 2. Materiales: el público solo ve los visibles ----------------------------------
drop policy if exists "Publico puede ver catálogo" on public.materiales_didacticos;
create policy "Publico ve materiales visibles" on public.materiales_didacticos
  for select to anon, authenticated
  using (visible = true);

-- 3. search_path fijo ------------------------------------------------------------
alter function public.update_updated_at_column() set search_path = public;
alter function public.sync_admin_status() set search_path = public;
alter function public.consumir_credito(uuid, text) set search_path = public;
alter function public.custom_access_token_hook(jsonb) set search_path = public;
alter function public.check_email_exists(text) set search_path = public;
alter function public.procesar_bono_seguro(uuid, text, integer, text) set search_path = public;
alter function public.sumar_creditos(uuid, integer, text) set search_path = public;
alter function public.devolver_credito(uuid, text) set search_path = public;
alter function public.procesar_compra_bono(uuid, text, integer, text) set search_path = public;
alter function public.limpiar_reservas_antiguas() set search_path = public;

-- 4. Funciones de trigger fuera de la API -----------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_admin_status() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
