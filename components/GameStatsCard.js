import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const EMPTY_TEXT = {
  scheduled: "Game hasn't been played yet",
  not_found: 'No game stats found for this event',
  error: "Couldn't load game stats",
};

export function GameStatsCard({ event, onRetry }) {
  const { styles, colors } = useTheme();
  const gameStats = event.gameStats;
  if (!gameStats) return null;

  if (gameStats.status === 'loading') {
    return (
      <View style={styles.detailCard}>
        <View style={styles.gameStatsLoadingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.gameStatsLoadingText}>Fetching game stats...</Text>
        </View>
      </View>
    );
  }

  if (gameStats.status !== 'found') {
    return (
      <View style={styles.detailCard}>
        <Text style={styles.gameStatsEmptyText}>{EMPTY_TEXT[gameStats.status] ?? EMPTY_TEXT.not_found}</Text>
        <TouchableOpacity onPress={() => onRetry(event)} activeOpacity={0.7}>
          <Text style={styles.gameStatsRetryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailSectionLabel}>Game Stats</Text>
      <View style={styles.gameStatsScoreRow}>
        <Text style={styles.gameStatsScoreTeam} numberOfLines={1}>{event.awayTeam || 'Away'}</Text>
        <Text style={styles.gameStatsScoreValue}>{gameStats.finalScore.away} – {gameStats.finalScore.home}</Text>
        <Text style={styles.gameStatsScoreTeam} numberOfLines={1}>{event.homeTeam || 'Home'}</Text>
      </View>
      {(gameStats.keyStats ?? []).map((s, i) => (
        <View key={i} style={styles.gameStatsStatRow}>
          <Text style={styles.gameStatsStatValue}>{s.away}</Text>
          <Text style={styles.gameStatsStatLabel}>{s.label}</Text>
          <Text style={styles.gameStatsStatValue}>{s.home}</Text>
        </View>
      ))}
    </View>
  );
}
