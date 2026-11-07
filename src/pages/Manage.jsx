import React, { useEffect, useState } from 'react';
import { Brand } from '../components/Layout.jsx';
import {
  currentAdmin, deleteDeparture, deleteTour, loadAdminData, onSignedOut, saveDeparture, saveTour, signIn, signOut,
} from '../services/admin.js';
import { todayInGalapagos } from '../services/mappers.js';
import { formatDate } from '../site.js';

const blankTour = {
  title: '', destination: '', description: '', duration: '', difficulty: 'Fácil', highlightsText: '', image: '/images/Cuatro hermanos.jpeg', active: true,
};
const blankDeparture = { tourId: '', date: '', time: '08:00', spots: 10, note: '' };
const emptyData = { tours: [], departures: [], imageChoices: [] };

export default function ManageSite() {
  const [checking, setChecking] = useState(true);
  const [account, setAccount] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [data, setData] = useState(emptyData);
  const [tourForm, setTourForm] = useState(blankTour);
  const [departureForm, setDepartureForm] = useState(blankDeparture);
  const [editingTour, setEditingTour] = useState('');
  const [editingDeparture, setEditingDeparture] = useState('');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const today = todayInGalapagos();

  const refresh = async () => setData(await loadAdminData());
  const notify = (type, text) => setMessage({ type, text });

  useEffect(() => {
    currentAdmin()
      .then(async (found) => { setAccount(found); if (found?.isAdmin) await refresh(); })
      .catch((error) => notify('error', error.message))
      .finally(() => setChecking(false));
    return onSignedOut(() => { setAccount(null); setData(emptyData); });
  }, []);

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true); setMessage(null);
    try {
      const found = await signIn(login.email, login.password);
      setLogin({ email: login.email, password: '' });
      setAccount(found);
      if (found?.isAdmin) await refresh();
    } catch (error) { notify('error', error.message); } finally { setBusy(false); }
  }

  async function act(callback, success) {
    setBusy(true); setMessage(null);
    try { await callback(); await refresh(); notify('success', success); }
    catch (error) { notify('error', error.message); }
    finally { setBusy(false); }
  }

  function submitTour(event) {
    event.preventDefault();
    act(async () => {
      await saveTour(tourForm, editingTour, data.tours);
      setEditingTour(''); setTourForm(blankTour);
    }, editingTour ? 'Tour actualizado.' : 'Tour agregado.');
  }

  function submitDeparture(event) {
    event.preventDefault();
    act(async () => {
      await saveDeparture(departureForm, editingDeparture);
      setEditingDeparture(''); setDepartureForm(blankDeparture);
    }, editingDeparture ? 'Salida actualizada.' : 'Salida agregada.');
  }

  function removeTour(tour) {
    if (!window.confirm(`¿Eliminar el tour «${tour.title}» y todas sus salidas? Esta acción no se puede deshacer.`)) return;
    act(() => deleteTour(tour.id), 'Tour eliminado.');
  }

  function removeDeparture(departure) {
    if (!window.confirm(`¿Eliminar la salida del ${formatDate(departure.date)}? Esta acción no se puede deshacer.`)) return;
    act(() => deleteDeparture(departure.id), 'Salida eliminada.');
  }

  function editTour(tour) {
    setEditingTour(tour.id);
    setTourForm({
      title: tour.title, destination: tour.destination, description: tour.description, duration: tour.duration,
      difficulty: tour.difficulty, highlightsText: tour.highlights.join(', '), image: tour.imagePath, active: tour.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editDeparture(departure) {
    setEditingDeparture(departure.id);
    setDepartureForm({ tourId: departure.tourId, date: departure.date, time: departure.time, spots: departure.spots, note: departure.note });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function logout() {
    await signOut();
    setAccount(null); setData(emptyData); setMessage(null);
  }

  const imageChoices = data.imageChoices.some((choice) => choice.value === tourForm.image)
    ? data.imageChoices
    : [{ value: tourForm.image, label: decodeURIComponent(tourForm.image.split('/').pop()) }, ...data.imageChoices];
  const upcoming = data.departures.filter((departure) => departure.date >= today).length;
  const messageView = message && <p className={`form-message ${message.type === 'error' ? 'form-message--error' : ''}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>;

  if (checking) return <main className="manage-shell"><p>Comprobando acceso…</p></main>;

  return <main className="manage-shell">
    <div className="manage-header"><Brand /><a href="/">Ver sitio público ↗</a></div>

    {!account && <section className="login-card">
      <p className="eyebrow">ACCESO PRIVADO</p><h1>Gestión de tours</h1>
      <p>Entra con la cuenta de administrador creada en Supabase.</p>
      <form onSubmit={submitLogin}>
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" autoComplete="username" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} required />
        <button className="button button--dark" disabled={busy} type="submit">{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
      {messageView}
    </section>}

    {account && !account.isAdmin && <section className="login-card">
      <p className="eyebrow">SIN PERMISOS</p><h1>Cuenta sin acceso</h1>
      <p>La cuenta {account.email} no está registrada como administradora. Pide que la agreguen a la tabla de administradores.</p>
      <button className="button button--dark" type="button" onClick={logout}>Cerrar sesión</button>
      {messageView}
    </section>}

    {account?.isAdmin && <>
      <div className="manage-title">
        <div><p className="eyebrow">GOLDEN RAY I</p><h1>Gestionar contenido</h1><p>Los cambios se publican al guardar. Las salidas pasadas dejan de mostrarse automáticamente.</p></div>
        <div className="manage-account"><span>{account.name || account.email}</span><button className="plain-button" type="button" onClick={logout}>Cerrar sesión</button></div>
      </div>
      {messageView}
      <div className="manage-grid">
        <section className="manage-panel"><div className="manage-panel__heading"><h2>{editingTour ? 'Editar tour' : 'Agregar tour'}</h2><p>Elige una foto del sitio o de la galería.</p></div>
          <form onSubmit={submitTour} className="form-grid">
            <label>Título<input required minLength="3" maxLength="100" value={tourForm.title} onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })} /></label>
            <label>Destino<input required minLength="2" maxLength="80" value={tourForm.destination} onChange={(e) => setTourForm({ ...tourForm, destination: e.target.value })} /></label>
            <label>Duración (uso interno)<input maxLength="60" placeholder="Ej. 4 horas" value={tourForm.duration} onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })} /></label>
            <label>Dificultad<select value={tourForm.difficulty} onChange={(e) => setTourForm({ ...tourForm, difficulty: e.target.value })}><option>Fácil</option><option>Moderado</option><option>Difícil</option><option>A consultar</option></select></label>
            <label className="form-grid__wide">Actividades destacadas, separadas por comas (máx. 4)<input maxLength="140" placeholder="Ej. Snorkel, Fauna marina" value={tourForm.highlightsText} onChange={(e) => setTourForm({ ...tourForm, highlightsText: e.target.value })} /></label>
            <label className="form-grid__wide">Foto<select value={tourForm.image} onChange={(e) => setTourForm({ ...tourForm, image: e.target.value })}>{imageChoices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
            <label className="form-grid__wide">Descripción<textarea required minLength="15" maxLength="600" rows="4" value={tourForm.description} onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })} /></label>
            <label className="checkbox-label form-grid__wide"><input type="checkbox" checked={tourForm.active} onChange={(e) => setTourForm({ ...tourForm, active: e.target.checked })} /> Mostrar en el sitio público</label>
            <div className="form-actions"><button className="button button--dark" disabled={busy}>Guardar tour</button>{editingTour && <button type="button" className="plain-button" onClick={() => { setEditingTour(''); setTourForm(blankTour); }}>Cancelar</button>}</div>
          </form>
        </section>
        <section className="manage-panel"><div className="manage-panel__heading"><h2>{editingDeparture ? 'Editar salida' : 'Agregar salida'}</h2><p>Publica fechas concretas y cupos disponibles.</p></div>
          <form onSubmit={submitDeparture} className="form-grid">
            <label className="form-grid__wide">Tour<select required value={departureForm.tourId} onChange={(e) => setDepartureForm({ ...departureForm, tourId: e.target.value })}><option value="">Selecciona un tour</option>{data.tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}{tour.active ? '' : ' (oculto)'}</option>)}</select></label>
            <label>Fecha<input required type="date" min={today} value={departureForm.date} onChange={(e) => setDepartureForm({ ...departureForm, date: e.target.value })} /></label>
            <label>Hora<input required type="time" value={departureForm.time} onChange={(e) => setDepartureForm({ ...departureForm, time: e.target.value })} /></label>
            <label>Cupos<input required type="number" min="1" max="99" value={departureForm.spots} onChange={(e) => setDepartureForm({ ...departureForm, spots: e.target.value })} /></label>
            <label>Nota opcional<input maxLength="120" value={departureForm.note} onChange={(e) => setDepartureForm({ ...departureForm, note: e.target.value })} /></label>
            <div className="form-actions"><button className="button button--dark" disabled={busy}>Guardar salida</button>{editingDeparture && <button type="button" className="plain-button" onClick={() => { setEditingDeparture(''); setDepartureForm(blankDeparture); }}>Cancelar</button>}</div>
          </form>
        </section>
      </div>
      <div className="manage-grid manage-grid--lists">
        <section className="manage-panel"><h2>Tours ({data.tours.length})</h2>
          <div className="manage-list">{data.tours.map((tour) => <div className="manage-row" key={tour.id}>
            <div><strong>{tour.title}</strong><span>{tour.destination} · {tour.active ? 'Visible' : 'Oculto'}</span></div>
            <div><button type="button" onClick={() => editTour(tour)}>Editar</button><button type="button" className="danger" onClick={() => removeTour(tour)}>Eliminar</button></div>
          </div>)}</div>
        </section>
        <section className="manage-panel"><h2>Salidas ({upcoming} próximas)</h2>
          <div className="manage-list">{data.departures.map((departure) => <div className={`manage-row ${departure.date < today ? 'manage-row--past' : ''}`} key={departure.id}>
            <div><strong>{formatDate(departure.date)} · {departure.time}</strong><span>{data.tours.find((tour) => tour.id === departure.tourId)?.title || 'Tour eliminado'} · {departure.spots} cupos{departure.date < today ? ' · Pasada' : ''}</span></div>
            <div><button type="button" onClick={() => editDeparture(departure)}>Editar</button><button type="button" className="danger" onClick={() => removeDeparture(departure)}>Eliminar</button></div>
          </div>)}{data.departures.length === 0 && <p>Todavía no hay salidas publicadas.</p>}</div>
        </section>
      </div>
    </>}
  </main>;
}
