import React, { useEffect, useState } from 'react';
import { Brand } from '../components/Layout.jsx';
import { formatDate, request } from '../site.js';

const defaultImages = [
  '/images/Cuatro hermanos.jpeg', '/images/punta cormorant.jpeg',
  '/images/isla tortuga.jpeg', '/images/GALERIA6.jpg',
  '/images/la de los pajaros.jpeg', '/images/GALERIA7.jpg',
];
const blankTour = { title: '', destination: '', description: '', duration: '', difficulty: 'Fácil', highlights: [], image: defaultImages[0], active: true };
const blankDeparture = { tourId: '', date: '', time: '08:00', spots: 10, note: '' };

export default function ManageSite() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [secret, setSecret] = useState('');
  const [data, setData] = useState({ tours: [], departures: [], imageChoices: defaultImages });
  const [tourForm, setTourForm] = useState(blankTour);
  const [departureForm, setDepartureForm] = useState(blankDeparture);
  const [editingTour, setEditingTour] = useState('');
  const [editingDeparture, setEditingDeparture] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const refresh = async () => setData(await request('/api/manage'));
  useEffect(() => {
    request('/api/auth/session').then(async (session) => {
      setAuthenticated(session.authenticated);
      if (session.authenticated) await refresh();
    }).catch((error) => setMessage(error.message)).finally(() => setChecking(false));
  }, []);
  async function submitLogin(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ secret }) });
      setSecret(''); setAuthenticated(true); await refresh();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function act(callback, success) {
    setBusy(true); setMessage('');
    try { await callback(); await refresh(); setMessage(success); }
    catch (error) { setMessage(error.message); if (/restringido|401/.test(error.message)) setAuthenticated(false); }
    finally { setBusy(false); }
  }
  async function submitTour(event) {
    event.preventDefault();
    await act(async () => {
      await request(editingTour ? `/api/manage/tours/${editingTour}` : '/api/manage/tours', {
        method: editingTour ? 'PUT' : 'POST', body: JSON.stringify(tourForm),
      });
      setEditingTour(''); setTourForm(blankTour);
    }, editingTour ? 'Tour actualizado.' : 'Tour agregado.');
  }
  async function submitDeparture(event) {
    event.preventDefault();
    await act(async () => {
      await request(editingDeparture ? `/api/manage/departures/${editingDeparture}` : '/api/manage/departures', {
        method: editingDeparture ? 'PUT' : 'POST', body: JSON.stringify(departureForm),
      });
      setEditingDeparture(''); setDepartureForm(blankDeparture);
    }, editingDeparture ? 'Salida actualizada.' : 'Salida agregada.');
  }
  async function deleteItem(kind, id, label) {
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    await act(() => request(`/api/manage/${kind}/${id}`, { method: 'DELETE' }), 'Elemento eliminado.');
  }
  async function logout() {
    await request('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false); setData({ tours: [], departures: [], imageChoices: defaultImages }); setMessage('');
  }
  if (checking) return <main className="manage-shell"><p>Comprobando acceso…</p></main>;
  return <main className="manage-shell">
    <div className="manage-header"><Brand /><a href="/">Ver sitio público ↗</a></div>
    {!authenticated ? <section className="login-card">
      <p className="eyebrow">ACCESO PRIVADO</p><h1>Gestión de tours</h1>
      <p>Introduce la clave única de administración para editar tours y fechas. No necesitas crear un usuario.</p>
      <form onSubmit={submitLogin}><label htmlFor="secret">Clave de administración</label><input id="secret" type="password" autoComplete="current-password" minLength="16" value={secret} onChange={(event) => setSecret(event.target.value)} required /><button className="button button--dark" disabled={busy} type="submit">Entrar</button></form>
      {message && <p className="form-message" role="alert">{message}</p>}
    </section> : <>
      <div className="manage-title"><div><p className="eyebrow">GOLDEN RAY I</p><h1>Gestionar contenido</h1><p>Los cambios se publican al guardar. Las salidas pasadas dejan de mostrarse automáticamente.</p></div><button className="plain-button" type="button" onClick={logout}>Cerrar sesión</button></div>
      {message && <p className="form-message" role="status">{message}</p>}
      <div className="manage-grid">
        <section className="manage-panel"><div className="manage-panel__heading"><h2>{editingTour ? 'Editar tour' : 'Agregar tour'}</h2><p>Elige una de las fotos disponibles en el sitio.</p></div>
          <form onSubmit={submitTour} className="form-grid">
            <label>Título<input required minLength="3" maxLength="100" value={tourForm.title} onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })} /></label>
            <label>Destino<input required minLength="2" maxLength="80" value={tourForm.destination} onChange={(e) => setTourForm({ ...tourForm, destination: e.target.value })} /></label>
            <label>Duración<input required minLength="2" maxLength="60" placeholder="Ej. 4 horas" value={tourForm.duration} onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })} /></label>
            <label>Dificultad<select value={tourForm.difficulty || 'A consultar'} onChange={(e) => setTourForm({ ...tourForm, difficulty: e.target.value })}><option>Fácil</option><option>Moderado</option><option>Difícil</option><option>A consultar</option></select></label>
            <label className="form-grid__wide">Actividades destacadas, separadas por comas<input maxLength="140" placeholder="Ej. Snorkel, Fauna marina" value={(tourForm.highlights || []).join(', ')} onChange={(e) => setTourForm({ ...tourForm, highlights: e.target.value.split(',').map((part) => part.trim()).slice(0, 4) })} /></label>
            <label>Foto<select value={tourForm.image} onChange={(e) => setTourForm({ ...tourForm, image: e.target.value })}>{data.imageChoices.map((image) => <option key={image} value={image}>{decodeURIComponent(image.split('/').pop())}</option>)}</select></label>
            <label className="form-grid__wide">Descripción<textarea required minLength="15" maxLength="600" rows="4" value={tourForm.description} onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })} /></label>
            <label className="checkbox-label form-grid__wide"><input type="checkbox" checked={tourForm.active} onChange={(e) => setTourForm({ ...tourForm, active: e.target.checked })} /> Mostrar en el sitio público</label>
            <div className="form-actions"><button className="button button--dark" disabled={busy}>Guardar tour</button>{editingTour && <button type="button" className="plain-button" onClick={() => { setEditingTour(''); setTourForm(blankTour); }}>Cancelar</button>}</div>
          </form>
        </section>
        <section className="manage-panel"><div className="manage-panel__heading"><h2>{editingDeparture ? 'Editar salida' : 'Agregar salida'}</h2><p>Publica fechas concretas y cupos disponibles.</p></div>
          <form onSubmit={submitDeparture} className="form-grid">
            <label className="form-grid__wide">Tour<select required value={departureForm.tourId} onChange={(e) => setDepartureForm({ ...departureForm, tourId: e.target.value })}><option value="">Selecciona un tour</option>{data.tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}</select></label>
            <label>Fecha<input required type="date" value={departureForm.date} onChange={(e) => setDepartureForm({ ...departureForm, date: e.target.value })} /></label>
            <label>Hora<input required type="time" value={departureForm.time} onChange={(e) => setDepartureForm({ ...departureForm, time: e.target.value })} /></label>
            <label>Cupos<input required type="number" min="1" max="99" value={departureForm.spots} onChange={(e) => setDepartureForm({ ...departureForm, spots: Number(e.target.value) })} /></label>
            <label>Nota opcional<input maxLength="120" value={departureForm.note} onChange={(e) => setDepartureForm({ ...departureForm, note: e.target.value })} /></label>
            <div className="form-actions"><button className="button button--dark" disabled={busy}>Guardar salida</button>{editingDeparture && <button type="button" className="plain-button" onClick={() => { setEditingDeparture(''); setDepartureForm(blankDeparture); }}>Cancelar</button>}</div>
          </form>
        </section>
      </div>
      <div className="manage-grid manage-grid--lists">
        <section className="manage-panel"><h2>Tours ({data.tours.length})</h2><div className="manage-list">{data.tours.map((tour) => <div className="manage-row" key={tour.id}><div><strong>{tour.title}</strong><span>{tour.destination} · {tour.active ? 'Visible' : 'Oculto'}</span></div><div><button type="button" onClick={() => { setEditingTour(tour.id); setTourForm(tour); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button><button type="button" className="danger" onClick={() => deleteItem('tours', tour.id, tour.title)}>Eliminar</button></div></div>)}</div></section>
        <section className="manage-panel"><h2>Salidas ({data.departures.length})</h2><div className="manage-list">{data.departures.toSorted((a, b) => a.date.localeCompare(b.date)).map((departure) => <div className="manage-row" key={departure.id}><div><strong>{formatDate(departure.date)} · {departure.time}</strong><span>{data.tours.find((tour) => tour.id === departure.tourId)?.title || 'Tour eliminado'} · {departure.spots} cupos</span></div><div><button type="button" onClick={() => { setEditingDeparture(departure.id); setDepartureForm(departure); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Editar</button><button type="button" className="danger" onClick={() => deleteItem('departures', departure.id, 'esta salida')}>Eliminar</button></div></div>)}{data.departures.length === 0 && <p>Todavía no hay salidas publicadas.</p>}</div></section>
      </div>
    </>}
  </main>;
}
