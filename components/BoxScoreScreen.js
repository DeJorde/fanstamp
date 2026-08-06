import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';
import { BoxScoreTable } from './BoxScoreTable';

const EMPTY_TEXT = {
  scheduled: "Game hasn't been played yet",
  not_found: 'No game stats found for this event',
  error: "Couldn't load game stats",
};

const MLB_BATTING_LABELS = ['AB', 'R', 'H', 'RBI', 'BB', 'K'];
const MLB_PITCHING_LABELS = ['IP', 'H', 'ER', 'BB', 'K'];

function titleCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : null;
}

function mlbBattingRows(players) {
  return Object.values(players || {})
    .filter((p) => (p.stats?.batting?.plateAppearances ?? 0) > 0)
    .map((p) => {
      const b = p.stats.batting;
      return { name: p.person.fullName, values: [b.atBats ?? 0, b.runs ?? 0, b.hits ?? 0, b.rbi ?? 0, b.baseOnBalls ?? 0, b.strikeOuts ?? 0] };
    });
}

function mlbPitchingRows(players) {
  return Object.values(players || {})
    .filter((p) => (p.stats?.pitching?.battersFaced ?? 0) > 0)
    .map((p) => {
      const s = p.stats.pitching;
      return {
        name: p.person.fullName,
        tag: s.gamesStarted === 1 ? 'SP' : null,
        values: [s.inningsPitched ?? '0.0', s.hits ?? 0, s.earnedRuns ?? 0, s.baseOnBalls ?? 0, s.strikeOuts ?? 0],
      };
    });
}

function zipTeamStats(home, away) {
  return (home || []).map((h) => ({
    label: h.label,
    home: h.value,
    away: (away || []).find((x) => x.label === h.label)?.value ?? '—',
  }));
}

export function BoxScoreScreen({ event, onRetryStats }) {
  const { styles, colors } = useTheme();
  const gameStats = event.gameStats;
  const isMlb = event.category === 'MLB';
  const status = gameStats?.status;
  const hasBoxData = status === 'found' && (isMlb ? !!gameStats.mlbBoxscore : !!gameStats.espnBoxscore);

  return (
    <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailName}>{event.awayTeam || 'Away'} @ {event.homeTeam || 'Home'}</Text>
      <Text style={styles.gameLogVenue}>{event.venue}</Text>
      <Text style={styles.gameLogDate}>{formatDisplayDate(event.date)}</Text>

      {(!gameStats || status === 'loading') && (
        <View style={styles.detailCard}>
          <View style={styles.gameStatsLoadingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.gameStatsLoadingText}>Fetching box score...</Text>
          </View>
        </View>
      )}

      {gameStats && status !== 'loading' && !hasBoxData && (
        <View style={styles.detailCard}>
          <Text style={styles.gameStatsEmptyText}>{EMPTY_TEXT[status] ?? 'Full box score not available for this game'}</Text>
          <TouchableOpacity onPress={() => onRetryStats(event)} activeOpacity={0.7}>
            <Text style={styles.gameStatsRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasBoxData && gameStats.finalScore && (
        <View style={styles.detailCard}>
          <View style={styles.gameStatsScoreRow}>
            <Text style={styles.gameStatsScoreTeam} numberOfLines={1}>{event.awayTeam || 'Away'}</Text>
            <Text style={styles.gameStatsScoreValue}>{gameStats.finalScore.away} – {gameStats.finalScore.home}</Text>
            <Text style={styles.gameStatsScoreTeam} numberOfLines={1}>{event.homeTeam || 'Home'}</Text>
          </View>
        </View>
      )}

      {hasBoxData && isMlb && (
        <>
          <Text style={styles.detailSectionLabel}>Batting</Text>
          <BoxScoreTable title={event.awayTeam} labels={MLB_BATTING_LABELS} rows={mlbBattingRows(gameStats.mlbBoxscore.away.players)} />
          <BoxScoreTable title={event.homeTeam} labels={MLB_BATTING_LABELS} rows={mlbBattingRows(gameStats.mlbBoxscore.home.players)} />
          <Text style={styles.detailSectionLabel}>Pitching</Text>
          <BoxScoreTable title={event.awayTeam} labels={MLB_PITCHING_LABELS} rows={mlbPitchingRows(gameStats.mlbBoxscore.away.players)} />
          <BoxScoreTable title={event.homeTeam} labels={MLB_PITCHING_LABELS} rows={mlbPitchingRows(gameStats.mlbBoxscore.home.players)} />
        </>
      )}

      {hasBoxData && !isMlb && (
        <>
          {!!gameStats.fullTeamStats && (
            <View style={styles.detailCard}>
              <Text style={styles.detailSectionLabel}>Team Stats</Text>
              {zipTeamStats(gameStats.fullTeamStats.home, gameStats.fullTeamStats.away).map((s, i) => (
                <View key={i} style={styles.gameStatsStatRow}>
                  <Text style={styles.gameStatsStatValue}>{s.away}</Text>
                  <Text style={styles.gameStatsStatLabel}>{s.label}</Text>
                  <Text style={styles.gameStatsStatValue}>{s.home}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.detailSectionLabel}>{event.awayTeam}</Text>
          {gameStats.espnBoxscore.away.groups.map((g, i) => (
            <BoxScoreTable key={i} title={titleCase(g.name)} labels={g.labels} rows={g.athletes.map((a) => ({ name: a.name, tag: a.starter ? 'S' : null, values: a.stats }))} />
          ))}
          <Text style={styles.detailSectionLabel}>{event.homeTeam}</Text>
          {gameStats.espnBoxscore.home.groups.map((g, i) => (
            <BoxScoreTable key={i} title={titleCase(g.name)} labels={g.labels} rows={g.athletes.map((a) => ({ name: a.name, tag: a.starter ? 'S' : null, values: a.stats }))} />
          ))}
        </>
      )}
    </ScrollView>
  );
}
