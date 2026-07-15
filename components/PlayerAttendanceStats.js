import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { getMlbPlayerAttendanceStats } from '../utils/mlbPlayerStats';
import { getEspnPlayerHighlights } from '../utils/espnPlayerHighlights';
import { useTheme } from '../context/ThemeContext';

const ARROW_META = {
  up:      { icon: '▲', styleKey: 'playerArrowUp' },
  down:    { icon: '▼', styleKey: 'playerArrowDown' },
  neutral: { icon: '–', styleKey: 'playerArrowNeutral' },
};

// MLB gets the full treatment (per-game batting/pitching aggregation vs.
// season average, up/down arrow, "Your Lucky Player"). Other stadium-sports
// leagues get a lighter best-effort view built from ESPN's boxscore leaders
// (no season-average comparison available there without materially more API
// calls) — see utils/espnPlayerHighlights.js.
export function PlayerAttendanceStats({ league, team, events }) {
  const { styles } = useTheme();
  const isMlb = league === 'MLB';

  const mlbPlayers = useMemo(
    () => (isMlb ? getMlbPlayerAttendanceStats(events, team) : []),
    [events, team, isMlb]
  );
  const espnPlayers = useMemo(
    () => (isMlb ? [] : getEspnPlayerHighlights(events, league, team)),
    [events, league, team, isMlb]
  );

  const players = isMlb ? mlbPlayers : espnPlayers;
  if (players.length === 0) return null;

  return (
    <View style={styles.playerStatsSection}>
      <Text style={styles.badgeGroupLabel}>MY PLAYER STATS</Text>
      {players.map((p) => {
        const arrow = isMlb ? ARROW_META[p.arrow] : null;
        return (
          <View key={p.personId ?? p.name} style={styles.playerStatCard}>
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
            {isMlb && (p.isLuckyPlayer || p.playsBetterWithYou) && (
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
      })}
    </View>
  );
}
