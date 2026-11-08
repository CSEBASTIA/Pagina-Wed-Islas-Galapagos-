-- Borra las tablas de la web anterior (esquema legacy): 6 tours viejos y 3 fechas
-- antiguas, sin reservas ni reseñas. Nada del sitio actual depende de ellas.
drop schema if exists legacy cascade;
