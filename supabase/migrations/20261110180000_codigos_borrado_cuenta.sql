-- =============================================================================
-- Códigos para confirmar el borrado de cuentas sin contraseña (creadas con Google)
-- -----------------------------------------------------------------------------
-- delete-account envía un código de 6 dígitos al email de la cuenta y guarda aquí solo
-- su hash (SHA-256 de "user_id:código"), con caducidad e intentos. Al borrar, el servidor
-- lo comprueba. Las cuentas con contraseña confirman con la contraseña (también en el
-- servidor). Solo la usa la Edge Function con la clave de servicio: RLS sin políticas.
-- =============================================================================

create table if not exists public.codigos_borrado_cuenta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  codigo_hash text not null,
  expira timestamptz not null,
  intentos smallint not null default 0,
  creado timestamptz not null default now()
);

alter table public.codigos_borrado_cuenta enable row level security;
revoke all on public.codigos_borrado_cuenta from anon, authenticated;
