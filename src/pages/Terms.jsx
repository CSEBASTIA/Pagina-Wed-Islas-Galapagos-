import React from 'react';
import { LicenseLink, PageHero } from '../components/Layout.jsx';
import { Link, usePageTitle } from '../router.jsx';
import { EMAIL, LICENSE_HOLDER } from '../site.js';

const UPDATED = '7 de noviembre de 2026';

const sections = [
  {
    id: 'aceptacion',
    title: 'Aceptación',
    body: [
      'Al acceder y navegar por este sitio web aceptas estos términos y condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.',
      'Estos términos regulan únicamente el uso del sitio web y de la información publicada en él. Las condiciones de los tours (precios, reservas, pagos, cancelaciones y seguridad durante las salidas) no forman parte de este documento y se acuerdan directamente con Golden Ray I.',
    ],
  },
  {
    id: 'licencia',
    title: 'Licencia y propiedad intelectual',
    body: [
      <>Este sitio web, incluidos su diseño, código, estructura, textos y organización de los contenidos, se publica bajo la licencia de <LicenseLink />.</>,
      'Las fotografías, el nombre comercial Golden Ray I y sus datos de contacto pertenecen a sus respectivos titulares y se muestran con su autorización.',
      `No está permitido copiar, reproducir, distribuir, modificar ni utilizar con fines comerciales el sitio o cualquiera de sus contenidos sin autorización previa y por escrito de ${LICENSE_HOLDER} o del titular correspondiente. Puedes compartir enlaces a las páginas del sitio.`,
    ],
  },
  {
    id: 'informacion',
    title: 'Carácter informativo',
    body: [
      'El sitio tiene una finalidad informativa: presenta los tours, las próximas salidas, una galería de fotografías y los canales de contacto de Golden Ray I. Publicar una fecha o un cupo no constituye una reserva ni una oferta vinculante.',
      'Procuramos que la información esté actualizada, pero las fechas, horarios, cupos y descripciones pueden cambiar sin previo aviso por condiciones del clima o del mar, disposiciones del Parque Nacional Galápagos u otras causas. La disponibilidad se confirma siempre por contacto directo.',
      'Las fotografías ilustran los lugares y experiencias, y pueden no reflejar exactamente lo que se observará en cada salida, ya que la vida silvestre y el clima son variables.',
    ],
  },
  {
    id: 'uso',
    title: 'Uso permitido',
    body: [
      'Te comprometes a usar el sitio de forma lícita y respetuosa. No está permitido intentar acceder al área de administración o a cuentas ajenas, eludir o manipular las medidas de seguridad (también desde las herramientas del navegador), interferir con el funcionamiento del sitio, extraer contenido de forma automatizada, enviar fotos de forma masiva o utilizar el sitio con fines fraudulentos.',
      'Tampoco está permitido enviar archivos que no sean fotografías, programas maliciosos ni contenido ilegal, ofensivo, sexual, violento o que vulnere derechos de terceros. Podemos bloquear envíos y retirar contenido que incumpla estas condiciones, y conservar la información necesaria para denunciarlo ante las autoridades.',
    ],
  },
  {
    id: 'fotos',
    title: 'Fotos enviadas por los visitantes',
    body: [
      'Desde la página «Sube tu experiencia» puedes enviarnos hasta cinco fotografías por envío, con un límite de envíos por hora para evitar abusos. Al enviarlas confirmas que eres su autor o que tienes permiso para compartirlas, y que las personas que aparecen en ellas están de acuerdo. Si aparecen menores de edad, debes contar con la autorización de sus padres o representantes.',
      'Al enviar tus fotos autorizas, de forma gratuita y no exclusiva, su publicación en este sitio web. Conservas la autoría de tus fotografías. Todas las fotos se revisan antes de publicarse y podemos no publicar las que no correspondan a una salida, tengan baja calidad, muestren conductas que dañen la fauna o el medio ambiente, o resulten inapropiadas.',
      'Antes de enviarse, las fotos se reducen de tamaño y pierden los metadatos que guardan los teléfonos, como la ubicación GPS. Se almacenan en los servidores de Supabase, nuestro proveedor de base de datos. Las fotos rechazadas se borran al momento y las que no se revisan se borran automáticamente a los 30 días.',
      `Si quieres que retiremos una foto que enviaste, escríbenos a ${EMAIL} y la quitaremos del sitio.`,
    ],
  },
  {
    id: 'privacidad',
    title: 'Privacidad y datos personales',
    body: [
      'Este sitio no tiene registro de visitantes ni utiliza cookies de seguimiento o publicidad. La información que compartas al escribirnos por WhatsApp, correo o redes sociales se utiliza únicamente para responder tu consulta.',
      'En «Sube tu experiencia» solo pedimos tus fotos y, de forma opcional, tu nombre, el tour y un comentario, para revisar las fotos y publicarlas con el crédito correspondiente. Para evitar abusos, de tu dirección IP solo guardamos una huella cifrada que no permite identificarte. Los envíos rechazados se borran al momento, los que no se revisan se borran a los 30 días y las fotos publicadas permanecen hasta que pidas retirarlas.',
      'Para funcionar, el sitio usa estos proveedores: Vercel, que aloja la web; Supabase, que guarda la información del sitio y las fotos enviadas; y Google Fonts, que sirve las tipografías. Como cualquier servicio en internet, pueden registrar datos técnicos de la conexión, como la dirección IP, para entregar la página y protegerla.',
      `De acuerdo con la Ley Orgánica de Protección de Datos Personales del Ecuador, puedes pedir el acceso, la rectificación o la eliminación de tus datos, o oponerte a su uso, escribiendo a ${EMAIL}.`,
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    body: [
      'La conexión con el sitio está cifrada (HTTPS). El área de administración está protegida con contraseña y verificación en dos pasos, y los permisos para ver o cambiar información se comprueban en el servidor, no en tu navegador.',
      `Ningún sistema es infalible. Si encuentras una vulnerabilidad, escríbenos a ${EMAIL} para que podamos corregirla; no intentes aprovecharla ni acceder a información que no es tuya.`,
    ],
  },
  {
    id: 'terceros',
    title: 'Enlaces y servicios de terceros',
    body: [
      'El sitio incluye enlaces a WhatsApp, Instagram, Facebook, Google Maps y correo electrónico para facilitar el contacto. Al usarlos sales de este sitio y se aplican los términos y las políticas de privacidad de cada servicio, sobre los que no tenemos control.',
    ],
  },
  {
    id: 'responsabilidad',
    title: 'Responsabilidad',
    body: [
      'El sitio se ofrece tal como está. No garantizamos que esté libre de errores o interrupciones, y no somos responsables de los daños derivados del uso de la información publicada sin haberla confirmado previamente con Golden Ray I.',
    ],
  },
  {
    id: 'ley',
    title: 'Ley aplicable',
    body: [
      'Estos términos se rigen por las leyes de la República del Ecuador.',
    ],
  },
  {
    id: 'cambios',
    title: 'Cambios en estos términos',
    body: [
      'Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página, con su fecha de actualización.',
    ],
  },
];

export default function TermsPage() {
  usePageTitle('Términos y condiciones');
  return <>
    <PageHero eyebrow="INFORMACIÓN LEGAL" title="Términos y condiciones"
      lead={<>Condiciones de uso de este sitio web y de su información. Sitio publicado bajo la licencia de <LicenseLink />.</>} />

    <section className="terms-section section">
      <div className="container terms__grid">
        <nav className="terms__toc" aria-label="Contenido">
          <p className="eyebrow">CONTENIDO</p>
          <ol>{sections.map((section) => <li key={section.id}><Link to={`/terminos#termino-${section.id}`}>{section.title}</Link></li>)}<li><Link to="/terminos#termino-contacto">Contacto</Link></li></ol>
        </nav>
        <article className="terms__body">
          <p className="terms__updated">Última actualización: {UPDATED}</p>
          {sections.map((section, index) => <section id={`termino-${section.id}`} key={section.id}>
            <h2><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</h2>
            {section.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
          </section>)}
          <section id="termino-contacto">
            <h2><span>{String(sections.length + 1).padStart(2, '0')}</span>Contacto</h2>
            <p>Si tienes preguntas sobre estos términos o sobre la información del sitio, escríbenos a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> o visita la página de <Link to="/contacto">contacto</Link>.</p>
          </section>
        </article>
      </div>
    </section>
  </>;
}
