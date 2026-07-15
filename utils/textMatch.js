// Shared fuzzy-matching primitive: lowercase, strip punctuation, collapse
// whitespace, then treat two strings as a match if they're equal or either
// one contains the other. Used for matching free-text venue/team names
// against canonical league data and third-party API responses, where exact
// string equality is too strict (sponsorship names, abbreviations, etc.)
// but full fuzzy/edit-distance matching would be overkill.
export function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

export function fuzzyMatches(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}
