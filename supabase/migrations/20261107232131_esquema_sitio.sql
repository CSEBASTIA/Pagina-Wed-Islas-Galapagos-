-- Esquema de Golden Ray I: tours, salidas, galería, envíos de fotos y administradores.

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (esquema privado: no se expone por la API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.today_galapagos()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Pacific/Galapagos')::date;
$$;

create or replace function private.short_items(items text[], max_len integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(char_length(item) between 1 and max_len), true)
  from unnest(items) as item;
$$;

-- ---------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  created_at timestamptz not null default now()
);
comment on table public.admins is 'Usuarios de Supabase Auth autorizados a usar el panel /gestion.';

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.today_galapagos() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.today_galapagos() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tours
-- ---------------------------------------------------------------------------
create table public.tours (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 80),
  title text not null check (char_length(title) between 3 and 100),
  destination text not null check (char_length(destination) between 2 and 80),
  description text not null check (char_length(description) between 15 and 600),
  duration text check (duration is null or char_length(duration) <= 60),
  difficulty text not null default 'A consultar'
    check (difficulty in ('Fácil', 'Moderado', 'Difícil', 'A consultar')),
  highlights text[] not null default '{}'
    check (cardinality(highlights) <= 4 and private.short_items(highlights, 30)),
  image text not null check (char_length(image) between 1 and 300),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.tours.image is 'Foto del tour: "/images/..." (foto del sitio) o ruta dentro del bucket galeria.';
comment on column public.tours.duration is 'Uso interno; el sitio público no muestra la duración.';

create trigger tours_updated_at before update on public.tours
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Próximas salidas
-- ---------------------------------------------------------------------------
create table public.departures (
  id uuid primary key default gen_random_uuid(),
  tour_id text not null references public.tours (id) on update cascade on delete cascade,
  departs_on date not null,
  departs_at time not null,
  spots smallint not null check (spots between 1 and 99),
  note text not null default '' check (char_length(note) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_id, departs_on, departs_at)
);
create index departures_departs_on_idx on public.departures (departs_on);

create trigger departures_updated_at before update on public.departures
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Envíos de fotos de visitantes ("Sube tu experiencia")
-- ---------------------------------------------------------------------------
create table public.photo_submissions (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) between 1 and 60),
  tour_id text references public.tours (id) on update cascade on delete set null,
  comment text check (comment is null or char_length(comment) <= 300),
  consent_at timestamptz not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'revisado')),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);
comment on column public.photo_submissions.ip_hash is 'SHA-256 de la IP con sal; solo para limitar envíos por hora, nunca la IP en claro.';
create index photo_submissions_status_idx on public.photo_submissions (status, created_at desc);
create index photo_submissions_ip_idx on public.photo_submissions (ip_hash, created_at desc);
create index photo_submissions_tour_idx on public.photo_submissions (tour_id);
create index photo_submissions_reviewed_by_idx on public.photo_submissions (reviewed_by);

create table public.submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.photo_submissions (id) on delete cascade,
  storage_path text not null unique check (char_length(storage_path) between 1 and 200),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  width integer not null,
  height integer not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now(),
  check (least(width, height) >= 400)
);
comment on column public.submission_photos.storage_path is 'Ruta dentro del bucket privado envios.';
create index submission_photos_submission_idx on public.submission_photos (submission_id);

create or replace function private.enforce_max_photos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.photo_submissions where id = new.submission_id for update;
  if (select count(*) from public.submission_photos where submission_id = new.submission_id) >= 5 then
    raise exception 'Un envío admite como máximo 5 fotos.' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger submission_photos_max_5 before insert on public.submission_photos
  for each row execute function private.enforce_max_photos();

-- ---------------------------------------------------------------------------
-- Galería pública
-- ---------------------------------------------------------------------------
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image text not null unique check (char_length(image) between 1 and 300),
  title text not null check (char_length(title) between 2 and 80),
  detail text not null default '' check (char_length(detail) <= 120),
  category text not null check (category in ('Paisajes', 'Vida marina', 'A bordo', 'Pesca')),
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  source text not null default 'equipo' check (source in ('equipo', 'visitante')),
  credit text check (credit is null or char_length(credit) between 1 and 60),
  submission_photo_id uuid unique references public.submission_photos (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.gallery_photos.image is 'Foto: "/images/..." (foto del sitio) o ruta dentro del bucket galeria.';
comment on column public.gallery_photos.featured is 'true = también aparece en el carrusel.';
create index gallery_photos_order_idx on public.gallery_photos (published, sort_order);

create trigger gallery_photos_updated_at before update on public.gallery_photos
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Permisos (Row Level Security)
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.tours enable row level security;
alter table public.departures enable row level security;
alter table public.photo_submissions enable row level security;
alter table public.submission_photos enable row level security;
alter table public.gallery_photos enable row level security;

-- Los visitantes solo leen; nunca escriben directamente en las tablas.
revoke insert, update, delete, truncate on public.admins, public.tours, public.departures,
  public.photo_submissions, public.submission_photos, public.gallery_photos from anon;
revoke all on public.admins, public.photo_submissions, public.submission_photos from anon;

-- Administradores
create policy "Admins ven la lista de administradores" on public.admins
  for select to authenticated using ((select private.is_admin()));

-- Tours
create policy "Tours visibles para todos" on public.tours
  for select to anon, authenticated using (active or (select private.is_admin()));
create policy "Admins crean tours" on public.tours
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins editan tours" on public.tours
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins borran tours" on public.tours
  for delete to authenticated using ((select private.is_admin()));

-- Salidas: el público ve solo las futuras de tours visibles
create policy "Salidas futuras para todos" on public.departures
  for select to anon, authenticated using (
    (departs_on >= (select private.today_galapagos())
      and exists (select 1 from public.tours t where t.id = tour_id and t.active))
    or (select private.is_admin())
  );
create policy "Admins crean salidas" on public.departures
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins editan salidas" on public.departures
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins borran salidas" on public.departures
  for delete to authenticated using ((select private.is_admin()));

-- Galería
create policy "Fotos publicadas para todos" on public.gallery_photos
  for select to anon, authenticated using (published or (select private.is_admin()));
create policy "Admins agregan fotos a la galería" on public.gallery_photos
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins editan la galería" on public.gallery_photos
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins quitan fotos de la galería" on public.gallery_photos
  for delete to authenticated using ((select private.is_admin()));

-- Envíos de visitantes: solo administradores. Los envíos se crean desde la
-- Edge Function con la clave de servicio, que no pasa por estas reglas.
create policy "Admins ven envíos" on public.photo_submissions
  for select to authenticated using ((select private.is_admin()));
create policy "Admins revisan envíos" on public.photo_submissions
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins borran envíos" on public.photo_submissions
  for delete to authenticated using ((select private.is_admin()));

create policy "Admins ven fotos enviadas" on public.submission_photos
  for select to authenticated using ((select private.is_admin()));
create policy "Admins revisan fotos enviadas" on public.submission_photos
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins borran fotos enviadas" on public.submission_photos
  for delete to authenticated using ((select private.is_admin()));
