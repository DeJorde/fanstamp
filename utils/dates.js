// Parses YYYY-MM-DD or legacy freeform strings into a Date in local time
export function parseDateStr(str) {
  if (!str || str === '—') return new Date();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Converts a Date object to YYYY-MM-DD for storage
export function toStorageDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Renders a stored date string as MM/DD/YYYY for display
export function formatDisplayDate(str) {
  if (!str || str === '—') return '—';
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  // Legacy freeform string: try to parse and reformat
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// Returns true if the event's date falls within the selected filter period
export function matchesFilter(event, filter) {
  if (filter === 'all') return true;
  const { date } = event;
  if (!date || date === '—') return false;
  const eventDate = parseDateStr(date);
  if (isNaN(eventDate.getTime())) return false;
  const now = new Date();
  if (filter === 'year')    return eventDate.getFullYear() === now.getFullYear();
  if (filter === 'month')   return eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth();
  if (filter === 'month12') {
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return eventDate >= cutoff;
  }
  return true;
}
