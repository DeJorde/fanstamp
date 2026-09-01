import { CATEGORY_ICONS, CATEGORY_GROUP_MAP } from '../constants';
import { parseDateStr, formatDisplayDate } from './dates';
import { hasDate, sortByDateAsc } from './eventDates';
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

// A venue counts as "new" for a review period if the very first time the
// user ever visited it — across their whole history, any category — falls
// inside that period, even if they've been back since. `events` is the
// user's full history (used only to find each venue's true first-ever visit
// date); `periodEvents` is whatever population this specific review covers
// (a calendar year for Year in Review, a league+FilterBar window for a
// Sports Review, a category+FilterBar window for Concert/Comedy, etc.) and
// determines which venues are even in scope to check. Reused by every
// review card (see utils/sportsReview.js, utils/actReview.js,
// utils/allEventsReview.js) rather than duplicated per card type.
export function getNewVenues(events, periodEvents) {
  const firstVisitByVenue = new Map();
  sortByDateAsc(events.filter(hasDate)).forEach((e) => {
    if (!firstVisitByVenue.has(e.venue)) firstVisitByVenue.set(e.venue, e);
  });

  const periodIds = new Set(periodEvents.map((e) => e.id));
  const periodVenues = new Set(periodEvents.map((e) => e.venue));

  const venues = Array.from(periodVenues)
    .map((venue) => firstVisitByVenue.get(venue))
    .filter((e) => e && periodIds.has(e.id))
    .map((e) => ({
      name: e.venue,
      city: e.location && e.location !== '—' ? e.location : '',
      firstVisitDate: e.date,
      firstVisitDateDisplay: formatDisplayDate(e.date),
    }))
    .sort((a, b) => parseDateStr(a.firstVisitDate) - parseDateStr(b.firstVisitDate));

  return { count: venues.length, venues };
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

  const newVenues = getNewVenues(events, yearEvents);

  return {
    year, totalEvents, uniqueVenues, uniqueCities,
    topCategory, categoryBreakdown,
    monthlyBreakdown, maxMonthCount,
    milestonesUnlocked,
    newVenues,
  };
}
