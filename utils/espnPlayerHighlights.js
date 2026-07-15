import { sortByDateAsc } from './eventDates';

const MAX_PLAYERS = 5;

// Best-effort "My Player Stats" for the ESPN-backed leagues (NFL/NBA/NHL/
// CFB/CBB) — no per-player season data is fetched for these leagues, so
// unlike MLB there's no season-average comparison, no up/down arrow, and no
// "lucky player." Instead: which players most often showed up as a
// per-category boxscore leader (passing yards, points, goals, ...) across
// the games the user attended, using event.gameStats.espnLeaders — already
// captured by Part 1's fetch, no extra API calls.
export function getEspnPlayerHighlights(events, league, team) {
  const attendedGames = sortByDateAsc(
    events.filter((e) =>
      e.category === league &&
      (e.homeTeam === team || e.awayTeam === team) &&
      e.gameStats?.status === 'found' &&
      e.gameStats?.espnLeaders
    )
  );

  const byPlayer = new Map();

  attendedGames.forEach((event) => {
    const side = event.homeTeam === team ? 'home' : 'away';
    const teamLeaders = event.gameStats.espnLeaders.find((tl) => tl.team === side);
    if (!teamLeaders) return;

    teamLeaders.leaders.forEach((l) => {
      if (!byPlayer.has(l.playerName)) {
        byPlayer.set(l.playerName, { name: l.playerName, timesLed: 0, categories: new Set(), line: l.displayValue });
      }
      const entry = byPlayer.get(l.playerName);
      entry.timesLed += 1;
      entry.categories.add(l.category);
      entry.line = l.displayValue; // keep the most recent representative line
    });
  });

  return Array.from(byPlayer.values())
    .map((p) => ({
      name: p.name,
      position: Array.from(p.categories).join(', '),
      line: p.line,
      gamesAttended: p.timesLed,
    }))
    .sort((a, b) => b.gamesAttended - a.gamesAttended)
    .slice(0, MAX_PLAYERS);
}
