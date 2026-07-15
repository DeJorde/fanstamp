import { fuzzyMatches } from './textMatch';

// MLB Stats API numeric team ids, keyed by the same canonical team names used
// in LEAGUE_STADIUMS.MLB (leagueStadiums.js) — from GET /api/v1/teams?sportId=1.
// Note MLB's own API just calls the Athletics "Athletics" (no city, mid-move
// from Oakland to Sacramento) — kept as "Oakland Athletics" here to match our
// canonical name; resolveMlbTeamId's fuzzy fallback covers the mismatch.
export const MLB_TEAM_IDS = {
  'Arizona Diamondbacks': 109,
  'Atlanta Braves': 144,
  'Baltimore Orioles': 110,
  'Boston Red Sox': 111,
  'Chicago Cubs': 112,
  'Chicago White Sox': 145,
  'Cincinnati Reds': 113,
  'Cleveland Guardians': 114,
  'Colorado Rockies': 115,
  'Detroit Tigers': 116,
  'Houston Astros': 117,
  'Kansas City Royals': 118,
  'Los Angeles Angels': 108,
  'Los Angeles Dodgers': 119,
  'Miami Marlins': 146,
  'Milwaukee Brewers': 158,
  'Minnesota Twins': 142,
  'New York Mets': 121,
  'New York Yankees': 147,
  'Oakland Athletics': 133,
  'Philadelphia Phillies': 143,
  'Pittsburgh Pirates': 134,
  'San Diego Padres': 135,
  'San Francisco Giants': 137,
  'Seattle Mariners': 136,
  'St. Louis Cardinals': 138,
  'Tampa Bay Rays': 139,
  'Texas Rangers': 140,
  'Toronto Blue Jays': 141,
  'Washington Nationals': 120,
};

// Exact match first (the common case — team names come from LEAGUE_STADIUMS
// autocomplete), fuzzy fallback for freeform text or naming drift (e.g. the
// Athletics' city-less rebrand mid-relocation).
export function resolveMlbTeamId(teamName) {
  if (!teamName) return null;
  if (MLB_TEAM_IDS[teamName] != null) return MLB_TEAM_IDS[teamName];
  const match = Object.keys(MLB_TEAM_IDS).find((name) => fuzzyMatches(teamName, name));
  return match ? MLB_TEAM_IDS[match] : null;
}
