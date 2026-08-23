import { CATEGORY_GROUPS, CATEGORY_ICONS } from '../constants';
import { parseDateStr } from './dates';
import { hasDate } from './eventDates';
import { computeBadges } from './badges';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// CATEGORY_GROUPS is already ordered stadium sports > outdoor > entertainment
// — flattening it gives a notability rank so, when nothing else
// distinguishes two events from the same year, a stadium sports game
// outranks a concert for "biggest event."
const CATEGORY_PRIORITY = CATEGORY_GROUPS.flatMap((g) => g.categories);

export function getAvailableYears(events) {
  const years = new Set();
  events.filter(hasDate).forEach((e) => {
    const y = parseDateStr(e.date).getFullYear();
    if (!isNaN(y)) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
}

// "Biggest" is a notability heuristic, not an objective measure: category
// priority first (a game outranks a concert), then whether a photo was
// attached (a proxy for "this one mattered enough to document"), then most
// recent as a final tiebreak.
function pickBiggestEvent(yearEvents) {
  const dated = yearEvents.filter(hasDate);
  if (dated.length === 0) return null;
  return [...dated].sort((a, b) => {
    const rankA = CATEGORY_PRIORITY.indexOf(a.category);
    const rankB = CATEGORY_PRIORITY.indexOf(b.category);
    if (rankA !== rankB) return rankA - rankB;
    const photoA = a.photos?.length > 0 ? 1 : 0;
    const photoB = b.photos?.length > 0 ? 1 : 0;
    if (photoA !== photoB) return photoB - photoA;
    return parseDateStr(b.date) - parseDateStr(a.date);
  })[0];
}

export function computeYearInReview(events, year) {
  const yearEvents = events.filter((e) => hasDate(e) && parseDateStr(e.date).getFullYear() === year);

  const totalEvents = yearEvents.length;
  const uniqueVenues = new Set(yearEvents.map((e) => e.venue)).size;
  const uniqueCities = new Set(
    yearEvents.filter((e) => e.location && e.location !== '—').map((e) => e.location)
  ).size;

  const catMap = {};
  yearEvents.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + 1; });
  const topCategoryEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry
    ? { name: topCategoryEntry[0], count: topCategoryEntry[1], icon: CATEGORY_ICONS[topCategoryEntry[0]] ?? '📌' }
    : null;

  const biggestEvent = pickBiggestEvent(yearEvents);

  const monthCounts = new Array(12).fill(0);
  yearEvents.forEach((e) => { monthCounts[parseDateStr(e.date).getMonth()]++; });
  const monthlyBreakdown = MONTH_NAMES.map((name, i) => ({ name, count: monthCounts[i] }));
  const maxMonthCount = Math.max(...monthCounts, 1);

  // Milestones are cumulative across the user's *whole* history (a "50
  // Events" or league-completionist badge reflects a running total), so
  // computeBadges needs every event, not just this year's — we then keep
  // only the badges whose unlockDate actually falls in this year.
  const badges = computeBadges(events);
  const allBadges = [
    ...badges.eventCount,
    ...badges.venueExplorer,
    ...badges.categoryFirsts,
    ...badges.leagueCompletionist
      .filter((b) => b.complete)
      .map((b) => ({ ...b, unlocked: true, label: `${b.league} Complete`, icon: '🏆' })),
  ];
  const milestonesUnlocked = allBadges.filter(
    (b) => b.unlocked && b.unlockDate && parseDateStr(b.unlockDate).getFullYear() === year
  );

  return {
    year, totalEvents, uniqueVenues, uniqueCities,
    topCategory, biggestEvent,
    monthlyBreakdown, maxMonthCount,
    milestonesUnlocked,
  };
}
