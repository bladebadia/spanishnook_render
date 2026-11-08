-- PENDIENTE DE APLICAR (antes de activar el login con Google).
--
-- handle_new_user copiaba nombre de raw_user_meta_data->>'nombre', que solo existe en el
-- registro por correo. Las cuentas de Google traen full_name / name y datos_usuarios.nombre
-- es NOT NULL: el alta con Google fallaría con "Database error saving new user".
-- Ahora: nombre del registro → nombre de Google → parte del correo antes de la @.
-- Además fija search_path (aviso function_search_path_mutable del linter).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.datos_usuarios (
    user_id,
    email,
    nombre,
    apellido1,
    idioma_nativo,
    nivel_estimado,
    ha_estudiado_antes,
    detalles_estudio_previo,
    uso_espanol,
    intereses,
    saldo_normal,
    saldo_conversacion
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'nombre', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'apellido1',
    new.raw_user_meta_data->>'idiomaNativo',
    new.raw_user_meta_data->>'nivelEstimado',
    (new.raw_user_meta_data->>'haEstudiadoAntes')::boolean,
    new.raw_user_meta_data->>'detallesEstudio',
    new.raw_user_meta_data->>'usoEspanol',
    array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'intereses', '[]'::jsonb))),
    0,
    0
  );
  return new;
end;
$function$;
