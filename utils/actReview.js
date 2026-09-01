import { CATEGORY_ICONS } from '../constants';
import { parseDateStr, formatDisplayDate } from './dates';
import { hasDate, sortByDateAsc } from './eventDates';
import { getNewVenues } from './yearInReview';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Shared computation for Concert Review and Comedy Review — both categories
// need the same shape (total, distinct acts w/ per-appearance detail, venues,
// cities, most active month, optional genre breakdown), just with different
// nouns for what an "act" is (see components/ActReviewCard's ACT_REVIEW_CONFIG).
// `events` is whatever period this review covers (already scoped by the
// caller to the active FilterBar window); `allEvents` is the user's untouched
// full history, needed only for the "new venues" section, and defaults to
// `events` for callers that don't distinguish the two.
export function computeActReview(events, category, allEvents = events) {
  const catEvents = events.filter((e) => e.category === category);
  const total = catEvents.length;

  // FanStamp has no dedicated artist/comedian field on an event — the event
  // name (e.g. "Taylor Swift: Eras Tour") is the closest proxy for who the
  // user actually saw, so distinct names stand in for distinct acts, and
  // every event sharing that name is one "appearance" (venue + date) by them.
  const actMap = new Map();
  catEvents.forEach((e) => {
    const name = e.name.trim();
    if (!name) return;
    if (!actMap.has(name)) actMap.set(name, []);
    actMap.get(name).push(e);
  });
  const acts = Array.from(actMap.entries())
    .map(([name, actEvents]) => ({
      name,
      count: actEvents.length,
      appearances: sortByDateAsc(actEvents).map((e) => ({
        id: e.id, venue: e.venue, date: e.date, dateDisplay: formatDisplayDate(e.date),
      })),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const uniqueActs = acts.length;

  const venueMap = new Map();
  catEvents.forEach((e) => {
    if (!venueMap.has(e.venue)) {
      venueMap.set(e.venue, { name: e.venue, city: e.location && e.location !== '—' ? e.location : '', count: 0 });
    }
    venueMap.get(e.venue).count++;
  });
  const venues = Array.from(venueMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const uniqueVenues = venues.length;

  const uniqueCities = new Set(
    catEvents.filter((e) => e.location && e.location !== '—').map((e) => e.location)
  ).size;

  const monthCounts = new Array(12).fill(0);
  catEvents.filter(hasDate).forEach((e) => { monthCounts[parseDateStr(e.date).getMonth()]++; });
  const maxMonthIdx = monthCounts.reduce((best, c, i) => (c > monthCounts[best] ? i : best), 0);
  const mostActiveMonth = monthCounts[maxMonthIdx] > 0
    ? { name: MONTH_NAMES[maxMonthIdx], count: monthCounts[maxMonthIdx] }
    : null;

  // There's no genre-tagging UI yet, so this only ever populates if some
  // future data source (or a manual notes convention) starts stamping
  // `event.genre` — the "if tagged" case from the product spec.
  const genreCounts = {};
  catEvents.forEach((e) => { if (e.genre) genreCounts[e.genre] = (genreCounts[e.genre] || 0) + 1; });
  const topGenreEntry = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  const topGenre = topGenreEntry ? { name: topGenreEntry[0], count: topGenreEntry[1] } : null;

  const newVenues = getNewVenues(allEvents, catEvents);

  return {
    category,
    icon: CATEGORY_ICONS[category] ?? '📌',
    total, uniqueActs, uniqueVenues, uniqueCities,
    acts, venues, newVenues,
    mostActiveMonth, topGenre,
  };
}
