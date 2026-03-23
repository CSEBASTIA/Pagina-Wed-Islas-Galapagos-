const ReservationService = {
  async create(data){
    const res = await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const json = await res.json();
    if(!res.ok) throw new Error(json.error||'Error al crear reserva');
    return json;
  }
};
window.ReservationService = ReservationService;
