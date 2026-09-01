import { TEAM_TRACKED_CATEGORIES } from '../constants';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { computeTeamStats } from './teamStats';
import { getOverallLuckyPlayer, getMlbLeagueBattingLeaders } from './mlbPlayerStats';

// Leagues with at least one attended event, most-attended first — feeds the
// per-league Sports Review buttons on the Stats tab (one review per league,
// not one for the whole Stadium Sports group).
export function getAvailableSportsLeagues(events) {
  const counts = {};
  events.forEach((e) => {
    if (TEAM_TRACKED_CATEGORIES.includes(e.category)) counts[e.category] = (counts[e.category] || 0) + 1;
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
}

// Score margin from `team`'s perspective for one event, or null if the game's
// final score was never fetched (GAME_STATS_CATEGORIES-gated, and only after
// a successful gameStatsApi fetch) — see utils/gameStatsApi.js.
function marginForTeam(event, team) {
  const fs = event.gameStats?.finalScore;
  if (!fs || !Number.isFinite(fs.home) || !Number.isFinite(fs.away)) return null;
  const isHome = event.homeTeam === team;
  const isAway = event.awayTeam === team;
  if (!isHome && !isAway) return null;
  const teamScore = isHome ? fs.home : fs.away;
  const oppScore = isHome ? fs.away : fs.home;
  const opponent = isHome ? event.awayTeam : event.homeTeam;
  return { margin: teamScore - oppScore, teamScore, oppScore, opponent };
}

// One review card per league — scoped to whichever team the user follows
// most closely in that league (the app's single global favoriteTeam if it
// plays in this league, else whoever the user has attended the most games
// for), since "win/loss record" and "biggest win/loss" only make sense from
// one team's perspective. Games where the user never logged a home/away team
// still count toward totalGames/stadiums but can't contribute to the record.
export function computeSportsReview(events, league, favoriteTeam) {
  const leagueEvents = events.filter((e) => e.category === league);
  const totalGames = leagueEvents.length;
  const stadiums = new Set(leagueEvents.map((e) => e.venue)).size;

  const teamStats = computeTeamStats(leagueEvents); // already sorted by gamesAttended desc
  let yourTeam = favoriteTeam && favoriteTeam.league === league
    ? teamStats.find((t) => t.team === favoriteTeam.team) ?? null
    : null;
  if (!yourTeam) yourTeam = teamStats[0] ?? null;

  let wins = 0, losses = 0, ties = 0, homeGames = 0, awayGames = 0;
  let biggestWin = null, biggestLoss = null;

  if (yourTeam) {
    ({ wins, losses, ties } = yourTeam);
    leagueEvents
      .filter((e) => e.homeTeam === yourTeam.team || e.awayTeam === yourTeam.team)
      .forEach((e) => {
        if (e.homeTeam === yourTeam.team) homeGames++; else awayGames++;

        const result = marginForTeam(e, yourTeam.team);
        if (!result) return;
        const detail = { opponent: result.opponent, teamScore: result.teamScore, oppScore: result.oppScore, venue: e.venue, date: e.date };
        if (result.margin > 0 && (!biggestWin || result.margin > biggestWin.margin)) biggestWin = { ...detail, margin: result.margin };
        if (result.margin < 0 && (!biggestLoss || result.margin < biggestLoss.margin)) biggestLoss = { ...detail, margin: result.margin };
      });
  }

  const mlb = league === 'MLB'
    ? { battingLeaders: getMlbLeagueBattingLeaders(events), luckyPlayer: getOverallLuckyPlayer(events) }
    : null;

  return {
    league,
    icon: LEAGUE_ICONS[league] ?? '🏟',
    totalGames, stadiums,
    yourTeam: yourTeam?.team ?? null,
    wins, losses, ties, homeGames, awayGames,
    biggestWin, biggestLoss,
    mlb,
  };
}
