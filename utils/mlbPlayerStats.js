import { resolveMlbTeamId } from './mlbTeamIds';
import { sortByDateAsc } from './eventDates';

const MIN_SAMPLE_GAMES = 2;
const MIN_SAMPLE_PA_OR_BF = 3;
const FUN_LABEL_THRESHOLD = 0.10; // +10% better in attended games vs. season

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

function emptyPlayerEntry(person, position) {
  return {
    personId: person.id,
    name: person.fullName,
    position: position?.abbreviation || position?.name || '',
    gamesAttended: 0,
    batting: { ab: 0, h: 0, hr: 0, rbi: 0, bb: 0, so: 0, pa: 0 },
    pitching: { outs: 0, er: 0, h: 0, bb: 0, so: 0, bf: 0 },
    latestSeasonStats: null,
  };
}

// Pure aggregation over already-fetched event.gameStats.mlbBoxscore data — no
// network calls here. Part 1's boxscore fetch already retained both this
// game's stats AND the player's season-to-date stats as of that game, so the
// "attended vs. season" comparison needs nothing extra.
export function getMlbPlayerAttendanceStats(events, team) {
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
      const batted = battingGame && (battingGame.plateAppearances > 0);
      const pitched = pitchingGame && (pitchingGame.battersFaced > 0);
      if (!batted && !pitched) return; // did not play (bench/DNP)

      if (!byPlayer.has(p.person.id)) byPlayer.set(p.person.id, emptyPlayerEntry(p.person, p.position));
      const entry = byPlayer.get(p.person.id);
      entry.gamesAttended += 1;
      entry.latestSeasonStats = p.seasonStats; // ascending order -> ends on most recent

      if (batted) {
        entry.batting.ab += battingGame.atBats || 0;
        entry.batting.h += battingGame.hits || 0;
        entry.batting.hr += battingGame.homeRuns || 0;
        entry.batting.rbi += battingGame.rbi || 0;
        entry.batting.bb += battingGame.baseOnBalls || 0;
        entry.batting.so += battingGame.strikeOuts || 0;
        entry.batting.pa += battingGame.plateAppearances || 0;
      }
      if (pitched) {
        entry.pitching.outs += inningsPitchedToOuts(pitchingGame.inningsPitched);
        entry.pitching.er += pitchingGame.earnedRuns || 0;
        entry.pitching.h += pitchingGame.hits || 0;
        entry.pitching.bb += pitchingGame.baseOnBalls || 0;
        entry.pitching.so += pitchingGame.strikeOuts || 0;
        entry.pitching.bf += pitchingGame.battersFaced || 0;
      }
    });
  });

  const players = Array.from(byPlayer.values())
    .map((entry) => summarizePlayer(entry))
    .filter(Boolean)
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
  const isBatter = entry.batting.pa > 0;
  const isPitcher = entry.pitching.bf > 0;
  if (!isBatter && !isPitcher) return null;

  // Two-way players (rare) are summarized primarily by whichever role has
  // more of a sample this season — simplification, not a full dual-role view.
  const role = isBatter && isPitcher
    ? (entry.batting.pa >= entry.pitching.bf ? 'batting' : 'pitching')
    : (isBatter ? 'batting' : 'pitching');

  let attendedRate = null, seasonRate = null, delta = null, sampleSize, line;

  if (role === 'batting') {
    const { ab, h, hr, rbi } = entry.batting;
    attendedRate = ab > 0 ? h / ab : null;
    const seasonAvg = parseFloat(entry.latestSeasonStats?.batting?.avg);
    seasonRate = Number.isFinite(seasonAvg) ? seasonAvg : null;
    if (attendedRate != null && seasonRate) delta = (attendedRate - seasonRate) / seasonRate;
    sampleSize = entry.batting.pa;
    line = `${formatRate(attendedRate)} AVG · ${hr} HR · ${rbi} RBI in ${entry.gamesAttended} game${entry.gamesAttended === 1 ? '' : 's'}`;
  } else {
    const { outs, er, so } = entry.pitching;
    const trueInnings = outs / 3;
    attendedRate = trueInnings > 0 ? (er * 9) / trueInnings : null;
    const seasonEra = parseFloat(entry.latestSeasonStats?.pitching?.era);
    seasonRate = Number.isFinite(seasonEra) ? seasonEra : null;
    if (attendedRate != null && seasonRate) delta = (seasonRate - attendedRate) / seasonRate; // lower ERA = better
    sampleSize = entry.pitching.bf;
    line = `${formatRate(attendedRate, 2, false)} ERA · ${so} K in ${outsToInningsPitched(outs)} IP (${entry.gamesAttended} game${entry.gamesAttended === 1 ? '' : 's'})`;
  }

  const meetsSampleGuard = entry.gamesAttended >= MIN_SAMPLE_GAMES || sampleSize >= MIN_SAMPLE_PA_OR_BF;

  return {
    personId: entry.personId,
    name: entry.name,
    position: entry.position,
    gamesAttended: entry.gamesAttended,
    role,
    sampleSize,
    line,
    delta,
    meetsSampleGuard,
    arrow: delta == null ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
    playsBetterWithYou: delta != null && delta > FUN_LABEL_THRESHOLD && meetsSampleGuard,
  };
}

// Batting average conventionally drops the leading zero (".286"); ERA/WHIP
// do not (e.g. "0.69", not ".69").
function formatRate(n, decimals = 3, stripLeadingZero = true) {
  if (n == null || !Number.isFinite(n)) return '—';
  const formatted = n.toFixed(decimals);
  return stripLeadingZero ? formatted.replace(/^0\./, '.') : formatted;
}
