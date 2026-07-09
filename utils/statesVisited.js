import { extractState } from './badges';
import { resolveStateName } from './usStates';

// Maps each of the 50 states to the events logged there, keyed by the
// canonical state name resolved from the "City, State" location field —
// handles both full names ("New York") and USPS abbreviations ("NY").
// Non-US locations and unrecognized state names are silently excluded
// rather than guessed at.
export function computeStatesVisited(events) {
  const byState = new Map();
  events.forEach((e) => {
    const state = resolveStateName(extractState(e.location));
    if (!state) return;
    if (!byState.has(state)) byState.set(state, []);
    byState.get(state).push(e);
  });
  return byState;
}
