import { CATEGORY_ICONS, CATEGORY_GROUPS, CATEGORY_GROUP_MAP, GROUP_COLORS } from '../constants';
import { parseDateStr } from './dates';
import { hasDate } from './eventDates';
import { computeStatesVisited } from './statesVisited';

// Same noun convention as utils/yearInReview.js's CategoryBreakdown rows —
// duplicated rather than imported since yearInReview.js keeps it private.
const UNIT_NOUN_BY_GROUP = { stadium: 'game', entertainment: 'show' };
function unitLabel(category, count) {
  const singular = UNIT_NOUN_BY_GROUP[CATEGORY_GROUP_MAP[category]] || 'event';
  return count === 1 ? singular : `${singular}s`;
}

// Master review across every category and every year — the "combine
// everything" review, as opposed to Year in Review (one calendar year) or
// the per-category reviews (one league/category, all time).
export function computeAllEventsReview(events) {
  const totalEvents = events.length;
  const uniqueVenues = new Set(events.map((e) => e.venue)).size;
  const uniqueCities = new Set(
    events.filter((e) => e.location && e.location !== '—').map((e) => e.location)
  ).size;
  const statesVisited = computeStatesVisited(events).size;

  const datedEvents = events.filter(hasDate);
  const yearCounts = {};
  datedEvents.forEach((e) => {
    const y = parseDateStr(e.date).getFullYear();
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });
  const timeline = Object.entries(yearCounts)
    .sort((a, b) => +a[0] - +b[0])
    .map(([year, count]) => ({ year: +year, count }));
  const maxYearCount = Math.max(...timeline.map((t) => t.count), 1);
  const yearsActive = timeline.length;

  const catCounts = {};
  events.forEach((e) => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topCategory = catEntries[0]
    ? { name: catEntries[0][0], count: catEntries[0][1], icon: CATEGORY_ICONS[catEntries[0][0]] ?? '📌' }
    : null;
  const categoryBreakdown = catEntries.slice(0, 6).map(([category, count]) => ({
    category, count, icon: CATEGORY_ICONS[category] ?? '📌',
    unitLabel: unitLabel(category, count),
  }));

  const groupCounts = {};
  events.forEach((e) => {
    const g = CATEGORY_GROUP_MAP[e.category];
    if (g) groupCounts[g] = (groupCounts[g] || 0) + 1;
  });
  const groupBreakdown = CATEGORY_GROUPS
    .map((g) => ({ key: g.key, label: g.label, count: groupCounts[g.key] || 0, color: GROUP_COLORS[g.key] }))
    .filter((g) => g.count > 0);

  return {
    totalEvents, uniqueVenues, uniqueCities, statesVisited, yearsActive,
    topCategory, categoryBreakdown, groupBreakdown,
    timeline, maxYearCount,
  };
}
