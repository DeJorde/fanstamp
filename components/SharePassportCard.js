import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { useTheme } from '../context/ThemeContext';
import { ProgressRing } from './ProgressRing';

// Rendered off-screen and captured with react-native-view-shot to produce the
// share image — see handleShare in LeagueDetailScreen. `collapsable={false}`
// on the root View keeps Android from optimizing it out of the native tree,
// which would otherwise make the capture blank.
export const SharePassportCard = forwardRef(function SharePassportCard({ league, visited, total }, ref) {
  const { styles, colors } = useTheme();
  const pct = total > 0 ? visited.length / total : 0;
  const complete = visited.length >= total && total > 0;

  return (
    <View ref={ref} collapsable={false} style={styles.shareCard}>
      <ProgressRing
        size={80}
        strokeWidth={7}
        progress={pct}
        color={complete ? '#FFD700' : colors.accent}
        trackColor={colors.trackBg}
      >
        <Text style={styles.shareCardRingEmoji}>{complete ? '🏆' : LEAGUE_ICONS[league]}</Text>
      </ProgressRing>
      <Text style={styles.shareCardTitle}>{LEAGUE_ICONS[league]} {league} Stadium Passport</Text>
      <Text style={styles.shareCardFraction}>
        I've visited {visited.length}/{total} {league} stadiums! 🏟
      </Text>

      {visited.length > 0 && (
        <View style={styles.shareCardListWrap}>
          {visited.map((t) => (
            <Text key={t.team} style={styles.shareCardStadium} numberOfLines={1}>🏟 {t.stadium}</Text>
          ))}
        </View>
      )}

      <Text style={styles.shareCardFooter}>Tracked with StadiumLog</Text>
    </View>
  );
});
