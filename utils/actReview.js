import { CATEGORY_ICONS } from '../constants';
import { parseDateStr } from './dates';
import { hasDate } from './eventDates';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Shared computation for Concert Review and Comedy Review — both categories
// need the same shape (total, distinct acts, venues, cities, most active
// month, optional genre breakdown), just with different nouns for what an
// "act" is (see components/ActReviewCard's ACT_CONFIG).
export function computeActReview(events, category) {
  const catEvents = events.filter((e) => e.category === category);
  const total = catEvents.length;

  // FanStamp has no dedicated artist/comedian field on an event — the event
  // name (e.g. "Taylor Swift: Eras Tour") is the closest proxy for who the
  // user actually saw, so distinct names stand in for distinct acts.
  const uniqueActs = new Set(catEvents.map((e) => e.name.trim()).filter(Boolean)).size;
  const uniqueVenues = new Set(catEvents.map((e) => e.venue)).size;
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

  return {
    category,
    icon: CATEGORY_ICONS[category] ?? '📌',
    total, uniqueActs, uniqueVenues, uniqueCities,
    mostActiveMonth, topGenre,
  };
}
