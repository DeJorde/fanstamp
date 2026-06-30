import { GOOGLE_API_KEY } from '../constants';

export function eventToForm(event) {
  return {
    name:     event.name,
    venue:    event.venue,
    city:     event.location === '—' ? '' : event.location,
    date:     event.date     === '—' ? '' : event.date,
    category: event.category,
    notes:    event.notes ?? '',
    photos:   event.photos ?? [],
  };
}

export async function geocodeVenue(venueName, locationStr) {
  try {
    const query = locationStr && locationStr !== '—'
      ? `${venueName}, ${locationStr}`
      : venueName;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'StadiumLog/1.0' } }
    );
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (_) {}
  return null;
}

export function computeRegion(markers) {
  if (markers.length === 0) return { latitude: 37.5, longitude: -100, latitudeDelta: 30, longitudeDelta: 40 };
  if (markers.length === 1) return { latitude: markers[0].coordinates.lat, longitude: markers[0].coordinates.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  const lats = markers.map((m) => m.coordinates.lat);
  const lngs = markers.map((m) => m.coordinates.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude:      (minLat + maxLat) / 2,
    longitude:     (minLng + maxLng) / 2,
    latitudeDelta:  (maxLat - minLat) * 1.5 + 0.5,
    longitudeDelta: (maxLng - minLng) * 1.5 + 0.5,
  };
}

export const PLACE_TYPE_LABELS = {
  stadium:       '🏟 Stadium',
  arena:         '🏟 Arena',
  golf_course:   '⛳ Golf Course',
  ice_rink:      '🏒 Ice Rink',
  sports_centre: '🏆 Sports Centre',
  raceway:       '🏎 Raceway',
  ski_resort:    '⛷ Ski Resort',
  city:          '🏙 City',
  town:          '🏙 Town',
  village:       '🏘 Village',
};

export async function fetchNominatimPlaces(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=6&addressdetails=1`;
  const res  = await fetch(url, { headers: { 'User-Agent': 'StadiumLog/1.0' } });
  const data = await res.json();
  return data.map((item) => {
    const addr       = item.address || {};
    const primaryName =
      addr.amenity || addr.leisure || addr.tourism ||
      item.name    || item.display_name.split(',')[0].trim();
    const city    = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
    const state   = addr.state || '';
    const country = addr.country || '';
    const subtitle  = [city, state || country].filter(Boolean).join(', ');
    const typeLabel = PLACE_TYPE_LABELS[item.type] || PLACE_TYPE_LABELS[item.class] || '📍 Place';
    return {
      id:        item.place_id,
      name:      primaryName,
      subtitle,
      typeLabel,
      venueName: primaryName,
      cityName:  [city, state].filter(Boolean).join(', '),
    };
  });
}

// Venue search via Google Places Autocomplete — returns actual establishments, not cities
export async function fetchVenueSuggestions(query) {
  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(query)}&types=establishment&key=${GOOGLE_API_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];
  return (data.predictions ?? []).slice(0, 6).map((p) => {
    const name      = p.structured_formatting?.main_text ?? p.description.split(',')[0].trim();
    const terms     = p.terms ?? [];
    // Drop venue-name (first) and country (last), take last two remaining → "City, State"
    const addrTerms = terms.slice(1, -1);
    const cityName  = addrTerms.slice(-2).map((t) => t.value).join(', ');
    return {
      id:       p.place_id,
      name,
      subtitle: p.structured_formatting?.secondary_text ?? '',
      cityName,
    };
  });
}

// City search via Google Places Autocomplete — only returns city/town/locality results
export async function fetchCitySuggestions(query) {
  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(query)}&types=(cities)&key=${GOOGLE_API_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];
  return (data.predictions ?? []).slice(0, 5).map((p) => {
    const name   = p.structured_formatting?.main_text ?? p.description.split(',')[0].trim();
    // description = "Chicago, IL, USA" → cityName = "Chicago, IL"
    const parts    = p.description.split(',').map((s) => s.trim()).filter(Boolean);
    const cityName = parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : (parts[0] ?? name);
    return {
      id:       p.place_id,
      name,
      subtitle: p.structured_formatting?.secondary_text ?? '',
      cityName,
    };
  });
}
