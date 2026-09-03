import { computeStatesVisited } from './statesVisited';
import { computeBadges } from './badges';
import { hasDate, sortByDateAsc } from './eventDates';
import { parseDateStr } from './dates';

// Fields safe to publish on a public profile doc — no photos/notes/
// ticketPhoto, matching what the Activity Feed and Friend Profile screen
// are allowed to show about someone else's events.
function toPublicEvent(e) {
  return { id: e.id, name: e.name, venue: e.venue, location: e.location, category: e.category, date: e.date };
}

// Everything written to users/{uid}/profile/public besides identity fields
// (displayName/email) — recomputed from scratch on every sync rather than
// incrementally maintained, since the full events list is already in memory
// wherever this is called.
export function computeProfileSummary(events) {
  const totalEvents = events.length;
  const uniqueVenues = new Set(events.map((e) => e.venue)).size;
  const statesVisited = computeStatesVisited(events).size;

  const years = new Set();
  events.forEach((e) => {
    if (!hasDate(e)) return;
    const y = parseDateStr(e.date).getFullYear();
    if (!isNaN(y)) years.add(y);
  });

  const { leagueCompletionist } = computeBadges(events);
  const leaguePassport = {};
  leagueCompletionist.forEach((l) => {
    leaguePassport[l.league] = { visited: l.visited, total: l.total };
  });

  const recentEvents = sortByDateAsc(events.filter(hasDate)).slice(-5).reverse().map(toPublicEvent);

  return {
    totalEvents, uniqueVenues, statesVisited,
    yearsActive: years.size,
    leaguePassport,
    recentEvents,
  };
}
