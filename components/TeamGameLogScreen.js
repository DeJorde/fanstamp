import { useMemo } from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { getTeamGameLog } from '../utils/teamStats';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';
import { VerifiedBadge } from './VerifiedBadge';
import { PlayerAttendanceStats } from './PlayerAttendanceStats';

const PARCHMENT_BG = require('../assets/parchment.png');

const OUTCOME_META = {
  win:  { label: 'W', styleKey: 'gameLogBadgeWin' },
  loss: { label: 'L', styleKey: 'gameLogBadgeLoss' },
  tie:  { label: 'T', styleKey: 'gameLogBadgeTie' },
};

function outcomeMeta(outcome) {
  return OUTCOME_META[outcome] ?? { label: '?', styleKey: 'gameLogBadgeUnknown' };
}

export function TeamGameLogScreen({ league, team, events, onSelectGame, onSelectFullStats }) {
  const { styles, retro } = useTheme();
  const games = useMemo(() => getTeamGameLog(events, league, team), [events, league, team]);

  const Root = retro ? ImageBackground : View;
  const rootProps = retro ? { source: PARCHMENT_BG, resizeMode: 'cover', style: { flex: 1 } } : { style: { flex: 1 } };

  return (
    <Root {...rootProps}>
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailName}>{LEAGUE_ICONS[league]} {team}</Text>
      <Text style={styles.leagueDetailSubtitle}>{games.length} game{games.length === 1 ? '' : 's'} attended</Text>

      <TouchableOpacity style={styles.fullTeamStatsBtn} onPress={onSelectFullStats} activeOpacity={0.8}>
        <Text style={styles.fullTeamStatsBtnText}>📊 Full Team Stats</Text>
      </TouchableOpacity>

      <PlayerAttendanceStats league={league} team={team} events={events} />

      {games.map((g) => {
        const meta = outcomeMeta(g.outcome);
        return (
          <TouchableOpacity
            key={g.id}
            style={styles.gameLogCard}
            onPress={() => onSelectGame(g.raw)}
            activeOpacity={0.7}
          >
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
            <Text style={styles.gameLogChevron}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    </Root>
  );
}
