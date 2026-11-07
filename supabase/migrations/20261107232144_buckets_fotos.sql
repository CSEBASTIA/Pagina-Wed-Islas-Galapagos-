-- Buckets de fotos.
--   galeria: público (las fotos se ven por URL), solo administradores suben o borran.
--   envios:  privado, fotos de visitantes pendientes de revisión.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('galeria', 'galeria', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('envios', 'envios', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- galeria: sin regla de lectura pública para evitar que se pueda listar el bucket;
-- las fotos se siguen viendo por su URL pública.
create policy "Admins listan la galería" on storage.objects
  for select to authenticated using (bucket_id = 'galeria' and (select private.is_admin()));
create policy "Admins suben a la galería" on storage.objects
  for insert to authenticated with check (bucket_id = 'galeria' and (select private.is_admin()));
create policy "Admins reemplazan en la galería" on storage.objects
  for update to authenticated using (bucket_id = 'galeria' and (select private.is_admin()))
  with check (bucket_id = 'galeria' and (select private.is_admin()));
create policy "Admins borran de la galería" on storage.objects
  for delete to authenticated using (bucket_id = 'galeria' and (select private.is_admin()));

-- envios: solo administradores leen (para revisar) y borran. Las subidas las
-- hace la Edge Function con la clave de servicio.
create policy "Admins ven los envíos" on storage.objects
  for select to authenticated using (bucket_id = 'envios' and (select private.is_admin()));
create policy "Admins borran los envíos" on storage.objects
  for delete to authenticated using (bucket_id = 'envios' and (select private.is_admin()));
