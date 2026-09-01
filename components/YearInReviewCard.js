import { forwardRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_COLORS } from '../constants';
import { useTheme } from '../context/ThemeContext';

// In standard mode this is a bold, fixed gradient — a Spotify-Wrapped-style
// keepsake with its own signature look, independent of the app's own dark
// theme (the same reasoning ShareStatsCard/RichShareCard apply to their own
// fixed backgrounds). Retro mode instead reuses the app's own parchment
// texture and sepia-ink styling (see styles.js's yr* definitions), so it
// reads as a page from an old journal or explorer's logbook rather than a
// standalone "wrapped" graphic.
const GRADIENT_COLORS = ['#0f0026', '#3d0a6b', '#c2185b'];
const PARCHMENT_BG = require('../assets/parchment.png');

// Exported for reuse by AllEventsReviewCard, which needs the same
// icon-badge + count row for its own (all-time) category breakdown.
export function CategoryBreakdown({ categoryBreakdown }) {
  const { styles } = useTheme();
  return (
    <View style={styles.yrCatList}>
      {categoryBreakdown.map(({ category, count, icon, unitLabel }) => {
        const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
        return (
          <View key={category} style={styles.yrCatRow}>
            <View style={[styles.yrCatBadge, { backgroundColor: colors.bg, borderColor: colors.text }]}>
              <Text style={styles.yrCatBadgeIcon}>{icon}</Text>
            </View>
            <Text style={styles.yrCatText} numberOfLines={1}>
              {category} · {count} {unitLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function MonthBars({ monthlyBreakdown, maxMonthCount }) {
  const { styles } = useTheme();
  return (
    <View style={styles.yrMonthGrid}>
      {monthlyBreakdown.map(({ name, count }) => (
        <View key={name} style={styles.yrMonthCell}>
          <View style={styles.yrMonthBarWrap}>
            <View
              style={[
                styles.yrMonthBar,
                { height: count > 0 ? Math.max(4, Math.round((count / maxMonthCount) * 48)) : 0 },
              ]}
            />
          </View>
          <Text style={styles.yrMonthLabel}>{name[0]}</Text>
        </View>
      ))}
    </View>
  );
}

// Captured for the "Year in Review" share (see YearInReviewModal) — rendered
// at a fixed size so the shared PNG stays consistent regardless of screen
// size or scroll position, the same convention as RichShareCard/ShareStatsCard.
export const YearInReviewCard = forwardRef(function YearInReviewCard({ review }, ref) {
  const { styles, retro } = useTheme();
  const { year, totalEvents, uniqueVenues, uniqueCities, topCategory, categoryBreakdown, monthlyBreakdown, maxMonthCount, milestonesUnlocked } = review;

  return (
    <View ref={ref} collapsable={false} style={styles.yrCard}>
      {retro ? (
        <ImageBackground source={PARCHMENT_BG} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient colors={GRADIENT_COLORS} style={StyleSheet.absoluteFill} />
      )}

      <View style={styles.yrContent}>
        {retro && (
          <View style={[styles.shareCardStamp, styles.shareCardStampRetro]}>
            <View style={styles.shareCardStampInner}>
              <Text style={styles.shareCardStampText} numberOfLines={1}>FANSTAMP</Text>
            </View>
          </View>
        )}

        <Text style={styles.yrEyebrow}>YEAR IN REVIEW</Text>
        <Text style={styles.yrYear}>{year}</Text>

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

        {totalEvents > 0 && (
          <View style={styles.yrSectionBlock}>
            <Text style={styles.yrSectionLabel}>THE YEAR, MONTH BY MONTH</Text>
            <MonthBars monthlyBreakdown={monthlyBreakdown} maxMonthCount={maxMonthCount} />
          </View>
        )}

        {milestonesUnlocked.length > 0 && (
          <View style={styles.yrSectionBlock}>
            <Text style={styles.yrSectionLabel}>MILESTONES UNLOCKED</Text>
            <View style={styles.yrMilestoneRow}>
              {milestonesUnlocked.map((m) => (
                <View key={m.id} style={styles.yrMilestoneChip}>
                  <Text style={styles.yrMilestoneIcon}>{m.icon}</Text>
                  <Text style={styles.yrMilestoneLabel} numberOfLines={1}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.yrTagline}>Track your journey at FanStamp</Text>
      </View>
    </View>
  );
});
