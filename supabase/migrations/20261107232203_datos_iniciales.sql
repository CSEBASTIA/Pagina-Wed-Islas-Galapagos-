-- Datos iniciales: los 6 tours y las fotos actuales de la galería.
-- Las salidas se publican desde el panel /gestion.

insert into public.tours (id, title, destination, description, duration, difficulty, highlights, image, active, sort_order) values
  ('cuatro-hermanos', 'Cuatro Hermanos', 'Islotes volcánicos', 'Una salida de snorkel entre islotes volcánicos, con la posibilidad de observar mantarrayas, tortugas y otras especies marinas.', '5 horas', 'Moderado', array['Snorkel', 'Fauna marina']::text[], '/images/Cuatro hermanos.jpeg', true, 10),
  ('punta-cormorant', 'Punta Cormorant', 'Floreana', 'Camina entre paisajes costeros y descubre playas singulares, flamencos y vida marina en una experiencia de naturaleza.', '4 horas', 'Fácil', array['Playa', 'Caminata', 'Snorkel']::text[], '/images/punta cormorant.jpeg', true, 20),
  ('isla-tortuga', 'Isla Tortuga', 'Islote y aves', 'Acércate a un cráter volcánico erosionado y observa aves en un recorrido ideal para quienes disfrutan la fotografía.', '3 horas', 'Fácil', array['Aves', 'Fotografía']::text[], '/images/isla tortuga.jpeg', true, 30),
  ('los-tuneles', 'Los Túneles', 'Isabela', 'Explora formaciones de lava y aguas transparentes en una de las experiencias de snorkel más conocidas de Isabela.', '6 horas', 'Moderado', array['Snorkel', 'Fauna marina']::text[], '/images/GALERIA6.jpg', true, 40),
  ('tintoreras', 'Tintoreras', 'Isabela', 'Recorre senderos de lava y observa la fauna costera de Isabela en una salida corta y cercana a Puerto Villamil.', '2,5 horas', 'Fácil', array['Caminata', 'Fauna']::text[], '/images/la de los pajaros.jpeg', true, 50),
  ('sierra-negra', 'Sierra Negra', 'Isabela', 'Conoce el paisaje volcánico de Sierra Negra en una caminata con vistas amplias de la caldera y la isla.', '8 horas', 'Difícil', array['Senderismo', 'Volcán']::text[], '/images/GALERIA7.jpg', true, 60)
on conflict (id) do nothing;

insert into public.gallery_photos (image, title, detail, category, featured, sort_order) values
  ('/images/GALERIA1.jpg', 'Momentos a bordo', 'La experiencia comienza en el mar', 'A bordo', true, 10),
  ('/images/GALERIA6.jpg', 'Snorkel en Galápagos', 'Explora el mundo bajo el agua', 'Vida marina', true, 20),
  ('/images/isla tortuga.jpeg', 'Isla Tortuga', 'Naturaleza que sorprende', 'Paisajes', true, 30),
  ('/images/Cuatro hermanos.jpeg', 'Cuatro Hermanos', 'Islotes en mar abierto', 'Paisajes', true, 40),
  ('/images/punta cormorant.jpeg', 'Punta Cormorant', 'Colores y formas de Galápagos', 'Paisajes', true, 50),
  ('/images/GALERIA7.jpg', 'Islas en el horizonte', 'Postales del archipiélago', 'Paisajes', true, 60),
  ('/images/Golden RAY.jpeg', 'Golden Ray I', 'Tu aventura empieza en Isabela', 'A bordo', true, 70),
  ('/images/tortuga2.jpeg', 'Snorkel con tortugas', 'Encuentros bajo el agua', 'Vida marina', false, 80),
  ('/images/galapagos4.jpeg', 'Tortuga marina', 'Aguas transparentes de Galápagos', 'Vida marina', false, 90),
  ('/images/cuatro hermano 2.jpeg', 'Acantilados de Cuatro Hermanos', 'Cuevas y paredes volcánicas', 'Paisajes', false, 100),
  ('/images/la de los pajaros.jpeg', 'Costa volcánica', 'Lava y cráteres frente al mar', 'Paisajes', false, 110),
  ('/images/foto galeria.jpeg', 'Golden Ray I en Isabela', 'Navegando con nuestro grupo', 'A bordo', false, 120),
  ('/images/lancha.jpeg', 'Nuestra lancha', 'Lista para zarpar desde Puerto Villamil', 'A bordo', false, 130),
  ('/images/GALERIA3.jpg', 'Almuerzo a bordo', 'Comida casera durante la salida', 'A bordo', false, 140),
  ('/images/GALERIA4.jpg', 'Pescado fresco', 'Sabores de Galápagos', 'A bordo', false, 150),
  ('/images/GALERIA2.jpg', 'Atún aleta amarilla', 'Pesca en mar abierto', 'Pesca', false, 160),
  ('/images/GALERIA5.jpg', 'Pesca en familia', 'Recuerdos para toda la vida', 'Pesca', false, 170)
on conflict (image) do nothing;
