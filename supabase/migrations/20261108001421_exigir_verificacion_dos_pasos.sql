-- Un administrador solo tiene permisos si su sesión pasó la verificación en dos
-- pasos (nivel aal2). Con solo la contraseña (aal1), la base de datos lo trata
-- como un usuario sin permisos. Afecta a todas las reglas que usan private.is_admin(),
-- incluidas las de los buckets de fotos.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
