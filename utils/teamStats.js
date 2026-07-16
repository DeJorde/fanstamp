import { TEAM_TRACKED_CATEGORIES } from '../constants';
import { sortByDateAsc } from './eventDates';

// Result is recorded from the home/away perspective, not the team's — this
// resolves it to how `team` specifically fared in that event.
function outcomeForTeam(event, team) {
  if (!event.result) return null;
  const isHome = event.homeTeam === team;
  const isAway = event.awayTeam === team;
  if (!isHome && !isAway) return null;
  if (event.result === 'tie') return 'tie';
  if (event.result === 'home') return isHome ? 'win' : 'loss';
  return isAway ? 'win' : 'loss'; // event.result === 'away'
}

function opponentForTeam(event, team) {
  if (event.homeTeam === team) return event.awayTeam || null;
  if (event.awayTeam === team) return event.homeTeam || null;
  return null;
}

const LABEL_LUCKY    = { text: 'Lucky Charm', icon: '🍀', key: 'lucky' };
const LABEL_BALANCED = { text: 'Balanced',    icon: '⚖️', key: 'balanced' };
const LABEL_JINX     = { text: 'Jinx',        icon: '😬', key: 'jinx' };
const LABEL_UNDECIDED = { text: 'Undecided',  icon: '🤷', key: 'undecided' };

function labelForWinPct(winPct) {
  if (winPct === null) return LABEL_UNDECIDED;
  if (winPct > 0.65) return LABEL_LUCKY;
  if (winPct >= 0.45) return LABEL_BALANCED;
  return LABEL_JINX;
}

// One card per team the user has logged as a home or away team on any
// Stadium Sports event — tracks how that team performed in the games the
// user personally attended (not the user's own team-agnostic attendance).
export function computeTeamStats(events) {
  const byKey = new Map();

  events.forEach((e) => {
    if (!TEAM_TRACKED_CATEGORIES.includes(e.category)) return;
    [e.homeTeam, e.awayTeam].forEach((team) => {
      if (!team) return;
      const key = `${e.category}::${team}`;
      if (!byKey.has(key)) byKey.set(key, { league: e.category, team, events: [] });
      byKey.get(key).events.push(e);
    });
  });

  return Array.from(byKey.values())
    .map(({ league, team, events: teamEvents }) => {
      let wins = 0, losses = 0, ties = 0, noResult = 0;
      teamEvents.forEach((e) => {
        const outcome = outcomeForTeam(e, team);
        if (outcome === 'win') wins++;
        else if (outcome === 'loss') losses++;
        else if (outcome === 'tie') ties++;
        else noResult++;
      });
      const decided = wins + losses;
      const winPct = decided > 0 ? wins / decided : null;
      return {
        id: `${league}::${team}`,
        league,
        team,
        gamesAttended: teamEvents.length,
        wins, losses, ties, noResult,
        winPct,
        label: labelForWinPct(winPct),
      };
    })
    .sort((a, b) => b.gamesAttended - a.gamesAttended || a.team.localeCompare(b.team));
}

// Chronological log of every event logged for a specific team, for the Game
// Log screen reached by tapping a My Teams card.
export function getTeamGameLog(events, league, team) {
  const matches = events.filter(
    (e) => e.category === league && (e.homeTeam === team || e.awayTeam === team)
  );
  return sortByDateAsc(matches).map((e) => ({
    id: e.id,
    date: e.date,
    venue: e.venue,
    isHome: e.homeTeam === team,
    opponent: opponentForTeam(e, team),
    outcome: outcomeForTeam(e, team),
    verified: !!e.verified,
    raw: e, // full event (incl. gameStats) — for the box score screen
  }));
}
