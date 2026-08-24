import { CATEGORY_ICONS, CATEGORY_GROUP_MAP } from '../constants';
import { parseDateStr } from './dates';
import { hasDate } from './eventDates';
import { computeBadges } from './badges';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Singular unit noun per category group, for "2 games" / "1 show" — there's
// no single natural noun spanning golf/ski/racing, so "outdoor" (and
// anything uncategorized) falls back to the generic "event".
const UNIT_NOUN_BY_GROUP = { stadium: 'game', entertainment: 'show' };

function unitLabel(category, count) {
  const singular = UNIT_NOUN_BY_GROUP[CATEGORY_GROUP_MAP[category]] || 'event';
  return count === 1 ? singular : `${singular}s`;
}

export function getAvailableYears(events) {
  const years = new Set();
  events.filter(hasDate).forEach((e) => {
    const y = parseDateStr(e.date).getFullYear();
    if (!isNaN(y)) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
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
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const topCategoryEntry = catEntries[0];
  const topCategory = topCategoryEntry
    ? { name: topCategoryEntry[0], count: topCategoryEntry[1], icon: CATEGORY_ICONS[topCategoryEntry[0]] ?? '📌' }
    : null;

  const categoryBreakdown = catEntries.map(([category, count]) => ({
    category,
    count,
    icon: CATEGORY_ICONS[category] ?? '📌',
    unitLabel: unitLabel(category, count),
  }));

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
    topCategory, categoryBreakdown,
    monthlyBreakdown, maxMonthCount,
    milestonesUnlocked,
  };
}
