import { useMemo } from 'react';
import { Alert, Image, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { getLeagueDetail } from '../utils/badges';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';
import { VerifiedBadge } from './VerifiedBadge';

export function LeagueDetailScreen({ league, events, bucketList, onToggleBucketList }) {
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

  function isBucketListed(team) {
    return bucketList.some((b) => b.league === league && b.team === team);
  }

  function handleToVisitPress(t) {
    const listed = isBucketListed(t.team);
    Alert.alert(t.stadium, t.team, [
      {
        text: listed ? 'Remove from Bucket List 🎯' : 'Add to Bucket List 🎯',
        onPress: () => onToggleBucketList(league, t.team, t.stadium, t.city),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleShare() {
    const pct = teams.length > 0 ? Math.round((visited.length / teams.length) * 100) : 0;
    const stadiumLines = visited.map(
      (t) => `🏟 ${t.stadium} — ${t.dates.length > 0 ? t.dates.map(formatDisplayDate).join(', ') : 'date unknown'}`
    );
    const message = [
      `${LEAGUE_ICONS[league]} ${league} Stadium Passport`,
      `${visited.length}/${teams.length} stadiums visited (${pct}%)`,
      '',
      ...(stadiumLines.length > 0 ? stadiumLines : ['No stadiums visited yet — time to start!']),
      '',
      'Tracked with StadiumLog',
    ].join('\n');

    try {
      await Share.share({ message, title: `${league} Stadium Passport` });
    } catch {
      Alert.alert('Share Failed', 'Could not open the share sheet. Please try again.');
    }
  }

  return (
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <View style={styles.leagueDetailHeaderRow}>
        <Text style={styles.detailName}>{LEAGUE_ICONS[league]} {league}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
          <Text style={styles.shareBtnIcon}>📤</Text>
        </TouchableOpacity>
      </View>
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
                <View style={styles.badgeRow}>
                  {t.verified && <VerifiedBadge />}
                  <View style={styles.statsCountPill}>
                    <Text style={styles.statsCountPillText}>{t.visitCount}×</Text>
                  </View>
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
        <TouchableOpacity
          key={t.team}
          style={[styles.leagueTeamCard, styles.leagueTeamCardLocked]}
          onPress={() => handleToVisitPress(t)}
          activeOpacity={0.7}
        >
          <View style={styles.leagueTeamBody}>
            <View style={styles.leagueTeamHeader}>
              <Text style={styles.leagueTeamStadium}>{t.stadium}</Text>
              {isBucketListed(t.team) && (
                <View style={styles.bucketBadge}>
                  <Text style={styles.bucketBadgeText}>🎯</Text>
                </View>
              )}
            </View>
            <Text style={styles.leagueTeamName}>{t.team}</Text>
            <Text style={styles.leagueTeamCity}>{t.city}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
