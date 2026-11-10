-- =============================================================================
-- check_email_exists fuera de la API
-- -----------------------------------------------------------------------------
-- Dejaba a cualquiera, sin sesión y sin límite, comprobar si un email tiene cuenta.
-- El registro ya no la usa: detecta el email existente al crear la cuenta
-- (Supabase devuelve un usuario sin identidades y tiene límite de intentos).
-- Aplicar después de desplegar la web que ya no la llama.
-- =============================================================================

revoke execute on function public.check_email_exists(text) from public, anon, authenticated;
