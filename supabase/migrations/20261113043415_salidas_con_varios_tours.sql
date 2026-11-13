-- Una salida puede recorrer varios tours o sitios el mismo día («Cormorant. Túneles. Finado»).
-- stops guarda los nombres en orden; vacío significa que la salida es solo del tour de tour_id.
alter table public.departures add column stops text[] not null default '{}'
  check (cardinality(stops) <= 6 and char_length(array_to_string(stops, '')) <= 240);

comment on column public.departures.stops is
  'Tours o sitios que recorre la salida, en orden. Vacío: solo el tour de tour_id.';
