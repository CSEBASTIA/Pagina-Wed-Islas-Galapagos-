-- Las tablas antiguas (legacy) no deben ser legibles por visitantes ni usuarios.
revoke all on all tables in schema legacy from anon, authenticated;
revoke all on all sequences in schema legacy from anon, authenticated;

-- rls_auto_enable() es la función del disparador de eventos que activa RLS en
-- tablas nuevas. Solo la usa ese disparador; nadie debe poder llamarla por la API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
