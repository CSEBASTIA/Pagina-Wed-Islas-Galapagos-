import React from 'react';
import { PageHero } from '../components/Layout.jsx';
import { usePageTitle } from '../router.jsx';
import { formatDate, whatsappUrl } from '../site.js';

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function monthKey(offset = 0) {
  const [year, month] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Galapagos', year: 'numeric', month: '2-digit' })
    .format(new Date()).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}

function monthName(key) {
  const name = new Intl.DateTimeFormat('es-EC', { month: 'long', timeZone: 'UTC' }).format(new Date(`${key}-01T12:00:00Z`));
  return `${capitalize(name)} ${key.slice(0, 4)}`;
}

function groupByMonth(departures) {
  const months = new Map();
  for (const departure of departures) {
    const key = departure.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(departure);
  }
  return [...months].map(([key, items]) => ({ key, items }));
}

function summary(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.tourTitle, (counts.get(item.tourTitle) || 0) + 1);
  return [...counts].map(([title, count], index) =>
    (index === 0 ? `${count} ${count === 1 ? 'salida' : 'salidas'} a ${title}` : `${count} a ${title}`)).join(' · ');
}

function weekdayShort(date) {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`)).replace('.', '');
}

function MonthCard({ month }) {
  const label = month.key === monthKey() ? 'ESTE MES' : month.key === monthKey(1) ? 'PRÓXIMO MES' : 'MÁS ADELANTE';
  return <article className="month-card">
    <header className="month-card__head">
      <div><p className="eyebrow">{label}</p><h2>{monthName(month.key)}</h2></div>
      <span className="month-card__count">{month.items.length} {month.items.length === 1 ? 'salida' : 'salidas'}</span>
    </header>
    <p className="month-card__summary">{summary(month.items)}</p>
    <ol className="trip-list">
      {month.items.map((trip) => <li className="trip" key={trip.id}>
        <span className="trip__date" aria-hidden="true">
          <strong>{Number(trip.date.slice(8, 10))}</strong>
          <small>{weekdayShort(trip.date)}</small>
        </span>
        <span className="trip__info">
          <strong>{trip.tourTitle}</strong>
          <span className="visually-hidden">{formatDate(trip.date, { weekday: 'long' })}</span>
          <span>{trip.time} · {trip.spots} cupos</span>
          {trip.note && <em>{trip.note}</em>}
        </span>
        <a className="trip__cta" href={whatsappUrl(`Hola, quisiera consultar la salida de ${trip.tourTitle} del ${formatDate(trip.date)} a las ${trip.time}.`)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar la salida de ${trip.tourTitle} del ${formatDate(trip.date)}`}>Consultar <span aria-hidden="true">→</span></a>
      </li>)}
    </ol>
  </article>;
}

export default function DeparturesPage({ site }) {
  usePageTitle('Próximas salidas');
  const { tours, loading, error } = site;
  const seen = new Set();
  const departures = tours.flatMap((tour) =>
    (tour.departures || []).map((departure) => ({ ...departure, tourTitle: departure.stops.length ? departure.stops.join(' · ') : tour.title })))
    .filter((departure) => !seen.has(departure.id) && seen.add(departure.id))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const months = groupByMonth(departures);

  return <>
    <PageHero eyebrow="PLANIFICA TU VIAJE" title="Próximas salidas" image="/images/GALERIA1.jpg"
      lead="Estas son las salidas programadas mes a mes. La confirmación final y los detalles se coordinan directamente por WhatsApp." />

    <section className="departures-section section" aria-label="Salidas programadas">
      <div className="container">
        {loading && <p className="status">Cargando fechas…</p>}
        {error && <p className="status status--error" role="alert">{error}</p>}
        {!loading && !error && (months.length
          ? <div className="month-grid">{months.map((month) => <MonthCard month={month} key={month.key} />)}</div>
          : <div className="departure-list__empty">
            <strong>Fechas por confirmar</strong>
            <p>Escríbenos y te contamos las próximas opciones para tu viaje.</p>
            <a className="button button--dark" href={whatsappUrl('Hola, quiero consultar las próximas salidas de Golden Ray I.')} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp <span aria-hidden="true">→</span></a>
          </div>)}
      </div>
    </section>

  </>;
}
