import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { getTeamGameLog } from '../utils/teamStats';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';
import { VerifiedBadge } from './VerifiedBadge';
import { PlayerAttendanceStats } from './PlayerAttendanceStats';

const OUTCOME_META = {
  win:  { label: 'W', styleKey: 'gameLogBadgeWin' },
  loss: { label: 'L', styleKey: 'gameLogBadgeLoss' },
  tie:  { label: 'T', styleKey: 'gameLogBadgeTie' },
};

function outcomeMeta(outcome) {
  return OUTCOME_META[outcome] ?? { label: '?', styleKey: 'gameLogBadgeUnknown' };
}

export function TeamGameLogScreen({ league, team, events }) {
  const { styles } = useTheme();
  const games = useMemo(() => getTeamGameLog(events, league, team), [events, league, team]);

  return (
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailName}>{LEAGUE_ICONS[league]} {team}</Text>
      <Text style={styles.leagueDetailSubtitle}>{games.length} game{games.length === 1 ? '' : 's'} attended</Text>

      <PlayerAttendanceStats league={league} team={team} events={events} />

      {games.map((g) => {
        const meta = outcomeMeta(g.outcome);
        return (
          <View key={g.id} style={styles.gameLogCard}>
            <View style={[styles.gameLogBadge, styles[meta.styleKey]]}>
              <Text style={[styles.gameLogBadgeText, styles[`${meta.styleKey}Text`]]}>{meta.label}</Text>
            </View>
            <View style={styles.gameLogBody}>
              <Text style={styles.gameLogOpponent}>
                {g.isHome ? 'vs' : '@'} {g.opponent || 'Unknown opponent'}
              </Text>
              <Text style={styles.gameLogVenue}>{g.venue}</Text>
              <Text style={styles.gameLogDate}>{formatDisplayDate(g.date)}</Text>
              {g.verified && <VerifiedBadge />}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
