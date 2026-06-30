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

// OSM classes that represent physical venues (stadiums, arenas, golf courses, etc.)
const VENUE_CLASSES = new Set(['amenity', 'leisure', 'tourism', 'man_made', 'building']);

// Venue search via Nominatim — filters to amenity/leisure/tourism/man_made/building classes
export async function fetchVenueSuggestions(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=10&addressdetails=1`;
  console.log('[fetchVenueSuggestions] URL:', url);
  try {
    const res  = await fetch(url, { headers: { 'User-Agent': 'StadiumLog/1.0' } });
    const data = await res.json();
    console.log('[fetchVenueSuggestions] results:', data.length, '| classes:', data.map((d) => `${d.class}/${d.type}`).join(', '));
    const venues = data.filter((item) => VENUE_CLASSES.has(item.class));
    // Fallback: if OSM has no venue-class hits, show any non-administrative result
    const hits = venues.length > 0
      ? venues
      : data.filter((item) => !['place', 'boundary', 'highway', 'waterway', 'railway', 'landuse'].includes(item.class));
    return hits.slice(0, 6).map((item) => {
      const addr = item.address || {};
      const name = addr.amenity || addr.leisure || addr.tourism || item.name || item.display_name.split(',')[0].trim();
      const city  = addr.city || addr.town || addr.village || addr.municipality || '';
      const state = addr.state || '';
      const country = addr.country || '';
      return {
        id:       item.place_id,
        name,
        subtitle: [city, state || country].filter(Boolean).join(', '),
        cityName: [city, state].filter(Boolean).join(', '),
      };
    });
  } catch (err) {
    console.log('[fetchVenueSuggestions] error:', err.message);
    return [];
  }
}

// OSM classes/types that represent populated places
const CITY_CLASSES = new Set(['place', 'boundary']);
const CITY_TYPES   = new Set(['city', 'town', 'village', 'hamlet', 'municipality', 'suburb', 'borough', 'administrative', 'county']);

// City search via Nominatim — filters to place/boundary class, deduplicates by city name
export async function fetchCitySuggestions(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=8&addressdetails=1`;
  console.log('[fetchCitySuggestions] URL:', url);
  try {
    const res  = await fetch(url, { headers: { 'User-Agent': 'StadiumLog/1.0' } });
    const data = await res.json();
    console.log('[fetchCitySuggestions] results:', data.length, '| types:', data.map((d) => `${d.class}/${d.type}`).join(', '));
    const seen = new Set();
    return data
      .filter((item) => CITY_CLASSES.has(item.class) || CITY_TYPES.has(item.type))
      .map((item) => {
        const addr    = item.address || {};
        const city    = addr.city || addr.town || addr.village || addr.municipality || '';
        const state   = addr.state || '';
        const country = addr.country || '';
        const display = city || item.name || item.display_name.split(',')[0].trim();
        return {
          id:       item.place_id,
          name:     display,
          subtitle: [state, country].filter(Boolean).join(', '),
          cityName: [display, state].filter(Boolean).join(', '),
        };
      })
      .filter((r) => {
        if (!r.name || seen.has(r.name)) return false;
        seen.add(r.name);
        return true;
      })
      .slice(0, 5);
  } catch (err) {
    console.log('[fetchCitySuggestions] error:', err.message);
    return [];
  }
}
