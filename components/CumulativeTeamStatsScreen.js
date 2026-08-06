import { ImageBackground, ScrollView, Text, View } from 'react-native';
import { getMlbCumulativeTeamBattingStats, getMlbCumulativeTeamPitchingStats } from '../utils/mlbPlayerStats';
import { getEspnCumulativeTeamLeaders } from '../utils/espnPlayerHighlights';
import { getTeamGameLog } from '../utils/teamStats';
import { useTheme } from '../context/ThemeContext';
import { StickyStatTable } from './StickyStatTable';

const PARCHMENT_BG = require('../assets/parchment.png');

const BATTING_LABELS  = ['G', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'BB', 'K', 'AVG', 'OBP', 'SLG'];
const PITCHING_LABELS = ['G', 'GS', 'IP', 'H', 'R', 'ER', 'BB', 'K', 'ERA', 'WHIP'];

function battingRow(p) {
  return {
    id: p.personId, name: p.name, subtext: p.position,
    values: [p.games, p.ab, p.r, p.h, p.doubles, p.triples, p.hr, p.rbi, p.bb, p.so, p.avg, p.obp, p.slg],
  };
}
function pitchingRow(p) {
  return { id: p.personId, name: p.name, values: [p.games, p.gs, p.ip, p.h, p.r, p.er, p.bb, p.so, p.era, p.whip] };
}

// "Full Team Stats" — aggregated across every attended game for this team,
// not just the top-5 sample shown in Team Game Log's "My Player Stats".
// MLB gets a full box-score-reference-style roster (every batter/pitcher who
// appeared); other stadium-sports leagues get the lighter ESPN-leaders-based
// "top performer per category" view, same treatment split as
// PlayerAttendanceStats.js.
export function CumulativeTeamStatsScreen({ league, team, events }) {
  const { styles, retro } = useTheme();
  const isMlb = league === 'MLB';
  const gamesAttended = getTeamGameLog(events, league, team).length;

  const battingStats = isMlb ? getMlbCumulativeTeamBattingStats(events, team) : [];
  const pitchingStats = isMlb ? getMlbCumulativeTeamPitchingStats(events, team) : [];
  const luckyId = battingStats.find((p) => p.isLucky)?.personId ?? null;
  const leaders = isMlb ? [] : getEspnCumulativeTeamLeaders(events, league, team);

  const Root = retro ? ImageBackground : View;
  const rootProps = retro ? { source: PARCHMENT_BG, resizeMode: 'cover', style: { flex: 1 } } : { style: { flex: 1 } };

  return (
    <Root {...rootProps}>
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.detailName}>Full Team Stats</Text>
      <Text style={styles.leagueDetailSubtitle}>
        {team} · {gamesAttended} game{gamesAttended === 1 ? '' : 's'} attended
      </Text>

      {isMlb ? (
        <>
          <StickyStatTable title="Batting" labels={BATTING_LABELS} rows={battingStats.map(battingRow)} highlightId={luckyId} />
          <StickyStatTable title="Pitching" labels={PITCHING_LABELS} rows={pitchingStats.map(pitchingRow)} />
        </>
      ) : (
        <View style={styles.playerStatsSection}>
          <Text style={styles.badgeGroupLabel}>CATEGORY LEADERS</Text>
          {leaders.length === 0 && <Text style={styles.gameStatsEmptyText}>No stats available yet.</Text>}
          {leaders.map((l, i) => (
            <View key={i} style={styles.playerStatCard}>
              <View style={styles.playerStatTopRow}>
                <Text style={styles.playerStatName} numberOfLines={1}>{l.name}</Text>
              </View>
              <Text style={styles.playerStatLine}>
                {l.category}: {l.displayValue}{l.gamesLed > 1 ? ` (led ${l.gamesLed}x)` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    </Root>
  );
}
