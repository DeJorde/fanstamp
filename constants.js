export const STORAGE_KEY = '@fanstamp_events';
export const BUCKET_LIST_STORAGE_KEY = '@fanstamp_bucket_list';
export const FAVORITE_TEAM_STORAGE_KEY = '@fanstamp_favorite_team';
export const ONBOARDED_STORAGE_KEY = '@fanstamp_onboarded';
export const LEGACY_STORAGE_KEY = '@stadiumlog_events';
export const LEGACY_BUCKET_LIST_STORAGE_KEY = '@stadiumlog_bucket_list';
export const LEGACY_FAVORITE_TEAM_STORAGE_KEY = '@stadiumlog_favorite_team';

// Categories with a team roster in LEAGUE_STADIUMS — these get the Home/Away
// Team + Game Result fields on the event form and feed the My Teams section.
export const TEAM_TRACKED_CATEGORIES = ['NFL', 'MLB', 'NBA', 'NHL', 'WNBA', 'MLS', 'CFB', 'CBB', 'CBASE'];

// Categories with a free public game-stats API available (MLB Stats API for
// MLB, ESPN's public site API for the rest) — gates automatic game-stats
// fetching after an event is saved. Narrower than TEAM_TRACKED_CATEGORIES:
// WNBA/MLS/CBASE have no wired-up stats source (yet).
export const GAME_STATS_CATEGORIES = ['MLB', 'NFL', 'NBA', 'NHL', 'CFB', 'CBB'];

export const RESULT_OPTIONS = [
  { value: 'home', label: 'Home Win',        icon: '🏠' },
  { value: 'away', label: 'Away Win',        icon: '🚌' },
  { value: 'tie',  label: 'Tie / No Result', icon: '🤝' },
];

export const CATEGORY_GROUPS = [
  {
    key: 'stadium',
    label: 'Stadium Sports',
    categories: ['NFL', 'MLB', 'NBA', 'NHL', 'WNBA', 'MLS', 'CFB', 'CBB', 'CBASE', 'Other Sport'],
  },
  {
    key: 'outdoor',
    label: 'Outdoor & Course',
    categories: ['Golf', 'Ski Resort', 'Racing', 'Other Outdoor'],
  },
  {
    key: 'entertainment',
    label: 'Entertainment',
    categories: ['Concert', 'Comedy', 'Theater', 'Wrestling/MMA', 'Other'],
  },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.categories);

export const CATEGORY_GROUP_MAP = {};
CATEGORY_GROUPS.forEach((g) => g.categories.forEach((c) => { CATEGORY_GROUP_MAP[c] = g.key; }));

export const CATEGORY_COLORS = {
  // Stadium Sports
  NFL:             { bg: '#0d2414', text: '#4cd86c' },
  MLB:             { bg: '#0a1628', text: '#5c9fff' },
  NBA:             { bg: '#3a1600', text: '#ff8534' },
  NHL:             { bg: '#08202e', text: '#5cc8ff' },
  WNBA:            { bg: '#35100a', text: '#ff6040' },
  MLS:             { bg: '#0a1535', text: '#4d7cff' },
  CFB:             { bg: '#250818', text: '#cc4466' },
  CBB:             { bg: '#282000', text: '#f5c518' },
  CBASE:           { bg: '#241505', text: '#d99a44' },
  'Other Sport':   { bg: '#1a1a2e', text: '#8ab4f8' },
  // Outdoor & Course
  Golf:            { bg: '#0a2814', text: '#52d68a' },
  'Ski Resort':    { bg: '#0a1e38', text: '#56b8ff' },
  Racing:          { bg: '#2a0808', text: '#ff3d3d' },
  'Other Outdoor': { bg: '#1c2a10', text: '#90cc55' },
  // Entertainment
  Concert:         { bg: '#1f0a42', text: '#c47aff' },
  Comedy:          { bg: '#3a2000', text: '#ffb030' },
  Theater:         { bg: '#002828', text: '#3dd6cc' },
  'Wrestling/MMA': { bg: '#280808', text: '#cc2828' },
  Other:           { bg: '#1a1a1a', text: '#888888' },
};

export const CATEGORY_ICONS = {
  NFL:             '🏈',
  MLB:             '⚾',
  NBA:             '🏀',
  NHL:             '🏒',
  WNBA:            '🏀',
  MLS:             '⚽',
  CFB:             '🏈',
  CBB:             '🎓',
  CBASE:           '🌽',
  'Other Sport':   '🏟',
  Golf:            '⛳',
  'Ski Resort':    '⛷',
  Racing:          '🏎',
  'Other Outdoor': '🌿',
  Concert:         '🎵',
  Comedy:          '🎤',
  Theater:         '🎭',
  'Wrestling/MMA': '🥊',
  Other:           '📌',
};

export const GROUP_COLORS = {
  stadium:       '#3a86ff',
  outdoor:       '#52d68a',
  entertainment: '#c47aff',
};

export const EMPTY_FORM = {
  name: '', venue: '', city: '', date: '', category: 'NFL', notes: '', photos: [],
  homeTeam: '', awayTeam: '', result: null, ticketPhoto: null,
};

export const GOOGLE_API_KEY = 'AIzaSyCQPsXimsCknE1AjLf_eW11Vb53xeSE2Cs';

export const FILTERS = [
  { key: 'all',     label: 'All Time' },
  { key: 'year',    label: 'This Year' },
  { key: 'month12', label: 'Last 12 Mo.' },
  { key: 'month',   label: 'This Month' },
];

export const MAP_STYLES = {
  standard: { label: '🗺', title: 'Standard', json: [] },

  retro: {
    label: '📜',
    title: 'Retro',
    json: [
      // ── Base: aged cream atlas paper (lighter than a brown parchment —
      // this is meant to read as paper, not leather) ──
      { elementType: 'geometry',                                                              stylers: [{ color: '#E8D5A3' }] },

      // ── Labels: dark sepia ink, cream stroke for legibility. Google's
      // customMapStyle JSON has no font-family styler — typeface is fixed
      // by the native SDK's renderer, so "serif" can't be applied here. ──
      { elementType: 'labels.text.fill',                                                      stylers: [{ color: '#3E2000' }] },
      { elementType: 'labels.text.stroke',                                                    stylers: [{ color: '#E8D5A3' }, { weight: 3 }] },
      // Hide all map icons (pins, transit logos, road shields, etc.)
      { elementType: 'labels.icon',                                                           stylers: [{ visibility: 'off' }] },

      // ── Administrative boundaries: only country & state read as an
      // atlas would — dark sepia ink, clearly visible ──
      { featureType: 'administrative.country',    elementType: 'geometry.stroke',             stylers: [{ color: '#5C3D1E' }, { weight: 1.5 }] },
      { featureType: 'administrative.country',    elementType: 'labels.text.fill',             stylers: [{ color: '#3E2000' }, { visibility: 'on' }] },
      { featureType: 'administrative.province',   elementType: 'geometry.stroke',             stylers: [{ color: '#5C3D1E' }, { weight: 1.5 }] },
      { featureType: 'administrative.province',   elementType: 'labels.text.fill',             stylers: [{ color: '#3E2000' }, { visibility: 'on' }] },
      // Everything finer than state (cities, neighborhoods, parcels) hidden
      { featureType: 'administrative.locality',    elementType: 'labels',                     stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative.neighborhood', elementType: 'labels',                    stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative.land_parcel',  elementType: 'labels',                    stylers: [{ visibility: 'off' }] },
      { featureType: 'locality',                   elementType: 'labels',                     stylers: [{ visibility: 'off' }] },

      // ── Landscape: cream base, built-up/urban areas a touch darker so
      // cities read as denser fill without needing labels ──
      { featureType: 'landscape',                 elementType: 'geometry',                    stylers: [{ color: '#E8D5A3' }] },
      { featureType: 'landscape.man_made',        elementType: 'geometry',                    stylers: [{ color: '#D4C49A' }] },
      { featureType: 'landscape.natural',         elementType: 'geometry',                    stylers: [{ color: '#E8D5A3' }] },

      // ── Points of interest: hide all icons & labels; parks are the only
      // POI that shows, as a muted gold-green rather than bright green ──
      { featureType: 'poi',                       elementType: 'geometry',                    stylers: [{ color: '#E8D5A3' }] },
      { featureType: 'poi',                       elementType: 'labels',                      stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.park',                  elementType: 'geometry.fill',               stylers: [{ color: '#C4B882' }, { visibility: 'on' }] },
      { featureType: 'poi.park',                  elementType: 'geometry.stroke',             stylers: [{ color: '#A8975C' }, { weight: 0.6 }] },

      // ── Roads: only major routes — no local roads, no road labels ──
      // First suppress everything
      { featureType: 'road',                      elementType: 'geometry',                    stylers: [{ visibility: 'off' }] },
      { featureType: 'road',                      elementType: 'labels',                      stylers: [{ visibility: 'off' }] },
      // Highways: medium brown, the primary map routes
      { featureType: 'road.highway',              elementType: 'geometry',                    stylers: [{ color: '#8B6343' }, { weight: 1.0 }, { visibility: 'on' }] },
      // Arterials: lighter tan, thinner — secondary routes
      { featureType: 'road.arterial',             elementType: 'geometry',                    stylers: [{ color: '#A89070' }, { weight: 0.5 }, { visibility: 'on' }] },
      // Local roads: completely hidden
      { featureType: 'road.local',                elementType: 'geometry',                    stylers: [{ visibility: 'off' }] },
      { featureType: 'road.local',                elementType: 'labels',                      stylers: [{ visibility: 'off' }] },

      // ── Transit: hide everything ──
      { featureType: 'transit',                                                               stylers: [{ visibility: 'off' }] },

      // ── Water: muted dusty teal — vintage atlases used blue-green, not
      // a modern saturated blue ──
      { featureType: 'water',                     elementType: 'geometry',                    stylers: [{ color: '#7BA7A7' }] },
      { featureType: 'water',                     elementType: 'labels.text.fill',            stylers: [{ color: '#3E2000' }] },
      { featureType: 'water',                     elementType: 'labels.text.stroke',          stylers: [{ color: '#E8D5A3' }, { weight: 2 }] },
    ],
  },

  dark: {
    label: '🌑',
    title: 'Dark',
    json: [
      { elementType: 'geometry',                                                    stylers: [{ color: '#0d0d0d' }] },
      { elementType: 'labels.text.fill',                                            stylers: [{ color: '#8a8a9a' }] },
      { elementType: 'labels.text.stroke',                                          stylers: [{ color: '#0d0d0d' }] },
      { featureType: 'administrative',       elementType: 'geometry',               stylers: [{ color: '#2a2a3a' }] },
      { featureType: 'administrative.country', elementType: 'labels.text.fill',     stylers: [{ color: '#9a9aaa' }] },
      { featureType: 'administrative.locality', elementType: 'labels.text.fill',    stylers: [{ color: '#c8c8d8' }] },
      { featureType: 'landscape',            elementType: 'geometry',               stylers: [{ color: '#111118' }] },
      { featureType: 'poi',                  elementType: 'geometry',               stylers: [{ color: '#1a1a24' }] },
      { featureType: 'poi',                  elementType: 'labels.text.fill',       stylers: [{ color: '#666680' }] },
      { featureType: 'poi.park',             elementType: 'geometry',               stylers: [{ color: '#0f1f14' }] },
      { featureType: 'poi.park',             elementType: 'labels.text.fill',       stylers: [{ color: '#2d5a3d' }] },
      { featureType: 'road',                 elementType: 'geometry',               stylers: [{ color: '#1e1e2e' }] },
      { featureType: 'road',                 elementType: 'geometry.stroke',        stylers: [{ color: '#0a0a14' }] },
      { featureType: 'road.arterial',        elementType: 'geometry',               stylers: [{ color: '#252535' }] },
      { featureType: 'road.arterial',        elementType: 'labels.text.fill',       stylers: [{ color: '#707085' }] },
      { featureType: 'road.highway',         elementType: 'geometry',               stylers: [{ color: '#1a2a4a' }] },
      { featureType: 'road.highway',         elementType: 'geometry.stroke',        stylers: [{ color: '#0d1a2e' }] },
      { featureType: 'road.highway',         elementType: 'labels.text.fill',       stylers: [{ color: '#3a86ff' }] },
      { featureType: 'road.local',           elementType: 'labels.text.fill',       stylers: [{ color: '#555568' }] },
      { featureType: 'transit',              elementType: 'geometry',               stylers: [{ color: '#1a1a2e' }] },
      { featureType: 'transit.station',      elementType: 'labels.text.fill',       stylers: [{ color: '#3a86ff' }] },
      { featureType: 'water',                elementType: 'geometry',               stylers: [{ color: '#060d1a' }] },
      { featureType: 'water',                elementType: 'labels.text.fill',       stylers: [{ color: '#1a3a5c' }] },
    ],
  },
};

export const MAP_STYLE_KEYS = ['standard', 'retro', 'dark'];

export const CS  = 72;   // compass bounding box
export const CR  = CS / 2; // 36 — center
export const ARM = 22;   // cardinal arm length (center → tip)
export const TIP =  5;   // triangle half-width at base
