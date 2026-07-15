import { parseDateStr } from './dates';

export function hasDate(e) { return !!(e.date && e.date !== '—'); }

// Chronological order, undated events pushed to the end.
export function sortByDateAsc(events) {
  const dated   = events.filter(hasDate).sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date));
  const undated = events.filter((e) => !hasDate(e));
  return [...dated, ...undated];
}
