export function eventToForm(event) {
  return {
    name:     event.name,
    venue:    event.venue,
    city:     event.location === '—' ? '' : event.location,
    date:     event.date     === '—' ? '' : event.date,
    category: event.category,
    notes:    event.notes ?? '',
    photos:   event.photos ?? [],
    homeTeam: event.homeTeam ?? '',
    awayTeam: event.awayTeam ?? '',
    result:   event.result ?? null,
  };
}

// Nominatim's usage policy rejects requests with a "stock" User-Agent, but React
// Native's native networking layer (especially on iOS) silently drops/overrides a
// custom User-Agent header set via fetch(). A Referer header identifying the app
// is not stripped and satisfies the same policy requirement.
// https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_HEADERS = {
  Referer:      'https://fanstamp.app',
  'User-Agent': 'FanStamp/1.0',
};
const NOMINATIM_TIMEOUT_MS = 10000;

async function nominatimGet(url, signal) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: NOMINATIM_HEADERS, signal: controller.signal });
    if (!res.ok) throw new Error(`Nominatim request failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function geocodeVenue(venueName, locationStr) {
  try {
    const query = locationStr && locationStr !== '—'
      ? `${venueName}, ${locationStr}`
      : venueName;
    const data = await nominatimGet(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    );
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

export async function fetchNominatimPlaces(query, signal) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=6&addressdetails=1`;
  try {
    const data = await nominatimGet(url, signal);
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
  } catch (err) {
    if (err.name !== 'AbortError') console.warn('[fetchNominatimPlaces]', err.message);
    return [];
  }
}

// OSM classes that represent physical venues (stadiums, arenas, golf courses, etc.)
const VENUE_CLASSES = new Set(['amenity', 'leisure', 'tourism', 'man_made', 'building', 'historic']);
// Classes that are essentially never a "venue" someone would log an event at —
// used only to trim the last-resort fallback below.
const NEVER_VENUE_CLASSES = new Set(['place', 'boundary', 'highway', 'waterway', 'railway']);

// Venue search via Nominatim. NOTE: unlike city search, this filter is NOT the
// main source of empty results — Nominatim's own ranking is. For a short/partial
// query (e.g. "Wrigley" before the user finishes typing "Wrigley Field"),
// Nominatim's top results are dominated by same-named administrative places
// (towns, counties) worldwide, and the actual venue often isn't present in the
// response at all until the query is nearly complete. Broadening the class
// filter and raising the raw result limit both help surface it sooner, but
// can't manufacture a match Nominatim didn't return.
export async function fetchVenueSuggestions(query, signal) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=20&addressdetails=1`;
  try {
    const data = await nominatimGet(url, signal);
    const venues = data.filter((item) => VENUE_CLASSES.has(item.class));
    // Fallback: if OSM has no venue-class hits, show any non-administrative result
    const hits = venues.length > 0
      ? venues
      : data.filter((item) => !NEVER_VENUE_CLASSES.has(item.class));

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
    if (err.name !== 'AbortError') console.warn('[fetchVenueSuggestions]', err.message);
    return [];
  }
}

// OSM classes/types that represent populated places
const CITY_CLASSES = new Set(['place', 'boundary']);
const CITY_TYPES   = new Set(['city', 'town', 'village', 'hamlet', 'municipality', 'suburb', 'borough', 'administrative', 'county']);

// City search via Nominatim — filters to place/boundary class, deduplicates by city name
export async function fetchCitySuggestions(query, signal) {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&limit=8&addressdetails=1`;
  try {
    const data = await nominatimGet(url, signal);
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
    if (err.name !== 'AbortError') console.warn('[fetchCitySuggestions]', err.message);
    return [];
  }
}
