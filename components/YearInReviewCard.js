import { forwardRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_ICONS } from '../constants';
import { formatDisplayDate } from '../utils/dates';
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
  const { year, totalEvents, uniqueVenues, uniqueCities, topCategory, biggestEvent, monthlyBreakdown, maxMonthCount, milestonesUnlocked } = review;

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

        {biggestEvent && (
          <View style={styles.yrBiggestBlock}>
            <Text style={styles.yrSectionLabel}>BIGGEST EVENT</Text>
            <Text style={styles.yrBiggestName} numberOfLines={2}>
              {CATEGORY_ICONS[biggestEvent.category] ?? '📌'} {biggestEvent.name}
            </Text>
            <Text style={styles.yrBiggestSub}>
              {biggestEvent.venue} · {formatDisplayDate(biggestEvent.date)}
            </Text>
          </View>
        )}

        {totalEvents > 0 && (
          <View style={styles.yrBiggestBlock}>
            <Text style={styles.yrSectionLabel}>THE YEAR, MONTH BY MONTH</Text>
            <MonthBars monthlyBreakdown={monthlyBreakdown} maxMonthCount={maxMonthCount} />
          </View>
        )}

        {milestonesUnlocked.length > 0 && (
          <View style={styles.yrBiggestBlock}>
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
