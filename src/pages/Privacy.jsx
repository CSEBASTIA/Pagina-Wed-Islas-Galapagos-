import React from 'react';
import LegalPage from '../components/LegalPage.jsx';
import { Link } from '../router.jsx';
import { EMAIL, WHATSAPP_DISPLAY } from '../site.js';

const UPDATED = '13 de noviembre de 2026';
const mail = <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;

const sections = [
  {
    id: 'responsable',
    title: 'Quién es responsable de tus datos',
    body: [
      'El responsable del tratamiento de los datos personales que se recogen en este sitio es Golden Ray I, operador de tours con base en Puerto Villamil, isla Isabela, Galápagos, Ecuador.',
      <>Para cualquier asunto relacionado con tus datos puedes escribirnos a {mail} o por WhatsApp al {WHATSAPP_DISPLAY}.</>,
    ],
  },
  {
    id: 'datos',
    title: 'Qué datos recogemos y para qué',
    body: [
      'Puedes visitar todo el sitio sin registrarte y sin darnos ningún dato. Solo tratamos datos personales en estos casos:',
      'Cuando nos escribes por WhatsApp, correo, Instagram o Facebook: recibimos tu número o cuenta, tu nombre y lo que nos cuentes en la conversación. Lo usamos únicamente para responder tu consulta y coordinar tu salida.',
      'Cuando envías fotos desde «Sube tu experiencia»: recibimos las fotos y, solo si quieres indicarlos, tu nombre, el tour que hiciste y un comentario. Guardamos también la fecha en que aceptaste la autorización. Lo usamos para revisar las fotos y publicarlas en la galería con tu crédito.',
      'Para evitar envíos abusivos: de tu dirección IP guardamos solo una huella cifrada, que sirve para contar cuántos envíos llegan desde una misma conexión y no permite saber quién eres ni reconstruir la dirección.',
      'No pedimos documentos de identidad, datos de pago ni datos de salud a través del sitio, no elaboramos perfiles y no vendemos ni cedemos tus datos a terceros con fines comerciales o publicitarios.',
    ],
  },
  {
    id: 'base-legal',
    title: 'Con qué base legal los tratamos',
    body: [
      'Tu consentimiento, cuando marcas la autorización al enviar tus fotos. Puedes retirarlo en cualquier momento pidiendo que las quitemos.',
      'Tu propia solicitud, cuando nos escribes para pedir información o coordinar una salida.',
      'Nuestro interés legítimo en proteger el sitio frente a abusos, en el caso de la huella cifrada de la dirección IP.',
    ],
  },
  {
    id: 'conservacion',
    title: 'Cuánto tiempo guardamos los datos',
    body: [
      'Estos son los plazos de cada dato. En todos los casos puedes pedirnos que lo borremos antes:',
      {
        head: ['Dato', 'Cuánto tiempo se guarda'],
        rows: [
          ['Fotos enviadas que aún no hemos revisado, con su nombre y comentario', 'Hasta 30 días. Si no se revisan en ese plazo, se borran.'],
          ['Fotos rechazadas', 'El archivo se borra en el momento del rechazo. El registro del envío (nombre y comentario) se conserva mientras el sitio esté activo; si pides que lo borremos, lo hacemos en un máximo de 15 días.'],
          ['Fotos publicadas en la galería, con su crédito y la fecha de autorización', 'Mientras la foto esté publicada. Si pides retirarla, la quitamos y borramos sus datos en un máximo de 15 días.'],
          ['Huella cifrada de la dirección IP', 'Junto con el registro del envío, mientras el sitio esté activo. Si pides que la borremos, lo hacemos en un máximo de 15 días.'],
          ['Conversaciones por WhatsApp, correo o redes sociales', 'Mientras dure tu consulta o tu salida y hasta 12 meses después de la última conversación.'],
          ['Aviso de cookies visto', 'Se guarda solo en tu navegador, hasta que borres los datos del sitio.'],
          ['Registros técnicos de la conexión', 'Los guardan nuestros proveedores durante el plazo que fijan sus propias políticas.'],
        ],
      },
      'Podemos conservar un dato más tiempo únicamente si una ley nos obliga o si hace falta para denunciar un uso ilícito del sitio ante las autoridades.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies y almacenamiento en tu navegador',
    body: [
      'Este sitio no usa cookies de publicidad, de seguimiento ni de analítica, y no incluye píxeles de redes sociales. Por eso no te pedimos elegir entre categorías de cookies: no hay ninguna opcional que aceptar o rechazar.',
      'Lo único que el sitio guarda en tu navegador es una anotación de que ya viste el aviso de cookies, para no volver a mostrártelo. No contiene datos personales y puedes borrarla desde la configuración de tu navegador.',
      'El área de administración, a la que solo accede el equipo de Golden Ray I, guarda además la sesión de la persona administradora mientras está abierta.',
      'Si en el futuro incorporamos alguna herramienta que use cookies no necesarias, actualizaremos esta política y te pediremos permiso antes de activarla.',
    ],
  },
  {
    id: 'proveedores',
    title: 'Proveedores y envío de datos fuera del Ecuador',
    body: [
      'Para funcionar, el sitio usa estos proveedores, que actúan como encargados y tienen servidores fuera del Ecuador, principalmente en Estados Unidos:',
      'Vercel aloja el sitio web. Supabase guarda la información del sitio y las fotos enviadas. Google Fonts sirve las tipografías. Como cualquier servicio en internet, reciben datos técnicos de tu conexión, como la dirección IP, para entregarte la página y protegerla.',
      'Si nos escribes por WhatsApp, Instagram, Facebook o correo, la conversación pasa por los servicios de Meta o de Google, que aplican sus propias políticas de privacidad.',
    ],
  },
  {
    id: 'derechos',
    title: 'Tus derechos',
    body: [
      'La Ley Orgánica de Protección de Datos Personales del Ecuador te reconoce, entre otros, los derechos de acceso, rectificación y actualización, eliminación, oposición, suspensión del tratamiento y portabilidad, además del de retirar tu consentimiento en cualquier momento.',
      <>Para ejercerlos, escríbenos a {mail} indicando qué necesitas; si se trata de una foto, dinos cuál es. No tiene costo. Te responderemos en un plazo máximo de 15 días.</>,
      'Si consideras que no hemos atendido bien tu solicitud, puedes presentar un reclamo ante la Superintendencia de Protección de Datos Personales del Ecuador.',
    ],
  },
  {
    id: 'menores',
    title: 'Menores de edad',
    body: [
      'El formulario de envío de fotos está pensado para personas adultas. Si en una foto aparecen menores de edad, quien la envía debe contar con la autorización de sus padres o representantes.',
      <>Si eres madre, padre o representante y encuentras en el sitio una foto de un menor a tu cargo que no autorizaste, escríbenos a {mail} y la retiraremos.</>,
    ],
  },
  {
    id: 'seguridad',
    title: 'Cómo protegemos los datos',
    body: [
      'La conexión con el sitio está cifrada (HTTPS). Las fotos pendientes de revisión se guardan en un espacio privado al que solo accede el equipo de administración, con contraseña y verificación en dos pasos. Antes de enviarse, las fotos pierden los metadatos que guardan los teléfonos, como la ubicación GPS.',
      <>Ningún sistema es infalible. Si se produjera un incidente de seguridad que afectara a tus datos, lo comunicaríamos conforme a la ley. Si detectas un problema, avísanos a {mail}.</>,
    ],
  },
  {
    id: 'cambios',
    title: 'Cambios y contacto',
    body: [
      'Podemos actualizar esta política si cambia el sitio o la normativa. La versión vigente es la publicada en esta página, con su fecha de actualización.',
      <>Si tienes preguntas sobre esta política, escríbenos a {mail} o visita la página de <Link to="/contacto">contacto</Link>. Las condiciones de uso del sitio están en los <Link to="/terminos">términos y condiciones</Link>.</>,
    ],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacidad y cookies" path="/privacidad" prefix="privacidad" updated={UPDATED} sections={sections}
    lead="Qué datos personales recoge este sitio, para qué se usan, cuánto tiempo se guardan y cómo puedes pedir que se borren." />;
}
