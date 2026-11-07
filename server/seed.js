export const imageChoices = [
  '/images/Cuatro hermanos.jpeg',
  '/images/punta cormorant.jpeg',
  '/images/isla tortuga.jpeg',
  '/images/GALERIA6.jpg',
  '/images/la de los pajaros.jpeg',
  '/images/GALERIA7.jpg',
  '/images/GALERIA1.jpg',
  '/images/tortuga2.jpeg',
  '/images/Golden RAY.jpeg',
  '/images/lancha.jpeg',
  '/images/foto galeria.jpeg',
];

export const initialStore = {
  tours: [
    { id: 'cuatro-hermanos', title: 'Cuatro Hermanos', destination: 'Islotes volcánicos', description: 'Una salida de snorkel entre islotes volcánicos, con la posibilidad de observar mantarrayas, tortugas y otras especies marinas.', duration: '5 horas', difficulty: 'Moderado', highlights: ['Snorkel', 'Fauna marina'], image: imageChoices[0], active: true },
    { id: 'punta-cormorant', title: 'Punta Cormorant', destination: 'Floreana', description: 'Camina entre paisajes costeros y descubre playas singulares, flamencos y vida marina en una experiencia de naturaleza.', duration: '4 horas', difficulty: 'Fácil', highlights: ['Playa', 'Caminata', 'Snorkel'], image: imageChoices[1], active: true },
    { id: 'isla-tortuga', title: 'Isla Tortuga', destination: 'Islote y aves', description: 'Acércate a un cráter volcánico erosionado y observa aves en un recorrido ideal para quienes disfrutan la fotografía.', duration: '3 horas', difficulty: 'Fácil', highlights: ['Aves', 'Fotografía'], image: imageChoices[2], active: true },
    { id: 'los-tuneles', title: 'Los Túneles', destination: 'Isabela', description: 'Explora formaciones de lava y aguas transparentes en una de las experiencias de snorkel más conocidas de Isabela.', duration: '6 horas', difficulty: 'Moderado', highlights: ['Snorkel', 'Fauna marina'], image: imageChoices[3], active: true },
    { id: 'tintoreras', title: 'Tintoreras', destination: 'Isabela', description: 'Recorre senderos de lava y observa la fauna costera de Isabela en una salida corta y cercana a Puerto Villamil.', duration: '2,5 horas', difficulty: 'Fácil', highlights: ['Caminata', 'Fauna'], image: imageChoices[4], active: true },
    { id: 'sierra-negra', title: 'Sierra Negra', destination: 'Isabela', description: 'Conoce el paisaje volcánico de Sierra Negra en una caminata con vistas amplias de la caldera y la isla.', duration: '8 horas', difficulty: 'Difícil', highlights: ['Senderismo', 'Volcán'], image: imageChoices[5], active: true },
  ],
  departures: [],
};
