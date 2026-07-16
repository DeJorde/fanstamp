import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { getMlbPlayerAttendanceStats, getMlbStartingPitcherStats, getMlbCumulativePlayerStats } from '../utils/mlbPlayerStats';
import { getEspnPlayerHighlights } from '../utils/espnPlayerHighlights';
import { useTheme } from '../context/ThemeContext';
import { PlayerTrendLine } from './PlayerTrendLine';

const ARROW_META = {
  up:      { icon: '▲', styleKey: 'playerArrowUp' },
  down:    { icon: '▼', styleKey: 'playerArrowDown' },
  neutral: { icon: '–', styleKey: 'playerArrowNeutral' },
};

function PlayerStatCard({ styles, p, showArrow, showLuckyBadges }) {
  const arrow = showArrow ? ARROW_META[p.arrow] : null;
  return (
    <View style={styles.playerStatCard}>
      <View style={styles.playerStatTopRow}>
        <Text style={styles.playerStatName} numberOfLines={1}>{p.name}</Text>
        {!!p.position && <Text style={styles.playerStatPosition}>{p.position}</Text>}
        {arrow && (
          <View style={[styles.playerArrowPill, styles[arrow.styleKey]]}>
            <Text style={[styles.playerArrowText, styles[`${arrow.styleKey}Text`]]}>{arrow.icon}</Text>
          </View>
        )}
      </View>
      <Text style={styles.playerStatLine}>{p.line}</Text>
      {showLuckyBadges && (p.isLuckyPlayer || p.playsBetterWithYou) && (
        <View style={styles.playerStatBadgeRow}>
          {p.isLuckyPlayer && (
            <View style={[styles.teamCardLabelPill, styles.teamLabelLucky]}>
              <Text style={[styles.teamCardLabelText, styles.teamLabelLuckyText]}>Your Lucky Player ⭐</Text>
            </View>
          )}
          {p.playsBetterWithYou && !p.isLuckyPlayer && (
            <View style={[styles.teamCardLabelPill, styles.teamLabelLucky]}>
              <Text style={[styles.teamCardLabelText, styles.teamLabelLuckyText]}>Plays better with you there 🔥</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function CumulativePlayerCard({ styles, p }) {
  const isHot = p.trend === 'improving';
  return (
    <View style={styles.playerStatCard}>
      <View style={styles.playerStatTopRow}>
        <Text style={styles.playerStatName} numberOfLines={1}>{p.name}</Text>
        {!!p.position && <Text style={styles.playerStatPosition}>{p.position}</Text>}
      </View>
      <View style={styles.cumulativeStatRow}>
        <Text style={[styles.playerStatLine, styles.cumulativeStatLine]}>{p.line}</Text>
        <PlayerTrendLine values={p.trendSeries} color={isHot ? '#4ADE80' : '#999999'} />
      </View>
      <View style={styles.playerStatBadgeRow}>
        {isHot ? (
          <View style={[styles.teamCardLabelPill, styles.teamLabelHot]}>
            <Text style={[styles.teamCardLabelText, styles.teamLabelHotText]}>Getting Hot 📈</Text>
          </View>
        ) : (
          <View style={[styles.teamCardLabelPill, styles.teamLabelRegular]}>
            <Text style={[styles.teamCardLabelText, styles.teamLabelRegularText]}>Your Regular ⚾</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// MLB gets the full treatment (per-game batting/pitching aggregation vs.
// season average, up/down arrow, "Your Lucky Player", plus a dedicated
// starting-pitcher subsection). Other stadium-sports leagues get a lighter
// best-effort view built from ESPN's boxscore leaders (no season-average
// comparison available there without materially more API calls) — see
// utils/espnPlayerHighlights.js.
export function PlayerAttendanceStats({ league, team, events }) {
  const { styles } = useTheme();
  const isMlb = league === 'MLB';

  const mlbBatters = useMemo(
    () => (isMlb ? getMlbPlayerAttendanceStats(events, team) : []),
    [events, team, isMlb]
  );
  const mlbPitchers = useMemo(
    () => (isMlb ? getMlbStartingPitcherStats(events, team) : []),
    [events, team, isMlb]
  );
  const mlbCumulative = useMemo(
    () => (isMlb ? getMlbCumulativePlayerStats(events, team) : []),
    [events, team, isMlb]
  );
  const espnPlayers = useMemo(
    () => (isMlb ? [] : getEspnPlayerHighlights(events, league, team)),
    [events, league, team, isMlb]
  );

  const players = isMlb ? mlbBatters : espnPlayers;
  if (players.length === 0 && mlbPitchers.length === 0 && mlbCumulative.length === 0) return null;

  return (
    <View style={styles.playerStatsSection}>
      {isMlb && mlbCumulative.length > 0 && (
        <>
          <Text style={styles.badgeGroupLabel}>PLAYERS YOU SEE A LOT</Text>
          {mlbCumulative.map((p) => (
            <CumulativePlayerCard key={p.personId} styles={styles} p={p} />
          ))}
        </>
      )}
      {players.length > 0 && (
        <>
          <Text style={styles.badgeGroupLabel}>MY PLAYER STATS</Text>
          {players.map((p) => (
            <PlayerStatCard key={p.personId ?? p.name} styles={styles} p={p} showArrow={isMlb} showLuckyBadges={isMlb} />
          ))}
        </>
      )}
      {isMlb && mlbPitchers.length > 0 && (
        <>
          <Text style={styles.badgeGroupLabel}>STARTING PITCHERS</Text>
          {mlbPitchers.map((p) => (
            <PlayerStatCard key={p.personId} styles={styles} p={p} showArrow showLuckyBadges={false} />
          ))}
        </>
      )}
    </View>
  );
}
