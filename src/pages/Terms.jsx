import React from 'react';
import LegalPage from '../components/LegalPage.jsx';
import { LicenseLink } from '../components/Layout.jsx';
import { Link } from '../router.jsx';
import { EMAIL, LICENSE_HOLDER, WHATSAPP_DISPLAY } from '../site.js';

const UPDATED = '13 de noviembre de 2026';

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
    id: 'titular',
    title: 'Quién está detrás del sitio',
    body: [
      `Este es el sitio web de Golden Ray I, operador de tours con base en Puerto Villamil, isla Isabela, Galápagos, Ecuador. Puedes contactarnos en ${EMAIL} o por WhatsApp al ${WHATSAPP_DISPLAY}.`,
      <>El sitio fue desarrollado por <LicenseLink />, que es titular de la licencia del diseño y del código.</>,
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
      'Una misma salida puede recorrer varios sitios el mismo día. Los sitios y el orden publicados son orientativos y pueden ajustarse según los permisos del Parque Nacional y las condiciones del mar.',
      'Las fotografías ilustran los lugares y experiencias, y pueden no reflejar exactamente lo que se observará en cada salida, ya que la vida silvestre y el clima son variables.',
    ],
  },
  {
    id: 'reservas',
    title: 'Reservas y pagos',
    body: [
      'En este sitio no se hacen reservas ni se reciben pagos, y nunca te pediremos datos de tarjetas o cuentas bancarias a través de él. Los botones «Consultar» abren una conversación de WhatsApp con Golden Ray I.',
      'Una salida solo queda reservada cuando Golden Ray I te la confirma directamente. El precio, la forma de pago, lo que incluye el tour y las condiciones de cambio o cancelación son los que se acuerden en esa conversación.',
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
      `Si quieres que retiremos una foto que enviaste, escríbenos a ${EMAIL} y la quitaremos del sitio en un máximo de 15 días.`,
    ],
  },
  {
    id: 'privacidad',
    title: 'Privacidad y cookies',
    body: [
      'Este sitio no tiene registro de visitantes y no utiliza cookies de publicidad, de seguimiento ni de analítica. Solo tratamos datos personales cuando nos escribes o cuando envías fotos desde «Sube tu experiencia».',
      <>Qué datos recogemos, para qué los usamos, cuánto tiempo los guardamos y cómo puedes pedir que se borren está explicado en la <Link to="/privacidad">política de privacidad y cookies</Link>, que forma parte de estos términos.</>,
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
    id: 'disponibilidad',
    title: 'Disponibilidad del sitio',
    body: [
      'Procuramos que el sitio esté disponible de forma continua, pero puede interrumpirse por mantenimiento, por fallos de los proveedores o por la conexión a internet, que en Galápagos es limitada. Podemos modificar, suspender o retirar el sitio o cualquiera de sus secciones sin previo aviso.',
    ],
  },
  {
    id: 'responsabilidad',
    title: 'Responsabilidad',
    body: [
      'El sitio se ofrece tal como está. No garantizamos que esté libre de errores o interrupciones, y no somos responsables de los daños derivados del uso de la información publicada sin haberla confirmado previamente con Golden Ray I.',
      'Nada de lo anterior limita los derechos que la ley ecuatoriana reconoce a las personas consumidoras y que no pueden excluirse por acuerdo.',
    ],
  },
  {
    id: 'ley',
    title: 'Ley aplicable',
    body: [
      'Estos términos se rigen por las leyes de la República del Ecuador. Cualquier controversia que no pueda resolverse directamente con Golden Ray I se someterá a los jueces competentes del Ecuador.',
      'Si alguna parte de estos términos resultara inválida, el resto seguirá vigente.',
    ],
  },
  {
    id: 'cambios',
    title: 'Cambios en estos términos',
    body: [
      'Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página, con su fecha de actualización.',
    ],
  },
  {
    id: 'contacto',
    title: 'Contacto',
    body: [
      <>Si tienes preguntas sobre estos términos o sobre la información del sitio, escríbenos a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> o visita la página de <Link to="/contacto">contacto</Link>.</>,
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Términos y condiciones" path="/terminos" prefix="termino" updated={UPDATED} sections={sections}
    lead={<>Condiciones de uso de este sitio web y de su información. Sitio publicado bajo la licencia de <LicenseLink />.</>} />;
}
