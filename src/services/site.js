import { imageUrl, supabase } from '../lib/supabase.js';
import { buildSite, todayInGalapagos, toGalleryPhoto } from './mappers.js';

const TOUR_FIELDS = 'id,title,destination,description,duration,difficulty,highlights,image,active,sort_order';
const DEPARTURE_FIELDS = 'id,tour_id,stops,departs_on,departs_at,spots,note';

export async function fetchSite() {
  const [tours, departures] = await Promise.all([
    supabase.from('tours').select(TOUR_FIELDS).eq('active', true).order('sort_order').order('title'),
    supabase.from('departures').select(DEPARTURE_FIELDS).gte('departs_on', todayInGalapagos())
      .order('departs_on').order('departs_at'),
  ]);
  if (tours.error || departures.error) {
    throw new Error('No se pudieron cargar los tours. Inténtalo de nuevo en unos minutos.');
  }
  return buildSite(tours.data, departures.data, imageUrl);
}

export async function fetchGallery() {
  const { data, error } = await supabase.from('gallery_photos')
    .select('id,image,title,detail,category,featured')
    .eq('published', true).order('sort_order').order('created_at');
  if (error) throw new Error('No se pudo cargar la galería.');
  return data.map((row) => toGalleryPhoto(row, imageUrl));
}
