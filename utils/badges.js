import { CATEGORY_ICONS } from '../constants';
import { LEAGUE_STADIUMS } from '../leagueStadiums';
import { parseDateStr } from './dates';
import { resolveStateName } from './usStates';

function hasDate(e) { return !!(e.date && e.date !== '—'); }

// Chronological order is the only sensible "timeline" we have — events carry
// the date of the game/show itself, not a log-creation timestamp. Undated
// events can't be placed on that timeline, so they're pushed to the end.
function sortByDateAsc(events) {
  const dated   = events.filter(hasDate).sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date));
  const undated = events.filter((e) => !hasDate(e));
  return [...dated, ...undated];
}

// Walks the timeline accumulating unique values, recording which event's date
// first pushed the running total to each new size.
function trackUniqueMilestones(sortedEvents, getValue) {
  const seen = new Set();
  const unlockDateBySize = {};
  sortedEvents.forEach((e) => {
    const v = getValue(e);
    if (!v || seen.has(v)) return;
    seen.add(v);
    unlockDateBySize[seen.size] = hasDate(e) ? e.date : null;
  });
  return { total: seen.size, unlockDateBySize };
}

function badgeFromTrack(idPrefix, n, track, label, icon) {
  const unlocked = track.total >= n;
  return { id: `${idPrefix}-${n}`, icon, label, unlocked, unlockDate: unlocked ? track.unlockDateBySize[n] : null };
}

// "City, State" (or just "City" when no state was captured) is the format
// produced by the venue/city autocomplete — see utils/geo.js.
export function extractState(location) {
  if (!location || location === '—') return null;
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function venueMatches(userVenue, canonicalName) {
  const a = normalize(userVenue);
  const b = normalize(canonicalName);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

const EVENT_COUNT_THRESHOLDS = [1, 10, 25, 50, 100];
const VENUE_THRESHOLDS = [5, 10, 25, 50];
const CITY_THRESHOLDS  = [5, 10, 25];
const STATE_THRESHOLDS = [3, 10, 25];
export const CATEGORY_FIRST_LIST = ['NFL', 'MLB', 'NBA', 'NHL', 'Concert', 'Comedy', 'Golf', 'Ski Resort'];

export function computeBadges(events) {
  const sorted = sortByDateAsc(events);

  const eventCount = EVENT_COUNT_THRESHOLDS.map((n) => {
    const unlocked = events.length >= n;
    const triggering = sorted[n - 1];
    return {
      id: `count-${n}`,
      icon: n === 1 ? '🎟' : '🏅',
      label: n === 1 ? 'First Event' : `${n} Events`,
      unlocked,
      unlockDate: unlocked && triggering && hasDate(triggering) ? triggering.date : null,
    };
  });

  const venueTrack = trackUniqueMilestones(sorted, (e) => e.venue || null);
  const cityTrack   = trackUniqueMilestones(sorted, (e) => (e.location && e.location !== '—' ? e.location : null));
  const stateTrack  = trackUniqueMilestones(sorted, (e) => resolveStateName(extractState(e.location)));

  const venueExplorer = [
    ...VENUE_THRESHOLDS.map((n) => badgeFromTrack('venue', n, venueTrack, `${n} Venues`, '🏟')),
    ...CITY_THRESHOLDS.map((n)  => badgeFromTrack('city',  n, cityTrack,  `${n} Cities`,  '🏙')),
    ...STATE_THRESHOLDS.map((n) => badgeFromTrack('state', n, stateTrack, `${n} States`,  '🗺')),
  ];

  const categoryFirsts = CATEGORY_FIRST_LIST.map((cat) => {
    const first = sorted.find((e) => e.category === cat);
    return {
      id: `first-${cat}`,
      icon: CATEGORY_ICONS[cat] ?? '📌',
      label: `First ${cat} Event`,
      unlocked: !!first,
      unlockDate: first && hasDate(first) ? first.date : null,
    };
  });

  const leagueCompletionist = Object.entries(LEAGUE_STADIUMS).map(([league, teams]) => {
    const leagueEvents = sorted.filter((e) => e.category === league);
    const visitedTeams = new Set();
    let completingDate = null;
    for (const e of leagueEvents) {
      teams.forEach((t) => {
        if (!visitedTeams.has(t.team) && venueMatches(e.venue, t.stadium)) visitedTeams.add(t.team);
      });
      if (completingDate === null && visitedTeams.size >= teams.length) {
        completingDate = hasDate(e) ? e.date : null;
      }
    }
    const visited = visitedTeams.size;
    const total = teams.length;
    return {
      id: `league-${league}`,
      league,
      visited,
      total,
      pct: total > 0 ? visited / total : 0,
      complete: visited >= total,
      unlockDate: completingDate,
    };
  });

  return { eventCount, venueExplorer, categoryFirsts, leagueCompletionist };
}

// Per-team breakdown for the Leagues passport screen: which of the league's
// stadiums the user has attended, how many times, and on which dates —
// using the same fuzzy venue matching as the completionist badges above.
export function getLeagueDetail(events, league) {
  const teams = LEAGUE_STADIUMS[league] ?? [];
  const sorted = sortByDateAsc(events);
  const leagueEvents = sorted.filter((e) => e.category === league);

  return teams.map((t) => {
    const matches = leagueEvents.filter((e) => venueMatches(e.venue, t.stadium));
    const dates = matches.filter(hasDate).map((e) => e.date);
    const withPhoto = matches.find((e) => e.photos && e.photos.length > 0);
    return {
      team: t.team,
      stadium: t.stadium,
      city: t.city,
      visited: matches.length > 0,
      visitCount: matches.length,
      dates,
      photo: withPhoto ? withPhoto.photos[0] : null,
    };
  });
}
