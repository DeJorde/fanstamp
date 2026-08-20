import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const METRICS = [
  { key: 'totalEvents',   label: 'Total Events',   icon: '🎟' },
  { key: 'uniqueVenues',  label: 'Unique Venues',  icon: '🏟' },
  { key: 'citiesVisited', label: 'Cities Visited', icon: '🏙' },
  { key: 'yearsActive',   label: 'Years Active',   icon: '📅' },
];

// Branded card captured for the stats share image (see utils/shareImage
// and StatsScreen's handleShareOverview) — rendered off-screen at a fixed
// size so the shared PNG is a consistent, social-ready layout regardless
// of the on-screen scroll position or device width.
export const ShareStatsCard = forwardRef(function ShareStatsCard({ stats }, ref) {
  const { styles, retro } = useTheme();
  return (
    <View ref={ref} collapsable={false} style={styles.shareCard}>
      <View style={[styles.shareCardStamp, retro && styles.shareCardStampRetro]}>
        <View style={styles.shareCardStampInner}>
          <Text style={styles.shareCardStampText} numberOfLines={1}>FANSTAMP</Text>
        </View>
      </View>

      <Text style={styles.shareCardTitle}>My FanStamp Stats</Text>

      <View style={styles.shareCardGrid}>
        {METRICS.map((m) => (
          <View key={m.key} style={styles.shareCardMetric}>
            <Text style={styles.shareCardMetricIcon}>{m.icon}</Text>
            <Text style={styles.shareCardMetricValue}>{stats[m.key]}</Text>
            <Text style={styles.shareCardMetricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.shareCardTagline}>Track your live event journey at FanStamp</Text>
    </View>
  );
});
