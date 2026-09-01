import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { ReviewCardShell } from './ReviewCardShell';
import { NewVenuesSection } from './NewVenuesSection';
import { useTheme } from '../context/ThemeContext';

// Concert Review and Comedy Review are the same layout over the same shape
// (utils/actReview.js) — only the nouns differ, so one component covers both
// rather than two near-identical files.
export const ACT_REVIEW_CONFIG = {
  Concert: { eyebrow: 'CONCERT REVIEW', unit: 'Concerts', actNoun: 'Artists', emoji: '🎵' },
  Comedy:  { eyebrow: 'COMEDY REVIEW',  unit: 'Shows',     actNoun: 'Comedians', emoji: '🎤' },
};

function ActsList({ acts, actNoun }) {
  const { styles } = useTheme();
  if (acts.length === 0) return null;
  return (
    <View style={styles.yrSectionBlock}>
      <Text style={styles.yrSectionLabel}>{actNoun.toUpperCase()} SEEN</Text>
      <View style={styles.yrCatList}>
        {acts.map((act) => (
          <View key={act.name} style={styles.rvActRow}>
            <View style={styles.rvActHeaderRow}>
              <Text style={styles.rvActName} numberOfLines={1}>{act.name}</Text>
              {act.count > 1 && <Text style={styles.rvActCount}>×{act.count}</Text>}
            </View>
            {act.appearances.map((a, i) => (
              <Text key={a.id ?? i} style={styles.rvActAppearance} numberOfLines={1}>
                {a.venue}{a.dateDisplay !== '—' ? ` · ${a.dateDisplay}` : ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function VenuesList({ venues }) {
  const { styles } = useTheme();
  if (venues.length === 0) return null;
  return (
    <View style={styles.yrSectionBlock}>
      <Text style={styles.yrSectionLabel}>VENUES</Text>
      <View style={styles.yrCatList}>
        {venues.map((v) => (
          <View key={v.name} style={styles.rvVenueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rvVenueName} numberOfLines={1}>{v.name}</Text>
              {!!v.city && <Text style={styles.rvVenueCity} numberOfLines={1}>{v.city}</Text>}
            </View>
            <Text style={styles.rvVenueCount}>{v.count}×</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Captured for sharing — see components/ReviewModal + utils/actReview.
// `periodLabel` (e.g. "2026", "Last 12 Months") comes from the active
// FilterBar selection — annotated on the card itself (not just the modal
// title) since captureRef only captures this card, not the modal chrome
// around it. Null when the filter is "All Time".
export const ActReviewCard = forwardRef(function ActReviewCard({ review, config, periodLabel }, ref) {
  const { styles } = useTheme();
  const { icon, total, uniqueActs, uniqueVenues, uniqueCities, acts, venues, newVenues, mostActiveMonth, topGenre } = review;

  return (
    <ReviewCardShell ref={ref}>
      <Text style={styles.yrEyebrow}>{config.eyebrow}{periodLabel ? ` · ${periodLabel.toUpperCase()}` : ''}</Text>
      <Text style={styles.yrYear}>{icon}</Text>

      <View style={styles.yrStatRow}>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{total}</Text>
          <Text style={styles.yrStatLabel}>{config.unit}</Text>
        </View>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{uniqueActs}</Text>
          <Text style={styles.yrStatLabel}>{config.actNoun}</Text>
        </View>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{uniqueVenues}</Text>
          <Text style={styles.yrStatLabel}>Venues</Text>
        </View>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{uniqueCities}</Text>
          <Text style={styles.yrStatLabel}>Cities</Text>
        </View>
      </View>

      {(mostActiveMonth || topGenre) && (
        <View style={styles.rvPillRow}>
          {mostActiveMonth && (
            <View style={styles.yrPill}>
              <Text style={styles.yrPillText}>📅 Big month: {mostActiveMonth.name} ({mostActiveMonth.count})</Text>
            </View>
          )}
          {topGenre && (
            <View style={styles.yrPill}>
              <Text style={styles.yrPillText}>🎧 Top genre: {topGenre.name} ({topGenre.count})</Text>
            </View>
          )}
        </View>
      )}

      <ActsList acts={acts} actNoun={config.actNoun} />
      <VenuesList venues={venues} />
      <NewVenuesSection newVenues={newVenues} />

      <Text style={styles.yrTagline}>Track your journey at FanStamp</Text>
    </ReviewCardShell>
  );
});
