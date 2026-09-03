import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { formatDisplayDate } from '../utils/dates';
import {
  followUser, getFollowCounts, subscribeFollowState, subscribeToFriendProfile, unfollowUser,
} from '../utils/socialSync';
import { useTheme } from '../context/ThemeContext';
import { CategoryBadge } from './CategoryBadge';

function MetricCard({ label, value, icon }) {
  const { styles } = useTheme();
  return (
    <View style={styles.statsMetricCard}>
      <Text style={styles.statsMetricIcon}>{icon}</Text>
      <Text style={styles.statsMetricValue}>{value}</Text>
      <Text style={styles.statsMetricLabel}>{label}</Text>
    </View>
  );
}

// Firestore Timestamp -> the YYYY-MM-DD string formatDisplayDate expects.
function timestampToStorageDate(ts) {
  const d = ts.toDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function FriendProfileScreen({ uid, currentUser }) {
  const { styles } = useTheme();
  // undefined = still loading, null = doc missing or access denied (private).
  const [profile, setProfile] = useState(undefined);
  const [following, setFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeToFriendProfile(uid, setProfile), [uid]);

  useEffect(() => {
    if (!currentUser) return;
    return subscribeFollowState(currentUser.uid, uid, setFollowing);
  }, [currentUser?.uid, uid]);

  useEffect(() => {
    getFollowCounts(uid).then(setCounts).catch(() => {});
  }, [uid, following]);

  async function handleToggle() {
    if (!currentUser || !profile) return;
    setBusy(true);
    try {
      if (following) await unfollowUser(currentUser.uid, uid);
      else await followUser(currentUser.uid, currentUser.displayName || currentUser.email, uid, profile.displayName);
    } catch (err) {
      console.log('[FanStamp] follow toggle failed:', err);
    } finally {
      setBusy(false);
    }
  }

  if (profile === undefined) return null;

  if (profile === null) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyText}>This profile is private</Text>
      </View>
    );
  }

  const initial = (profile.displayName || '?').trim().charAt(0).toUpperCase();
  const passportEntries = Object.entries(profile.leaguePassport || {});
  const isSelf = currentUser?.uid === uid;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <View style={styles.friendProfileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{initial}</Text>
        </View>
        <Text style={styles.friendProfileName}>{profile.displayName}</Text>
        {profile.joinDate?.toDate && (
          <Text style={styles.friendProfileJoinDate}>
            Joined {formatDisplayDate(timestampToStorageDate(profile.joinDate))}
          </Text>
        )}
        <View style={styles.friendProfileCountsRow}>
          <Text style={styles.friendProfileCount}>
            <Text style={styles.friendProfileCountNum}>{counts.followers}</Text> Followers
          </Text>
          <Text style={styles.friendProfileCount}>
            <Text style={styles.friendProfileCountNum}>{counts.following}</Text> Following
          </Text>
        </View>
        {!isSelf && currentUser && (
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={handleToggle}
            disabled={busy}
            activeOpacity={0.7}
          >
            <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.statsSectionHeader}>Overview</Text>
      <View style={styles.statsGrid}>
        <MetricCard label="Total Events"  value={profile.totalEvents ?? 0}   icon="🎟" />
        <MetricCard label="Unique Venues" value={profile.uniqueVenues ?? 0}  icon="🏟" />
        <MetricCard label="States"        value={profile.statesVisited ?? 0} icon="🗺" />
        <MetricCard label="Years Active"  value={profile.yearsActive ?? 0}   icon="📅" />
      </View>

      <Text style={styles.statsSectionHeader}>Stadium Passport</Text>
      {passportEntries.length === 0 ? (
        <Text style={styles.statsEmptyInCard}>No stadiums tracked yet</Text>
      ) : (
        passportEntries.map(([league, p]) => (
          <View key={league} style={styles.leagueCard}>
            <Text style={styles.leagueCardRingEmoji}>{LEAGUE_ICONS[league] ?? '🏟'}</Text>
            <View style={styles.leagueCardBody}>
              <Text style={styles.leagueCardName}>{league}</Text>
              <Text style={styles.leagueCardFraction}>{p.visited}/{p.total} stadiums</Text>
            </View>
            <Text style={styles.leagueCardPct}>{p.total > 0 ? Math.round((p.visited / p.total) * 100) : 0}%</Text>
          </View>
        ))
      )}

      <Text style={styles.statsSectionHeader}>Recent Events</Text>
      {(profile.recentEvents || []).length === 0 ? (
        <Text style={styles.statsEmptyInCard}>No events logged yet</Text>
      ) : (
        profile.recentEvents.map((e) => (
          <View key={e.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.feedEventName}>{e.name}</Text>
              <CategoryBadge category={e.category} />
            </View>
            <Text style={styles.feedVenue}>{e.venue} · {e.location}</Text>
            <Text style={styles.feedDate}>{formatDisplayDate(e.date)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
