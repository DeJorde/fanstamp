import { Text, TouchableOpacity, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { useTheme } from '../context/ThemeContext';

const LABEL_STYLE_KEY = {
  lucky:     'teamLabelLucky',
  balanced:  'teamLabelBalanced',
  jinx:      'teamLabelJinx',
  undecided: 'teamLabelUndecided',
};

export function TeamCard({ team, isFavorite, onPress, onToggleFavorite }) {
  const { styles } = useTheme();
  const labelKey = LABEL_STYLE_KEY[team.label.key];
  const record = `${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}`;

  return (
    <TouchableOpacity
      style={[styles.teamCard, isFavorite && styles.teamCardFavorite]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.teamCardTopRow}>
        <View style={styles.teamCardBadgeRow}>
          <Text style={styles.teamCardLeagueBadge}>{LEAGUE_ICONS[team.league]} {team.league}</Text>
          {isFavorite && <Text style={styles.teamCardFavoritePill}>⭐ Favorite</Text>}
        </View>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.teamCardStarBtn}>{isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.teamCardName, isFavorite && styles.teamCardNameLarge]}>{team.team}</Text>

      <View style={styles.teamCardStatsRow}>
        <View style={styles.teamCardStat}>
          <Text style={styles.teamCardStatValue}>{team.gamesAttended}</Text>
          <Text style={styles.teamCardStatLabel}>Games</Text>
        </View>
        <View style={styles.teamCardStat}>
          <Text style={styles.teamCardStatValue}>{record}</Text>
          <Text style={styles.teamCardStatLabel}>Record</Text>
        </View>
        <View style={styles.teamCardStat}>
          <Text style={styles.teamCardStatValue}>{team.winPct === null ? '—' : `${Math.round(team.winPct * 100)}%`}</Text>
          <Text style={styles.teamCardStatLabel}>Win %</Text>
        </View>
      </View>

      <View style={[styles.teamCardLabelPill, styles[labelKey]]}>
        <Text style={[styles.teamCardLabelText, styles[`${labelKey}Text`]]}>
          {team.label.icon} {team.label.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
