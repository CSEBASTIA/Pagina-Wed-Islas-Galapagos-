import React from 'react';

const facts = [
  ['La más grande', 'Con forma de caballito de mar, Isabela es más extensa que todas las demás islas del archipiélago juntas.'],
  ['Seis volcanes', 'Nació de la unión de seis volcanes: Wolf, Darwin, Alcedo, Sierra Negra, Cerro Azul y Ecuador. El Wolf es el punto más alto de Galápagos.'],
  ['Vida silvestre única', 'Aquí conviven pingüinos de Galápagos, iguanas marinas, tortugas gigantes, lobos marinos y flamencos.'],
  ['Puerto Villamil', 'Un pueblo tranquilo frente al mar, con playa de arena blanca y lagunas de flamencos. Es nuestro punto de partida.'],
];

const places = [
  ['Los Túneles', 'Arcos y túneles de lava rodeados de aguas tranquilas, ideales para hacer snorkel.'],
  ['Tintoreras', 'Islote frente a Puerto Villamil con canales donde descansan tiburones de punta blanca.'],
  ['Sierra Negra', 'Volcán activo con una de las calderas más grandes del mundo.'],
  ['Muro de las Lágrimas', 'Muro de piedra levantado por los presos de la antigua colonia penal de la isla.'],
];

export default function IsabelaSection() {
  return <section className="isabela-section section" aria-labelledby="isabela-title">
    <div className="container">
      <div className="isabela__intro">
        <div className="isabela__photo">
          <img src="/images/la de los pajaros.jpeg" alt="Costa volcánica de Isla Isabela" loading="lazy" />
        </div>
        <div>
          <p className="eyebrow">CONOCE NUESTRO HOGAR</p>
          <h2 id="isabela-title">Isla Isabela</h2>
          <p>Isabela es la isla más grande de Galápagos y una de las más jóvenes del archipiélago. Sus volcanes, playas y aguas llenas de vida la convierten en un lugar único para explorar por mar y por tierra.</p>
          <p>Más del 97 % de la superficie terrestre de Galápagos es Parque Nacional y sus aguas forman parte de la Reserva Marina de Galápagos. Cada visita es una oportunidad para cuidarla.</p>
        </div>
      </div>
      <div className="isabela-facts">
        {facts.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}
      </div>
      <h3 className="isabela-places__title">Lugares para conocer</h3>
      <ul className="isabela-places">
        {places.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}
      </ul>
    </div>
  </section>;
}
