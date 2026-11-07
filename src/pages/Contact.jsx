import React from 'react';
import { PageHero } from '../components/Layout.jsx';
import { usePageTitle } from '../router.jsx';
import { EMAIL, FACEBOOK, INSTAGRAM, INSTAGRAM_HANDLE, MAPS, WHATSAPP_DISPLAY, whatsappUrl } from '../site.js';

const faqs = [
  ['¿Cómo consulto el precio de un tour?', 'Escríbenos por WhatsApp indicando el tour que te interesa y cuándo viajas. Te compartiremos el valor y los detalles de esa salida.'],
  ['¿Qué pasa si no veo una fecha disponible?', 'Las fechas publicadas muestran próximas salidas confirmadas en la web. Puedes preguntarnos por otras opciones para tu viaje.'],
  ['¿Cómo confirmo mi reserva?', 'La disponibilidad, el punto de encuentro y las condiciones se confirman directamente con nuestro equipo antes de reservar.'],
  ['¿Dónde está Golden Ray I?', 'Nos encontramos en Puerto Villamil, Isla Isabela, Galápagos. Escríbenos para coordinar los detalles de tu recorrido.'],
];

export default function ContactPage() {
  usePageTitle('Contacto');
  return <>
    <PageHero eyebrow="ESTAMOS PARA AYUDARTE" title="Contacto" image="/images/Golden RAY.jpeg"
      lead="Cuéntanos cuándo viajas y qué te gustaría conocer. Resolvemos tus dudas directamente, sin formularios ni reservas automáticas." />

    <section className="contact-section section" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div>
          <p className="eyebrow">ESCRÍBENOS</p>
          <h2 id="contact-title">Tu aventura empieza con una conversación.</h2>
          <p>Respondemos por WhatsApp, correo o Instagram. Indícanos el tour que te interesa, la fecha de tu viaje y cuántas personas son.</p>
          <div className="contact-place">
            <small>DÓNDE ESTAMOS</small>
            <strong>Puerto Villamil · Isla Isabela · Galápagos</strong>
            <a className="underlined-link" href={MAPS} target="_blank" rel="noopener noreferrer">Ver en Google Maps <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="contact-links">
          <a href={whatsappUrl('Hola, quisiera planificar un tour con Golden Ray I.')} target="_blank" rel="noopener noreferrer"><span><small>WHATSAPP</small><strong>{WHATSAPP_DISPLAY}</strong></span><span aria-hidden="true">↗</span></a>
          <a href={`mailto:${EMAIL}?subject=Consulta%20de%20tours%20Golden%20Ray%20I`}><span><small>CORREO</small><strong>{EMAIL}</strong></span><span aria-hidden="true">↗</span></a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><span><small>INSTAGRAM</small><strong>{INSTAGRAM_HANDLE}</strong></span><span aria-hidden="true">↗</span></a>
          <a href={FACEBOOK} target="_blank" rel="noopener noreferrer"><span><small>FACEBOOK</small><strong>Golden Ray I</strong></span><span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <section className="faq-section section" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div><p className="eyebrow">ANTES DE VIAJAR</p><h2 id="faq-title">Preguntas frecuentes</h2><p>Si tienes otra pregunta, estamos a un mensaje de distancia.</p></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </div>
      </div>
    </section>
  </>;
}
