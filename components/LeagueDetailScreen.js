import { useMemo } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { getLeagueDetail } from '../utils/badges';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';

export function LeagueDetailScreen({ league, events }) {
  const { styles } = useTheme();
  const teams = useMemo(() => getLeagueDetail(events, league), [events, league]);
  const visited = useMemo(
    () => teams.filter((t) => t.visited).sort((a, b) => a.team.localeCompare(b.team)),
    [teams]
  );
  const toVisit = useMemo(
    () => teams.filter((t) => !t.visited).sort((a, b) => a.team.localeCompare(b.team)),
    [teams]
  );

  return (
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailName}>{LEAGUE_ICONS[league]} {league}</Text>
      <Text style={styles.leagueDetailSubtitle}>{league} — {visited.length} of {teams.length} stadiums</Text>

      <Text style={styles.badgeGroupLabel}>VISITED ({visited.length})</Text>
      {visited.length === 0 ? (
        <Text style={styles.statsEmptyInCard}>No {league} stadiums visited yet</Text>
      ) : (
        visited.map((t) => (
          <View key={t.team} style={styles.leagueTeamCard}>
            {t.photo ? (
              <Image source={{ uri: t.photo }} style={styles.leagueTeamThumb} resizeMode="cover" />
            ) : (
              <View style={styles.leagueTeamThumbPlaceholder}>
                <Text style={styles.leagueTeamThumbEmoji}>🏟️</Text>
                <Text style={styles.leagueTeamThumbName} numberOfLines={2}>{t.team}</Text>
              </View>
            )}
            <View style={styles.leagueTeamBody}>
              <View style={styles.leagueTeamHeader}>
                <Text style={styles.leagueTeamStadium}>{t.stadium}</Text>
                <View style={styles.statsCountPill}>
                  <Text style={styles.statsCountPillText}>{t.visitCount}×</Text>
                </View>
              </View>
              <Text style={styles.leagueTeamName}>{t.team}</Text>
              <Text style={styles.leagueTeamCity}>{t.city}</Text>
              <View style={styles.leagueDateChipRow}>
                {t.dates.map((d, i) => (
                  <View key={i} style={styles.leagueDateChip}>
                    <Text style={styles.leagueDateChipText}>{formatDisplayDate(d)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))
      )}

      <Text style={styles.badgeGroupLabel}>TO VISIT ({toVisit.length})</Text>
      {toVisit.map((t) => (
        <View key={t.team} style={[styles.leagueTeamCard, styles.leagueTeamCardLocked]}>
          <View style={styles.leagueTeamBody}>
            <Text style={styles.leagueTeamStadium}>{t.stadium}</Text>
            <Text style={styles.leagueTeamName}>{t.team}</Text>
            <Text style={styles.leagueTeamCity}>{t.city}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
