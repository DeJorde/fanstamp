import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { ReviewCardShell } from './ReviewCardShell';
import { useTheme } from '../context/ThemeContext';

// Concert Review and Comedy Review are the same layout over the same shape
// (utils/actReview.js) — only the nouns differ, so one component covers both
// rather than two near-identical files.
export const ACT_REVIEW_CONFIG = {
  Concert: { title: 'CONCERT REVIEW', unit: 'Concerts', actNoun: 'Artists', shareCaption: 'My Concert Review 🎵 #FanStamp' },
  Comedy:  { title: 'COMEDY REVIEW',  unit: 'Shows',     actNoun: 'Comedians', shareCaption: 'My Comedy Review 🎤 #FanStamp' },
};

// Captured for sharing — see components/ReviewModal + utils/actReview.
export const ActReviewCard = forwardRef(function ActReviewCard({ review, config }, ref) {
  const { styles } = useTheme();
  const { icon, total, uniqueActs, uniqueVenues, uniqueCities, mostActiveMonth, topGenre } = review;

  return (
    <ReviewCardShell ref={ref}>
      <Text style={styles.yrEyebrow}>{config.title}</Text>
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

      <Text style={styles.yrTagline}>Track your journey at FanStamp</Text>
    </ReviewCardShell>
  );
});
