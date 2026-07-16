import { GAME_STATS_CATEGORIES } from '../constants';
import { resolveMlbTeamId } from './mlbTeamIds';
import { fuzzyMatches } from './textMatch';
import { parseDateStr } from './dates';

const FETCH_TIMEOUT_MS = 10000;

// Same shape as utils/geo.js's nominatimGet: AbortController + timeout,
// throws on non-2xx or network failure — callers catch and fail silently.
async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Single source of truth for "is this event eligible for a game-stats fetch"
// — used both to decide whether to fetch (App.js) and whether to render
// anything (GameStatsCard).
export function canFetchGameStats(event) {
  if (!event || !GAME_STATS_CATEGORIES.includes(event.category)) return false;
  if (!event.date || event.date === '—') return false;
  if (!event.homeTeam?.trim() || !event.awayTeam?.trim()) return false;
  if (parseDateStr(event.date) > new Date()) return false; // hasn't happened yet
  return true;
}

// True for ESPN-backed events whose gameStats predate the full box score
// fields (espnBoxscore/fullTeamStats) — lets App.js re-run the same idempotent
// fetchGameStats() once to backfill older logged games for the box score
// screen. MLB events never need this: gamesStarted/full player lines were
// already retained in mlbBoxscore from day one.
export function needsGameStatsRefresh(event) {
  if (!event || event.gameStats?.status !== 'found') return false;
  if (!ESPN_SPORT_SLUGS[event.category]) return false;
  return !event.gameStats.espnBoxscore || !event.gameStats.fullTeamStats;
}

const ESPN_SPORT_SLUGS = {
  NFL: 'football/nfl',
  NBA: 'basketball/nba',
  NHL: 'hockey/nhl',
  CFB: 'football/college-football',
  CBB: 'basketball/mens-college-basketball',
};

const FOOTBALL_KEY_STATS = [
  { name: 'totalYards', label: 'Total Yards' },
  { name: 'turnovers', label: 'Turnovers' },
  { name: 'thirdDownEff', label: '3rd Down' },
  { name: 'possessionTime', label: 'Possession' },
];
const BASKETBALL_KEY_STATS = [
  { name: 'fieldGoalPct', label: 'FG%' },
  { name: 'threePointFieldGoalPct', label: '3PT%' },
  { name: 'totalRebounds', label: 'Rebounds' },
  { name: 'assists', label: 'Assists' },
];
const HOCKEY_KEY_STATS = [
  { name: 'shotsTotal', label: 'Shots' },
  { name: 'powerPlayGoals', label: 'PP Goals' },
  { name: 'hits', label: 'Hits' },
  { name: 'takeaways', label: 'Takeaways' },
];
const ESPN_KEY_STATS = {
  NFL: FOOTBALL_KEY_STATS,
  CFB: FOOTBALL_KEY_STATS,
  NBA: BASKETBALL_KEY_STATS,
  CBB: BASKETBALL_KEY_STATS,
  NHL: HOCKEY_KEY_STATS,
};

function baseResult(status, sourceId = null) {
  return { status, fetchedAt: new Date().toISOString(), sourceId, finalScore: null, keyStats: null };
}

export async function fetchGameStats(event) {
  try {
    if (!canFetchGameStats(event)) return baseResult('not_found');
    if (event.category === 'MLB') return await fetchMlbGameStats(event);
    if (ESPN_SPORT_SLUGS[event.category]) return await fetchEspnGameStats(event);
    return baseResult('not_found');
  } catch (_) {
    return baseResult('error');
  }
}

async function fetchMlbGameStats(event) {
  const homeId = resolveMlbTeamId(event.homeTeam);
  const awayId = resolveMlbTeamId(event.awayTeam);
  if (!homeId || !awayId) return baseResult('not_found');

  const schedule = await fetchJsonWithTimeout(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${homeId}&date=${event.date}`
  );
  const games = schedule.dates?.[0]?.games ?? [];
  // Doubleheader-safe: match on both team ids, tolerate a flipped home/away
  // entry, first match wins if genuinely ambiguous (rare same-day rematch).
  let game = games.find((g) => g.teams.home.team.id === homeId && g.teams.away.team.id === awayId);
  if (!game) game = games.find((g) => g.teams.home.team.id === awayId && g.teams.away.team.id === homeId);
  if (!game) return baseResult('not_found');

  if (game.status?.abstractGameState !== 'Final') return baseResult('scheduled', game.gamePk);

  const boxscore = await fetchJsonWithTimeout(`https://statsapi.mlb.com/api/v1/game/${game.gamePk}/boxscore`);

  const homeSide = game.teams.home.team.id === homeId ? 'home' : 'away';
  const awaySide = homeSide === 'home' ? 'away' : 'home';
  const finalScore = { home: game.teams[homeSide].score, away: game.teams[awaySide].score };

  const homeBatting = boxscore.teams[homeSide]?.teamStats?.batting;
  const awayBatting = boxscore.teams[awaySide]?.teamStats?.batting;
  const homePitching = boxscore.teams[homeSide]?.teamStats?.pitching;
  const awayPitching = boxscore.teams[awaySide]?.teamStats?.pitching;

  const keyStats = [];
  if (homeBatting && awayBatting) {
    keyStats.push({ label: 'Hits', home: String(homeBatting.hits), away: String(awayBatting.hits) });
    keyStats.push({ label: 'Home Runs', home: String(homeBatting.homeRuns), away: String(awayBatting.homeRuns) });
    keyStats.push({ label: 'RBI', home: String(homeBatting.rbi), away: String(awayBatting.rbi) });
  }
  if (homePitching && awayPitching) {
    keyStats.push({ label: 'Strikeouts', home: String(homePitching.strikeOuts), away: String(awayPitching.strikeOuts) });
  }

  return {
    status: 'found',
    fetchedAt: new Date().toISOString(),
    sourceId: game.gamePk,
    finalScore,
    keyStats,
    // Retained (MLB only) for Part 2/3 player-attendance aggregation — the
    // same call already contains per-player game AND season-to-date stats.
    mlbBoxscore: {
      home: { teamId: game.teams.home.team.id, players: boxscore.teams.home.players },
      away: { teamId: game.teams.away.team.id, players: boxscore.teams.away.players },
    },
  };
}

async function fetchEspnGameStats(event) {
  const slug = ESPN_SPORT_SLUGS[event.category];
  const dateParam = event.date.replace(/-/g, '');
  const scoreboard = await fetchJsonWithTimeout(
    `https://site.api.espn.com/apis/site/v2/sports/${slug}/scoreboard?dates=${dateParam}`
  );
  const dayEvents = scoreboard.events ?? [];
  const match = dayEvents.find((ev) => {
    const names = ev.competitions?.[0]?.competitors?.map((c) => c.team.displayName) ?? [];
    return names.some((n) => fuzzyMatches(n, event.homeTeam)) && names.some((n) => fuzzyMatches(n, event.awayTeam));
  });
  if (!match) return baseResult('not_found');

  const comp = match.competitions[0];
  const homeC = comp.competitors.find((c) => c.homeAway === 'home');
  const awayC = comp.competitors.find((c) => c.homeAway === 'away');

  if (!match.status?.type?.completed) return baseResult('scheduled', match.id);

  const summary = await fetchJsonWithTimeout(
    `https://site.api.espn.com/apis/site/v2/sports/${slug}/summary?event=${match.id}`
  );

  const finalScore = { home: Number(homeC.score), away: Number(awayC.score) };

  const boxTeams = summary.boxscore?.teams ?? [];
  const homeBox = boxTeams.find((t) => fuzzyMatches(t.team.displayName, homeC.team.displayName));
  const awayBox = boxTeams.find((t) => fuzzyMatches(t.team.displayName, awayC.team.displayName));

  const statConfig = ESPN_KEY_STATS[event.category] ?? [];
  const keyStats = statConfig
    .map(({ name, label }) => {
      const homeStat = homeBox?.statistics?.find((s) => s.name === name);
      const awayStat = awayBox?.statistics?.find((s) => s.name === name);
      return homeStat && awayStat ? { label, home: homeStat.displayValue, away: awayStat.displayValue } : null;
    })
    .filter(Boolean);

  // Every team stat ESPN reports (not just the 4 curated keyStats above) —
  // powers the full box score screen's team-stats table. Same `summary`
  // response already fetched above, no extra call.
  const fullTeamStats = {
    home: (homeBox?.statistics ?? []).map((s) => ({ label: s.label ?? s.displayName ?? s.name, value: s.displayValue })),
    away: (awayBox?.statistics ?? []).map((s) => ({ label: s.label ?? s.displayName ?? s.name, value: s.displayValue })),
  };

  // Full per-player box score, generic across NFL/NBA/NHL/CFB/CBB: each team
  // has one or more stat groups (passing/rushing/receiving for football, a
  // single group for basketball, etc.), each with its own column labels and
  // one row per athlete whose stats line up with those labels.
  const boxPlayers = summary.boxscore?.players ?? [];
  const homePlayerBox = boxPlayers.find((t) => fuzzyMatches(t.team?.displayName, homeC.team.displayName));
  const awayPlayerBox = boxPlayers.find((t) => fuzzyMatches(t.team?.displayName, awayC.team.displayName));
  const normalizeGroups = (teamBox) =>
    (teamBox?.statistics ?? []).map((g) => ({
      name: g.name ?? null,
      labels: g.labels ?? [],
      athletes: (g.athletes ?? []).map((a) => ({
        name: a.athlete?.displayName ?? 'Unknown',
        starter: !!a.starter,
        stats: a.stats ?? [],
      })),
    })).filter((g) => g.athletes.length > 0);
  const espnBoxscore = {
    home: { groups: normalizeGroups(homePlayerBox) },
    away: { groups: normalizeGroups(awayPlayerBox) },
  };

  // Trimmed per-team leader board (already in this same response, no extra
  // call) — powers the best-effort "My Player Stats" view for non-MLB leagues.
  const espnLeaders = (summary.leaders ?? []).map((teamLeaders) => ({
    team: fuzzyMatches(teamLeaders.team?.displayName, homeC.team.displayName) ? 'home' : 'away',
    leaders: (teamLeaders.leaders ?? [])
      .map((cat) => ({
        category: cat.displayName || cat.name,
        playerName: cat.leaders?.[0]?.athlete?.displayName ?? null,
        displayValue: cat.leaders?.[0]?.displayValue ?? null,
      }))
      .filter((l) => l.playerName),
  }));

  return {
    status: 'found',
    fetchedAt: new Date().toISOString(),
    sourceId: match.id,
    finalScore,
    keyStats,
    fullTeamStats,
    espnBoxscore,
    espnLeaders,
  };
}
