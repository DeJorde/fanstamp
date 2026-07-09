import { US_STATES_PATHS } from '../usStatesMap';
import { extractState } from './badges';

const STATE_NAMES = new Set(US_STATES_PATHS.map((s) => s.name));

// Maps each of the 50 states to the events logged there, keyed by the exact
// state name extracted from the "City, State" location field (the format
// produced by the venue/city autocomplete in utils/geo.js). Non-US locations
// and unrecognized state names are silently excluded rather than guessed at.
export function computeStatesVisited(events) {
  const byState = new Map();
  events.forEach((e) => {
    const state = extractState(e.location);
    if (!state || !STATE_NAMES.has(state)) return;
    if (!byState.has(state)) byState.set(state, []);
    byState.get(state).push(e);
  });
  return byState;
}
