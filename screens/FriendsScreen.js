import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatDisplayDate } from '../utils/dates';
import {
  followUser, searchUsers, subscribeFollowState, subscribeFollowing,
  subscribeToFriendProfile, unfollowUser,
} from '../utils/socialSync';
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
  { key: 'feed', label: 'Feed' },
  { key: 'find', label: 'Find Friends' },
];

export function FriendsScreen({ user, onSelectFriend, onRequestSignIn }) {
  const { styles } = useTheme();
  const [section, setSection] = useState('feed');

  if (!user) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyText}>Sign in to follow friends</Text>
        <Text style={styles.emptySubtext}>See what fellow fans are logging and compare stadium passports.</Text>
        <TouchableOpacity
          style={[styles.onboardingPrimaryBtn, { width: 200, marginTop: 16 }]}
          onPress={onRequestSignIn}
          activeOpacity={0.8}
        >
          <Text style={styles.onboardingPrimaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const myDisplayName = user.displayName || user.email;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.friendsSectionRow}>
        {SECTIONS.map((s) => {
          const active = s.key === section;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSection(s.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {section === 'feed' ? (
        <ActivityFeed currentUid={user.uid} onSelectFriend={onSelectFriend} />
      ) : (
        <FindFriends currentUid={user.uid} myDisplayName={myDisplayName} onSelectFriend={onSelectFriend} />
      )}
    </View>
  );
}

// Fans out over every followed uid's profile doc (one onSnapshot listener
// each — fine at Tier-1 following-list sizes) and pulls each friend's
// `recentEvents`, which is already denormalized onto their profile doc for
// exactly this purpose. Diffs the listener set against the following list
// as it changes rather than tearing everything down on every update.
function ActivityFeed({ currentUid, onSelectFriend }) {
  const { styles } = useTheme();
  const [followingList, setFollowingList] = useState([]);
  const [profilesByUid, setProfilesByUid] = useState({});
  const unsubsRef = useRef(new Map());

  useEffect(() => subscribeFollowing(currentUid, setFollowingList), [currentUid]);

  useEffect(() => {
    const nextUids = new Set(followingList.map((f) => f.uid));
    const subs = unsubsRef.current;

    subs.forEach((unsub, uid) => {
      if (nextUids.has(uid)) return;
      unsub();
      subs.delete(uid);
      setProfilesByUid((prev) => {
        if (!(uid in prev)) return prev;
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    });

    nextUids.forEach((uid) => {
      if (subs.has(uid)) return;
      subs.set(uid, subscribeToFriendProfile(uid, (profile) => {
        setProfilesByUid((prev) => ({ ...prev, [uid]: profile }));
      }));
    });
  }, [followingList]);

  useEffect(() => () => { unsubsRef.current.forEach((unsub) => unsub()); unsubsRef.current.clear(); }, []);

  const feedItems = useMemo(() => {
    const items = [];
    Object.values(profilesByUid).forEach((profile) => {
      if (!profile) return;
      (profile.recentEvents || []).forEach((e) => {
        items.push({ ...e, friendUid: profile.uid, friendName: profile.displayName });
      });
    });
    return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [profilesByUid]);

  return (
    <FlatList
      data={feedItems}
      keyExtractor={(item, i) => `${item.friendUid}-${item.id ?? i}`}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => onSelectFriend(item.friendUid)} activeOpacity={0.75}>
          <View style={styles.cardTop}>
            <Text style={styles.feedFriendName}>{item.friendName}</Text>
            <CategoryBadge category={item.category} />
          </View>
          <Text style={styles.feedEventName}>{item.name}</Text>
          <Text style={styles.feedVenue}>{item.venue} · {item.location}</Text>
          <Text style={styles.feedDate}>{formatDisplayDate(item.date)}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>Follow some friends in Find Friends to see their events here.</Text>
        </View>
      }
    />
  );
}

function FindFriends({ currentUid, myDisplayName, onSelectFriend }) {
  const { styles, colors } = useTheme();
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      searchUsers(q, currentUid)
        .then(setResults)
        .catch((err) => { console.log('[FanStamp] friend search failed:', err); setResults([]); })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [text, currentUid]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or exact email…"
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={setText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {text.length > 0 && (
            <TouchableOpacity onPress={() => setText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <FriendResultRow
            profile={item}
            currentUid={currentUid}
            myDisplayName={myDisplayName}
            onPress={() => onSelectFriend(item.uid)}
          />
        )}
        ListEmptyComponent={
          text.trim().length >= 2 && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No fans found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function FriendResultRow({ profile, currentUid, myDisplayName, onPress }) {
  const { styles } = useTheme();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeFollowState(currentUid, profile.uid, setFollowing), [currentUid, profile.uid]);

  async function handleToggle() {
    setBusy(true);
    try {
      if (following) await unfollowUser(currentUid, profile.uid);
      else await followUser(currentUid, myDisplayName, profile.uid, profile.displayName);
    } catch (err) {
      console.log('[FanStamp] follow toggle failed:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableOpacity style={styles.friendResultRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.friendResultAvatar}>
        <Text style={styles.friendResultAvatarText}>{(profile.displayName || '?').trim().charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.friendResultBody}>
        <Text style={styles.friendResultName}>{profile.displayName}</Text>
        <Text style={styles.friendResultStats}>
          {profile.totalEvents ?? 0} events · {profile.uniqueVenues ?? 0} venues · {profile.statesVisited ?? 0} states
        </Text>
      </View>
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
    </TouchableOpacity>
  );
}
