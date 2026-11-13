import React, { useMemo, useState } from 'react';
import { saveDepartures } from '../../services/admin.js';
import { parseTurnos, resolveStops } from '../../services/turnos.js';
import { formatDate } from '../../site.js';

const example = '4 de diciembre\nCormorant. Túneles. Finado\n9 de diciembre\nTúneles';

export default function ImportTurnos({ tours, departures, today, busy, act }) {
  const [text, setText] = useState('');
  const [time, setTime] = useState('08:00');
  const [spots, setSpots] = useState(10);
  const { turnos, unread } = useMemo(() => parseTurnos(text, today), [text, today]);

  const taken = new Set(departures.map((departure) => `${departure.tourId}|${departure.date}|${departure.time}`));
  const rows = turnos.map((turno, index) => {
    const resolved = resolveStops(turno.names, tours);
    const slot = `${resolved.tourId}|${turno.date}|${time}`;
    const repeated = Boolean(resolved.tourId) && taken.has(slot);
    if (resolved.tourId) taken.add(slot);
    return { ...resolved, date: turno.date, index, repeated };
  });
  const ready = rows.filter((row) => row.tourId && !row.repeated);
  const unknown = [...new Set(ready.flatMap((row) => row.unknown))];

  function status(row) {
    if (!row.tourId) return 'Ningún nombre coincide con un tour del sitio: no se guardará';
    if (row.repeated) return 'Ya existe esa salida: no se duplica';
    return `${row.stops.length > 1 ? `${row.stops.length} tours en una salida` : '1 tour'} · ${time} · ${spots} cupos`;
  }

  function submit(event) {
    event.preventDefault();
    const count = ready.length;
    act(async () => {
      await saveDepartures(ready.map((row) => ({ tourId: row.tourId, stops: row.stops, date: row.date, time, spots, note: '' })));
      setText('');
    }, count === 1 ? '1 salida agregada.' : `${count} salidas agregadas.`);
  }

  return <section className="manage-panel" aria-labelledby="turnos-title">
    <div className="manage-panel__heading">
      <h2 id="turnos-title">Pegar turnos</h2>
      <p>Pega la lista tal como la recibes: una línea con la fecha y debajo el tour o los tours de ese día separados por puntos. Cada fecha se guarda como una sola salida.</p>
    </div>
    <form onSubmit={submit} className="form-grid">
      <label className="form-grid__wide">Lista de turnos<textarea rows="8" placeholder={example} value={text} onChange={(event) => setText(event.target.value)} /></label>
      <label>Hora para todas<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
      <label>Cupos para todas<input required type="number" min="1" max="99" value={spots} onChange={(event) => setSpots(event.target.value)} /></label>

      {unread.length > 0 && <p className="form-message form-message--error form-grid__wide" role="alert">No se entendieron estas líneas: {unread.map((line) => `«${line}»`).join(', ')}. Escribe la fecha como «4 de diciembre».</p>}
      {unknown.length > 0 && <p className="form-message form-grid__wide" role="status">{unknown.map((name) => `«${name}»`).join(', ')} no {unknown.length === 1 ? 'es un tour' : 'son tours'} del sitio: se {unknown.length === 1 ? 'mostrará' : 'mostrarán'} con ese nombre dentro de la salida.</p>}

      {rows.length > 0 && <div className="manage-list turnos-list form-grid__wide">
        {rows.map((row) => <div className={`manage-row ${row.tourId && !row.repeated ? '' : 'manage-row--past'}`} key={row.index}>
          <div><strong>{formatDate(row.date)} · {row.title}</strong><span>{status(row)}</span></div>
        </div>)}
      </div>}

      <div className="form-actions"><button className="button button--dark" disabled={busy || ready.length === 0}>{ready.length ? `Guardar ${ready.length} ${ready.length === 1 ? 'salida' : 'salidas'}` : 'Guardar salidas'}</button></div>
    </form>
  </section>;
}
