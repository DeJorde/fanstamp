import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAP_STYLES } from '../constants';
import { computeRegion } from '../utils/geo';
import { useTheme } from '../context/ThemeContext';

const METRICS = [
  { key: 'totalEvents',      label: 'Total Events',   icon: '🎟' },
  { key: 'uniqueVenues',     label: 'Unique Venues',  icon: '🏟' },
  { key: 'statesVisited',    label: 'States',         icon: '🗺' },
  { key: 'yearsActive',      label: 'Years Active',   icon: '📅' },
];

// Plain pinColor Markers, not the custom emoji/classic pins MapScreen uses —
// a native pinColor marker has no JS-rendered bitmap to snapshot, so it
// can't hit the tracksViewChanges blank-marker race MapScreen had to work
// around. This map is captured once as part of a static share image, so
// simplicity buys reliability here.
function MiniMap({ venueMarkers, retro }) {
  const { styles } = useTheme();
  return (
    <View style={styles.richShareMapWrap}>
      <MapView
        style={styles.richShareMapInner}
        provider={PROVIDER_GOOGLE}
        region={computeRegion(venueMarkers)}
        customMapStyle={(retro ? MAP_STYLES.retro : MAP_STYLES.standard).json}
        pointerEvents="none"
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        liteMode={false}
      >
        {venueMarkers.map((m) => (
          <Marker
            key={m.key}
            coordinate={{ latitude: m.coordinates.lat, longitude: m.coordinates.lng }}
            pinColor={retro ? '#8B4513' : '#3a86ff'}
          />
        ))}
      </MapView>
    </View>
  );
}

// Branded, fully-designed share card captured for the Stats tab's share
// button (see StatsScreen's handleShareOverview) — rendered off-screen at a
// fixed size so the shared PNG is a consistent, social-ready layout
// regardless of scroll position or device width. Replaces the old bare
// metrics-grid ShareStatsCard with a mini map, top venues, and (when the
// user has MLB data) a Lucky Player callout.
export const RichShareCard = forwardRef(function RichShareCard(
  { user, stats, venueMarkers, luckyPlayer },
  ref
) {
  const { styles, retro } = useTheme();
  const hasMap = venueMarkers.length > 0;
  const name = user?.displayName || user?.email || null;

  return (
    <View ref={ref} collapsable={false} style={styles.shareCard}>
      <View style={[styles.shareCardStamp, retro && styles.shareCardStampRetro]}>
        <View style={styles.shareCardStampInner}>
          <Text style={styles.shareCardStampText} numberOfLines={1}>FANSTAMP</Text>
        </View>
      </View>

      <Text style={styles.shareCardTitle}>My FanStamp Journey</Text>
      {!!name && <Text style={styles.richShareUserName} numberOfLines={1}>{name}</Text>}

      {hasMap && <MiniMap venueMarkers={venueMarkers} retro={retro} />}

      <View style={styles.shareCardGrid}>
        {METRICS.map((m) => (
          <View key={m.key} style={styles.shareCardMetric}>
            <Text style={styles.shareCardMetricIcon}>{m.icon}</Text>
            <Text style={styles.shareCardMetricValue}>{stats[m.key]}</Text>
            <Text style={styles.shareCardMetricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {stats.topVenues.length > 0 && (
        <View style={styles.richShareBlock}>
          <Text style={styles.richShareSectionLabel}>TOP VENUES</Text>
          {stats.topVenues.slice(0, 3).map((v, i) => (
            <View key={v.name} style={styles.richShareVenueRow}>
              <Text style={styles.richShareVenueRank}>{i + 1}</Text>
              <Text style={styles.richShareVenueName} numberOfLines={1}>{v.name}</Text>
              <Text style={styles.richShareVenueCount}>{v.count}×</Text>
            </View>
          ))}
        </View>
      )}

      {luckyPlayer && (
        <View style={[styles.richShareBlock, styles.richShareLuckyBlock]}>
          <Text style={styles.richShareSectionLabel}>YOUR LUCKY PLAYER ⭐</Text>
          <Text style={styles.richShareLuckyName} numberOfLines={1}>
            {luckyPlayer.name} · {luckyPlayer.team}
          </Text>
          <Text style={styles.richShareLuckyLine} numberOfLines={1}>{luckyPlayer.line}</Text>
        </View>
      )}

      <Text style={styles.shareCardTagline}>Track your journey at FanStamp</Text>
    </View>
  );
});
