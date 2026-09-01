import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { ReviewCardShell } from './ReviewCardShell';
import { CategoryBreakdown } from './YearInReviewCard';
import { useTheme } from '../context/ThemeContext';

function Timeline({ timeline, maxYearCount }) {
  const { styles } = useTheme();
  return (
    <View style={styles.yrCatList}>
      {timeline.map(({ year, count }) => (
        <View key={year} style={styles.rvTimelineRow}>
          <Text style={styles.rvTimelineYear}>{year}</Text>
          <View style={styles.rvTimelineBarWrap}>
            <View style={[styles.rvTimelineBar, { width: `${Math.round((count / maxYearCount) * 100)}%` }]} />
          </View>
          <Text style={styles.rvTimelineCount}>{count}</Text>
        </View>
      ))}
    </View>
  );
}

// Captured for sharing — see components/ReviewModal + utils/allEventsReview.
// `periodLabel` (e.g. "2026", "Last 12 Months") comes from the active
// FilterBar selection — annotated on the card itself (not just the modal
// title) since captureRef only captures this card, not the modal chrome
// around it. Null when the filter is "All Time".
export const AllEventsReviewCard = forwardRef(function AllEventsReviewCard({ review, periodLabel }, ref) {
  const { styles } = useTheme();
  const {
    totalEvents, uniqueVenues, uniqueCities, statesVisited, yearsActive,
    topCategory, categoryBreakdown, timeline, maxYearCount,
  } = review;

  return (
    <ReviewCardShell ref={ref}>
      <Text style={styles.yrEyebrow}>ALL EVENTS REVIEW{periodLabel ? ` · ${periodLabel.toUpperCase()}` : ''}</Text>
      <Text style={styles.yrYear}>🎟</Text>

      <View style={styles.yrStatRow}>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{totalEvents}</Text>
          <Text style={styles.yrStatLabel}>Events</Text>
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

      <View style={styles.yrStatRow}>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{statesVisited}</Text>
          <Text style={styles.yrStatLabel}>States</Text>
        </View>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{yearsActive}</Text>
          <Text style={styles.yrStatLabel}>Years Active</Text>
        </View>
      </View>

      {topCategory && (
        <View style={styles.yrPill}>
          <Text style={styles.yrPillText}>{topCategory.icon} Top category: {topCategory.name} ({topCategory.count})</Text>
        </View>
      )}

      {categoryBreakdown.length > 0 && (
        <View style={styles.yrSectionBlock}>
          <Text style={styles.yrSectionLabel}>EVENTS BREAKDOWN</Text>
          <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
        </View>
      )}

      {timeline.length > 0 && (
        <View style={styles.yrSectionBlock}>
          <Text style={styles.yrSectionLabel}>THE JOURNEY, YEAR BY YEAR</Text>
          <Timeline timeline={timeline} maxYearCount={maxYearCount} />
        </View>
      )}

      <Text style={styles.yrTagline}>Track your journey at FanStamp</Text>
    </ReviewCardShell>
  );
});
