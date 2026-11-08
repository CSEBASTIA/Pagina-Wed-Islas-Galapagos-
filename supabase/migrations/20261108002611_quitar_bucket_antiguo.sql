-- Reglas del bucket "galleries" de la web anterior (vacío). Una de ellas permitía
-- listar el bucket públicamente. El bucket vacío se borra desde el panel de
-- Supabase (Storage), porque no se permite borrarlo por SQL.
drop policy if exists "galleries_public_read" on storage.objects;
drop policy if exists "galleries_insert_service" on storage.objects;
drop policy if exists "galleries_update_service" on storage.objects;
drop policy if exists "galleries_delete_service" on storage.objects;
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'galleries\_%' loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;
