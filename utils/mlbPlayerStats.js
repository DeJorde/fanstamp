import { resolveMlbTeamId } from './mlbTeamIds';
import { sortByDateAsc } from './eventDates';

const MIN_SAMPLE_GAMES = 2;
const MIN_SAMPLE_PA_OR_BF = 3;
const FUN_LABEL_THRESHOLD = 0.10; // +10% better in attended games vs. season
const MIN_CUMULATIVE_GAMES = 3;
const TREND_IMPROVING_THRESHOLD = 0.08; // 2nd-half segment vs. 1st-half segment

// MLB reports partial innings as .1/.2 (thirds), not decimal tenths.
function inningsPitchedToOuts(ip) {
  if (!ip) return 0;
  const [whole, third] = String(ip).split('.').map(Number);
  return (whole || 0) * 3 + (third || 0);
}
function outsToInningsPitched(outs) {
  const whole = Math.floor(outs / 3);
  const third = outs % 3;
  return `${whole}.${third}`;
}

// Shared walk over every attended MLB game for `team`, collecting each
// player's per-game batting/pitching line (plus that game's seasonStats
// snapshot and whether they started on the mound). Pure aggregation over
// already-fetched event.gameStats.mlbBoxscore data — no network calls here.
// Feeds getMlbPlayerAttendanceStats, getMlbStartingPitcherStats, and
// getMlbCumulativePlayerStats so the boxscore-walking logic lives in one place.
function collectMlbPlayerGames(events, team) {
  const teamId = resolveMlbTeamId(team);
  const attendedGames = sortByDateAsc(
    events.filter((e) =>
      e.category === 'MLB' &&
      (e.homeTeam === team || e.awayTeam === team) &&
      e.gameStats?.status === 'found' &&
      e.gameStats?.mlbBoxscore
    )
  );

  const byPlayer = new Map();

  attendedGames.forEach((event) => {
    const box = event.gameStats.mlbBoxscore;
    const side = box.home.teamId === teamId ? 'home' : box.away.teamId === teamId ? 'away' : null;
    if (!side) return;

    Object.values(box[side].players || {}).forEach((p) => {
      const battingGame = p.stats?.batting;
      const pitchingGame = p.stats?.pitching;
      const batted = battingGame && battingGame.plateAppearances > 0;
      const pitched = pitchingGame && pitchingGame.battersFaced > 0;
      if (!batted && !pitched) return; // did not play (bench/DNP)

      if (!byPlayer.has(p.person.id)) {
        byPlayer.set(p.person.id, {
          personId: p.person.id,
          name: p.person.fullName,
          position: p.position?.abbreviation || p.position?.name || '',
          games: [],
        });
      }
      byPlayer.get(p.person.id).games.push({
        date: event.date,
        batting: batted ? battingGame : null,
        pitching: pitched ? pitchingGame : null,
        // MLB Stats API marks the pitcher who got the start with gamesStarted:
        // 1 on their per-game line — no separate fetch needed to find the SP.
        isStarter: !!(pitched && pitchingGame.gamesStarted === 1),
        seasonStats: p.seasonStats,
      });
    });
  });

  return byPlayer;
}

function aggregateTotals(games) {
  const batting = { ab: 0, h: 0, hr: 0, rbi: 0, bb: 0, so: 0, pa: 0 };
  const pitching = { outs: 0, er: 0, h: 0, bb: 0, so: 0, bf: 0 };
  games.forEach((g) => {
    if (g.batting) {
      batting.ab += g.batting.atBats || 0;
      batting.h += g.batting.hits || 0;
      batting.hr += g.batting.homeRuns || 0;
      batting.rbi += g.batting.rbi || 0;
      batting.bb += g.batting.baseOnBalls || 0;
      batting.so += g.batting.strikeOuts || 0;
      batting.pa += g.batting.plateAppearances || 0;
    }
    if (g.pitching) {
      pitching.outs += inningsPitchedToOuts(g.pitching.inningsPitched);
      pitching.er += g.pitching.earnedRuns || 0;
      pitching.h += g.pitching.hits || 0;
      pitching.bb += g.pitching.baseOnBalls || 0;
      pitching.so += g.pitching.strikeOuts || 0;
      pitching.bf += g.pitching.battersFaced || 0;
    }
  });
  return { batting, pitching };
}

// "My Player Stats" — batters only. Pitchers get their own dedicated
// "Starting Pitchers" subsection (getMlbStartingPitcherStats) with a richer,
// starts-only view, so mixing them into one top-5-by-sample list (as this
// used to do) would both duplicate them and compare AVG deltas against ERA
// deltas when picking "Your Lucky Player" — apples to oranges.
export function getMlbPlayerAttendanceStats(events, team) {
  const byPlayer = collectMlbPlayerGames(events, team);

  const players = Array.from(byPlayer.values())
    .map((entry) => summarizePlayer(entry))
    .filter((p) => p && p.role === 'batting')
    .sort((a, b) => b.gamesAttended - a.gamesAttended || b.sampleSize - a.sampleSize)
    .slice(0, 5);

  // "Your Lucky Player" — best delta among the top 5, only if it clears the
  // same minimum-sample guard as the fun label (no crowning a 1-AB outlier).
  let luckyId = null;
  let bestDelta = -Infinity;
  players.forEach((p) => {
    if (p.delta != null && p.meetsSampleGuard && p.delta > bestDelta) {
      bestDelta = p.delta;
      luckyId = p.personId;
    }
  });

  return players.map((p) => ({ ...p, isLuckyPlayer: p.personId === luckyId }));
}

function summarizePlayer(entry) {
  const { batting, pitching } = aggregateTotals(entry.games);
  const isBatter = batting.pa > 0;
  const isPitcher = pitching.bf > 0;
  if (!isBatter && !isPitcher) return null;

  // Two-way players (rare) are summarized primarily by whichever role has
  // more of a sample this season — simplification, not a full dual-role view.
  const role = isBatter && isPitcher
    ? (batting.pa >= pitching.bf ? 'batting' : 'pitching')
    : (isBatter ? 'batting' : 'pitching');

  const gamesAttended = entry.games.length;
  const latestSeasonStats = entry.games[entry.games.length - 1]?.seasonStats;

  let attendedRate = null, seasonRate = null, delta = null, sampleSize, line;

  if (role === 'batting') {
    const { ab, h, hr, rbi } = batting;
    attendedRate = ab > 0 ? h / ab : null;
    const seasonAvg = parseFloat(latestSeasonStats?.batting?.avg);
    seasonRate = Number.isFinite(seasonAvg) ? seasonAvg : null;
    if (attendedRate != null && seasonRate) delta = (attendedRate - seasonRate) / seasonRate;
    sampleSize = batting.pa;
    line = `${formatRate(attendedRate)} AVG · ${hr} HR · ${rbi} RBI in ${gamesAttended} game${gamesAttended === 1 ? '' : 's'}`;
  } else {
    const { outs, er, so } = pitching;
    const trueInnings = outs / 3;
    attendedRate = trueInnings > 0 ? (er * 9) / trueInnings : null;
    const seasonEra = parseFloat(latestSeasonStats?.pitching?.era);
    seasonRate = Number.isFinite(seasonEra) ? seasonEra : null;
    if (attendedRate != null && seasonRate) delta = (seasonRate - attendedRate) / seasonRate; // lower ERA = better
    sampleSize = pitching.bf;
    line = `${formatRate(attendedRate, 2, false)} ERA · ${so} K in ${outsToInningsPitched(outs)} IP (${gamesAttended} game${gamesAttended === 1 ? '' : 's'})`;
  }

  const meetsSampleGuard = gamesAttended >= MIN_SAMPLE_GAMES || sampleSize >= MIN_SAMPLE_PA_OR_BF;

  return {
    personId: entry.personId,
    name: entry.name,
    position: entry.position,
    gamesAttended,
    role,
    sampleSize,
    line,
    delta,
    meetsSampleGuard,
    arrow: delta == null ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
    playsBetterWithYou: delta != null && delta > FUN_LABEL_THRESHOLD && meetsSampleGuard,
  };
}

// "Starting Pitchers" — starts-only aggregation (relief appearances excluded)
// for whoever started a game the user attended, with the same
// attended-vs-season-ERA arrow the batting cards use.
export function getMlbStartingPitcherStats(events, team) {
  const byPlayer = collectMlbPlayerGames(events, team);

  return Array.from(byPlayer.values())
    .map((entry) => {
      const starts = entry.games.filter((g) => g.isStarter);
      if (starts.length === 0) return null;

      const totals = { outs: 0, er: 0, h: 0, bb: 0, so: 0, bf: 0 };
      starts.forEach((g) => {
        totals.outs += inningsPitchedToOuts(g.pitching.inningsPitched);
        totals.er += g.pitching.earnedRuns || 0;
        totals.h += g.pitching.hits || 0;
        totals.bb += g.pitching.baseOnBalls || 0;
        totals.so += g.pitching.strikeOuts || 0;
        totals.bf += g.pitching.battersFaced || 0;
      });

      const trueInnings = totals.outs / 3;
      const attendedRate = trueInnings > 0 ? (totals.er * 9) / trueInnings : null;
      const seasonEra = parseFloat(starts[starts.length - 1].seasonStats?.pitching?.era);
      const seasonRate = Number.isFinite(seasonEra) ? seasonEra : null;
      const delta = attendedRate != null && seasonRate ? (seasonRate - attendedRate) / seasonRate : null;
      const meetsSampleGuard = starts.length >= MIN_SAMPLE_GAMES || totals.bf >= MIN_SAMPLE_PA_OR_BF;

      return {
        personId: entry.personId,
        name: entry.name,
        position: entry.position,
        gamesAttended: starts.length,
        line: `${outsToInningsPitched(totals.outs)} IP · ${totals.h} H · ${totals.er} ER · ${totals.so} K · ${totals.bb} BB · ${formatRate(attendedRate, 2, false)} ERA (${starts.length} start${starts.length === 1 ? '' : 's'})`,
        delta,
        meetsSampleGuard,
        arrow: delta == null ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.gamesAttended - a.gamesAttended)
    .slice(0, 5);
}

// Per-game rate (not cumulative) for a single game, used only to classify a
// trend direction — noisy on its own, which is why classifyTrend compares
// segment averages rather than any single game.
function gameRate(game, role) {
  if (role === 'batting') {
    const ab = game.batting?.atBats || 0;
    return ab > 0 ? (game.batting.hits || 0) / ab : null;
  }
  const outs = inningsPitchedToOuts(game.pitching?.inningsPitched);
  const trueInnings = outs / 3;
  return trueInnings > 0 ? ((game.pitching.earnedRuns || 0) * 9) / trueInnings : null;
}

// Running cumulative rate after each game (AVG or ERA-to-date) — the
// sparkline series. Smoother and more readable than plotting each game's own
// noisy rate, while still telling the same improving/declining story.
function buildTrendSeries(games, role) {
  let runningAB = 0, runningH = 0, runningOuts = 0, runningER = 0;
  const series = [];
  games.forEach((g) => {
    if (role === 'batting') {
      if (!g.batting) return;
      runningAB += g.batting.atBats || 0;
      runningH += g.batting.hits || 0;
      if (runningAB > 0) series.push(runningH / runningAB);
    } else {
      if (!g.pitching) return;
      runningOuts += inningsPitchedToOuts(g.pitching.inningsPitched);
      runningER += g.pitching.earnedRuns || 0;
      const trueInnings = runningOuts / 3;
      if (trueInnings > 0) series.push((runningER * 9) / trueInnings);
    }
  });
  return series;
}

// Splits the player's per-game (non-cumulative) rates into a first-half and
// second-half segment and compares the segment averages — "improving" needs
// the second half to clear TREND_IMPROVING_THRESHOLD better than the first
// (ERA sign-flipped, same convention as the existing arrow `delta`), so a
// single hot or cold game doesn't flip the label.
function classifyTrend(games, role) {
  const rates = games.map((g) => gameRate(g, role)).filter((r) => r != null);
  if (rates.length < MIN_CUMULATIVE_GAMES) return 'steady';

  const mid = Math.ceil(rates.length / 2);
  const firstHalf = rates.slice(0, mid);
  const secondHalf = rates.slice(mid);
  if (secondHalf.length === 0) return 'steady';

  const avg = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;
  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);
  if (firstAvg === 0) return 'steady';

  const change = role === 'batting' ? (secondAvg - firstAvg) / firstAvg : (firstAvg - secondAvg) / firstAvg;
  return change > TREND_IMPROVING_THRESHOLD ? 'improving' : 'steady';
}

// Players the user has seen at least MIN_CUMULATIVE_GAMES times — a
// cumulative totals card with a running-rate sparkline, shown above "My
// Player Stats". "Getting Hot" if their rate is trending up across the games
// attended; "Your Regular" otherwise (a "you see this player a lot" label,
// not a performance judgment).
export function getMlbCumulativePlayerStats(events, team) {
  const byPlayer = collectMlbPlayerGames(events, team);

  return Array.from(byPlayer.values())
    .filter((entry) => entry.games.length >= MIN_CUMULATIVE_GAMES)
    .map((entry) => {
      const summary = summarizePlayer(entry);
      if (!summary) return null;
      return {
        personId: summary.personId,
        name: summary.name,
        position: summary.position,
        gamesAttended: summary.gamesAttended,
        line: summary.line,
        trendSeries: buildTrendSeries(entry.games, summary.role),
        trend: classifyTrend(entry.games, summary.role),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.gamesAttended - a.gamesAttended);
}

// Full-roster batting line for the "Full Team Stats" screen — every batter
// who appeared in any attended game (not just the top-5 sample), sorted by
// plate appearances, with the extended box-score-reference column set.
export function getMlbCumulativeTeamBattingStats(events, team) {
  const byPlayer = collectMlbPlayerGames(events, team);
  const luckyId = getMlbPlayerAttendanceStats(events, team).find((p) => p.isLuckyPlayer)?.personId ?? null;

  return Array.from(byPlayer.values())
    .map((entry) => {
      const t = { games: 0, ab: 0, r: 0, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, bb: 0, so: 0, hbp: 0, sf: 0, tb: 0, pa: 0 };
      entry.games.forEach((g) => {
        if (!g.batting) return;
        t.games += 1;
        t.ab += g.batting.atBats || 0;
        t.r += g.batting.runs || 0;
        t.h += g.batting.hits || 0;
        t.doubles += g.batting.doubles || 0;
        t.triples += g.batting.triples || 0;
        t.hr += g.batting.homeRuns || 0;
        t.rbi += g.batting.rbi || 0;
        t.bb += g.batting.baseOnBalls || 0;
        t.so += g.batting.strikeOuts || 0;
        t.hbp += g.batting.hitByPitch || 0;
        t.sf += g.batting.sacFlies || 0;
        t.tb += g.batting.totalBases || 0;
        t.pa += g.batting.plateAppearances || 0;
      });
      if (t.pa === 0) return null;

      const avg = t.ab > 0 ? t.h / t.ab : 0;
      const obpDenom = t.ab + t.bb + t.hbp + t.sf;
      const obp = obpDenom > 0 ? (t.h + t.bb + t.hbp) / obpDenom : 0;
      const slg = t.ab > 0 ? t.tb / t.ab : 0;

      return {
        personId: entry.personId,
        name: entry.name,
        position: entry.position,
        isLucky: entry.personId === luckyId,
        pa: t.pa,
        games: t.games, ab: t.ab, r: t.r, h: t.h, doubles: t.doubles, triples: t.triples, hr: t.hr,
        rbi: t.rbi, bb: t.bb, so: t.so,
        avg: formatRate(avg), obp: formatRate(obp), slg: formatRate(slg),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.pa - a.pa);
}

// Full pitching staff line for the "Full Team Stats" screen — every pitcher
// who appeared (starts and relief), sorted by innings pitched.
export function getMlbCumulativeTeamPitchingStats(events, team) {
  const byPlayer = collectMlbPlayerGames(events, team);

  return Array.from(byPlayer.values())
    .map((entry) => {
      const t = { games: 0, gs: 0, outs: 0, h: 0, r: 0, er: 0, bb: 0, so: 0 };
      entry.games.forEach((g) => {
        if (!g.pitching) return;
        t.games += 1;
        if (g.isStarter) t.gs += 1;
        t.outs += inningsPitchedToOuts(g.pitching.inningsPitched);
        t.h += g.pitching.hits || 0;
        t.r += g.pitching.runs || 0;
        t.er += g.pitching.earnedRuns || 0;
        t.bb += g.pitching.baseOnBalls || 0;
        t.so += g.pitching.strikeOuts || 0;
      });
      if (t.games === 0) return null;

      const trueInnings = t.outs / 3;
      const era = trueInnings > 0 ? (t.er * 9) / trueInnings : 0;
      const whip = trueInnings > 0 ? (t.bb + t.h) / trueInnings : 0;

      return {
        personId: entry.personId,
        name: entry.name,
        position: entry.position,
        outsSort: t.outs,
        games: t.games, gs: t.gs, ip: outsToInningsPitched(t.outs),
        h: t.h, r: t.r, er: t.er, bb: t.bb, so: t.so,
        era: formatRate(era, 2, false), whip: formatRate(whip, 2, false),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.outsSort - a.outsSort);
}

// One global "Your Lucky Player" across every MLB team the user has
// attended games for (getMlbPlayerAttendanceStats crowns a lucky player per
// team already) — picks whichever team's lucky player has the best delta,
// for the Rich Share Card, which isn't scoped to a single team.
export function getOverallLuckyPlayer(events) {
  const mlbTeams = Array.from(new Set(
    events
      .filter((e) => e.category === 'MLB')
      .flatMap((e) => [e.homeTeam, e.awayTeam])
      .filter(Boolean)
  ));

  let best = null;
  mlbTeams.forEach((team) => {
    const lucky = getMlbPlayerAttendanceStats(events, team).find((p) => p.isLuckyPlayer);
    if (lucky && (best == null || lucky.delta > best.delta)) {
      best = { ...lucky, team };
    }
  });
  return best;
}

// Batting average conventionally drops the leading zero (".286"); ERA/WHIP
// do not (e.g. "0.69", not ".69").
function formatRate(n, decimals = 3, stripLeadingZero = true) {
  if (n == null || !Number.isFinite(n)) return '—';
  const formatted = n.toFixed(decimals);
  return stripLeadingZero ? formatted.replace(/^0\./, '.') : formatted;
}
