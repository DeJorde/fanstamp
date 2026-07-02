import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { computeBadges } from '../utils/badges';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';
import { ProgressRing } from './ProgressRing';

function SectionHeader({ title }) {
  const { styles } = useTheme();
  return <Text style={styles.statsSectionHeader}>{title}</Text>;
}

function GroupLabel({ title }) {
  const { styles } = useTheme();
  return <Text style={styles.badgeGroupLabel}>{title}</Text>;
}

function Badge({ icon, label, unlocked, unlockDate }) {
  const { styles } = useTheme();
  return (
    <View style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeLabel} numberOfLines={2}>{label}</Text>
      <Text style={styles.badgeDate}>
        {unlocked ? (unlockDate ? formatDisplayDate(unlockDate) : 'Unlocked') : 'Locked'}
      </Text>
    </View>
  );
}

function LeagueTrophy({ league, visited, total, pct, complete, unlockDate }) {
  const { styles, colors } = useTheme();
  return (
    <View style={[styles.trophyCard, complete && styles.trophyCardGold, visited === 0 && styles.badgeCardLocked]}>
      <ProgressRing
        size={64}
        strokeWidth={6}
        progress={pct}
        color={complete ? '#FFD700' : colors.accent}
        trackColor={colors.trackBg}
      >
        <Text style={styles.trophyIcon}>🏆</Text>
      </ProgressRing>
      <Text style={styles.trophyLeague}>{league}</Text>
      <Text style={styles.trophyFraction}>{visited}/{total}</Text>
      <Text style={styles.badgeDate}>
        {complete ? (unlockDate ? formatDisplayDate(unlockDate) : 'Complete!') : `${Math.round(pct * 100)}%`}
      </Text>
    </View>
  );
}

export function MilestonesSection({ events }) {
  const { styles } = useTheme();
  const badges = useMemo(() => computeBadges(events), [events]);

  return (
    <>
      <SectionHeader title="MILESTONES" />

      <GroupLabel title="Event Milestones" />
      <View style={styles.badgeGrid}>
        {badges.eventCount.map((b) => <Badge key={b.id} {...b} />)}
      </View>

      <GroupLabel title="Venue Explorer" />
      <View style={styles.badgeGrid}>
        {badges.venueExplorer.map((b) => <Badge key={b.id} {...b} />)}
      </View>

      <GroupLabel title="Category Firsts" />
      <View style={styles.badgeGrid}>
        {badges.categoryFirsts.map((b) => <Badge key={b.id} {...b} />)}
      </View>

      <GroupLabel title="League Completionist" />
      <View style={styles.trophyGrid}>
        {badges.leagueCompletionist.map((b) => <LeagueTrophy key={b.id} {...b} />)}
      </View>
    </>
  );
}
