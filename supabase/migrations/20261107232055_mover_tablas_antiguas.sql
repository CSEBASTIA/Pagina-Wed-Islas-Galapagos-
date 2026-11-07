-- Mueve las tablas de la web anterior al esquema "legacy" sin borrar datos.
-- El esquema legacy no se expone por la API, así que esos datos dejan de ser
-- accesibles desde la web pero se conservan.
create schema if not exists legacy;
revoke all on schema legacy from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['activities', 'reservations', 'reviews', 'tours'] loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table public.%I set schema legacy', t);
    end if;
  end loop;
end $$;
