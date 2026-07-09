import { US_STATES_PATHS } from '../usStatesMap';

export const STATE_NAMES = new Set(US_STATES_PATHS.map((s) => s.name));

const STATE_ABBREVIATIONS = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

const NAME_BY_LOWERCASE = new Map(
  [...STATE_NAMES].map((name) => [name.toLowerCase(), name])
);

// Resolves a raw "State" segment (the last comma-separated part of a "City,
// State" location string) to its canonical full name in US_STATES_PATHS.
// Accepts either a full state name or a 2-letter USPS abbreviation, both
// case-insensitively — event locations come from free-typed text as well as
// autocomplete, so both forms show up in practice. Anything else (DC,
// countries, typos) resolves to null rather than being guessed at.
export function resolveStateName(raw) {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (cleaned.length === 2) return STATE_ABBREVIATIONS[cleaned.toUpperCase()] ?? null;
  return NAME_BY_LOWERCASE.get(cleaned.toLowerCase()) ?? null;
}
