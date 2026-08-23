import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  STORAGE_KEY, BUCKET_LIST_STORAGE_KEY, FAVORITE_TEAM_STORAGE_KEY, ONBOARDED_STORAGE_KEY, EMPTY_FORM,
  LEGACY_STORAGE_KEY, LEGACY_BUCKET_LIST_STORAGE_KEY, LEGACY_FAVORITE_TEAM_STORAGE_KEY,
} from './constants';
import { eventToForm, geocodeVenue } from './utils/geo';
import { getItemWithMigration } from './utils/storage';
import { canFetchGameStats, fetchGameStats, needsGameStatsRefresh } from './utils/gameStatsApi';
import {
  subscribeToUserData, ensureMigrated, syncEventsToFirestore,
  syncBucketListToFirestore, setUserFields,
} from './utils/firestoreSync';
import { EventsScreen } from './screens/EventsScreen';
import { MapScreen } from './screens/MapScreen';
import { StatsScreen } from './screens/StatsScreen';
import { LeaguesScreen } from './screens/LeaguesScreen';
import { AuthScreen } from './screens/AuthScreen';
import { EventFormModal } from './components/EventFormModal';
import { DetailScreen } from './components/DetailScreen';
import { LeagueDetailScreen } from './components/LeagueDetailScreen';
import { TeamGameLogScreen } from './components/TeamGameLogScreen';
import { BoxScoreScreen } from './components/BoxScoreScreen';
import { CumulativeTeamStatsScreen } from './components/CumulativeTeamStatsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ProfileModal } from './components/ProfileModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Keep the native splash screen up until the first-launch check below
// resolves, so the app never flashes empty content before the onboarding
// decision is made. Must run at module scope, not inside the component.
SplashScreen.preventAutoHideAsync();

// Aged-paper texture behind the whole app in retro mode — see the
// vignetteEdge* styles in styles.js for the darkened-edge gradients
// layered on top of it.
const PARCHMENT_BG = require('./assets/parchment.png');

// Ink-aged-paper edge tint, fading to fully transparent toward the center.
const VIGNETTE_EDGE_COLOR = 'rgba(101, 67, 33, 0.25)';
const VIGNETTE_TRANSPARENT = 'rgba(101, 67, 33, 0)';

const TABS = [
  { key: 'events',  label: 'Events',  icon: '🎟' },
  { key: 'map',     label: 'Map',     icon: '🗺' },
  { key: 'stats',   label: 'Stats',   icon: '📊' },
  { key: 'leagues', label: 'Leagues', icon: '🏆' },
];

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { styles, retro, toggleRetro, applyRemoteRetro } = useTheme();
  const { user } = useAuth();
  const [onboarded, setOnboarded]     = useState(null); // null = still checking (splash stays up)
  const [activeTab, setActiveTab]     = useState('events');
  const [events, setEvents]           = useState([]);
  const [bucketList, setBucketList]   = useState([]);
  const [hasLoaded, setHasLoaded]     = useState(false);
  const [detailEvent, setDetailEvent]   = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [boxScoreEvent, setBoxScoreEvent] = useState(null);
  const [showFullTeamStats, setShowFullTeamStats] = useState(false);
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [formConfig, setFormConfig]   = useState({ visible: false, editingId: null });
  const [formPrefill, setFormPrefill] = useState(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const lastSyncedEventsRef = useRef(null);
  const lastSyncedBucketRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_STORAGE_KEY).then((raw) => {
      setOnboarded(raw === 'true');
      SplashScreen.setOptions({ fade: true, duration: 400 });
      SplashScreen.hideAsync();
    });
  }, []);

  function completeOnboarding() {
    setOnboarded(true);
    AsyncStorage.setItem(ONBOARDED_STORAGE_KEY, 'true');
  }

  useEffect(() => {
    AsyncStorage.getAllKeys().then(async (keys) => {
      const entries = await AsyncStorage.multiGet(keys);
      console.log('[FanStamp] AsyncStorage keys on startup:', entries.map(([k, v]) => `${k} = ${v?.slice(0, 80)}`));
    });
    getItemWithMigration(STORAGE_KEY, LEGACY_STORAGE_KEY).then((raw) => {
      const loaded = (raw ? JSON.parse(raw) : []).map((e) => ({
        ...e,
        category: e.category === 'Sport' ? 'Other Sport' : e.category,
      }));
      setEvents(loaded);
      setHasLoaded(true);
      // Geocode any events missing coordinates in the background
      loaded
        .filter((e) => !e.coordinates)
        .forEach(async (event) => {
          const coords = await geocodeVenue(event.venue, event.location);
          if (coords) setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, coordinates: coords } : e)));
        });
      // Retry game-stats fetches that never resolved (app killed mid-fetch),
      // were skipped because the event's date hadn't happened yet, or predate
      // the full box score fields (needsGameStatsRefresh) — same idempotent
      // fetchGameStats() backfills older logged games for the box score screen.
      loaded
        .filter((e) => canFetchGameStats(e) && (!e.gameStats || e.gameStats.status === 'loading' || needsGameStatsRefresh(e)))
        .forEach((event) => {
          fetchGameStats(event).then((gameStats) => {
            setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, gameStats } : e)));
          });
        });
    });
    getItemWithMigration(BUCKET_LIST_STORAGE_KEY, LEGACY_BUCKET_LIST_STORAGE_KEY).then((raw) => {
      if (raw) setBucketList(JSON.parse(raw));
    });
    getItemWithMigration(FAVORITE_TEAM_STORAGE_KEY, LEGACY_FAVORITE_TEAM_STORAGE_KEY).then((raw) => {
      if (raw) setFavoriteTeam(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(BUCKET_LIST_STORAGE_KEY, JSON.stringify(bucketList));
  }, [bucketList, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(FAVORITE_TEAM_STORAGE_KEY, JSON.stringify(favoriteTeam));
  }, [favoriteTeam, hasLoaded]);

  // ── Cloud sync (guest mode when signed out — nothing below runs) ──────────
  // Runs once per sign-in: uploads whatever's in local storage at that
  // moment (guarded by a flag on the user doc, so it only ever happens once
  // per account — a second device won't stomp cloud data with stale local
  // data), then subscribes to Firestore for real-time updates from other
  // devices. Deps intentionally exclude events/bucketList/favoriteTeam/retro
  // — this should only re-run when the signed-in user changes, using
  // whatever local data exists at that moment, not on every later edit.
  useEffect(() => {
    if (!hasLoaded || !user) return;
    let unsubscribe = null;
    let cancelled = false;
    ensureMigrated(user.uid, { events, bucketList, favoriteTeam, retroMode: retro })
      .catch((err) => console.log('[FanStamp] cloud migration failed:', err))
      .finally(() => {
        if (cancelled) return;
        unsubscribe = subscribeToUserData(user.uid, {
          onEvents: setEvents,
          onBucketList: setBucketList,
          onUserDoc: (data) => {
            if (!data) return;
            if ('favoriteTeam' in data) setFavoriteTeam(data.favoriteTeam ?? null);
            if (typeof data.retroMode === 'boolean') applyRemoteRetro(data.retroMode);
          },
        });
      });
    return () => { cancelled = true; if (unsubscribe) unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, hasLoaded]);

  // A different account signing in next shouldn't diff against the previous
  // account's synced snapshot.
  useEffect(() => {
    if (!user) { lastSyncedEventsRef.current = null; lastSyncedBucketRef.current = null; }
  }, [user]);

  // Debounced local → cloud sync for events/bucketList — diffs against the
  // last-synced snapshot, which also picks up the async geocode/game-stats
  // backfills below for free, without a sync call at each of those sites.
  useEffect(() => {
    if (!hasLoaded || !user) return;
    const t = setTimeout(() => {
      syncEventsToFirestore(user.uid, events, lastSyncedEventsRef)
        .catch((err) => console.log('[FanStamp] event sync failed:', err));
    }, 1200);
    return () => clearTimeout(t);
  }, [events, hasLoaded, user?.uid]);

  useEffect(() => {
    if (!hasLoaded || !user) return;
    const t = setTimeout(() => {
      syncBucketListToFirestore(user.uid, bucketList, lastSyncedBucketRef)
        .catch((err) => console.log('[FanStamp] bucket list sync failed:', err));
    }, 1200);
    return () => clearTimeout(t);
  }, [bucketList, hasLoaded, user?.uid]);

  useEffect(() => {
    if (!hasLoaded || !user) return;
    setUserFields(user.uid, { favoriteTeam }).catch((err) => console.log('[FanStamp] favorite team sync failed:', err));
  }, [favoriteTeam, hasLoaded, user?.uid]);

  function toggleBucketList(league, team, stadium, city) {
    setBucketList((prev) => {
      const exists = prev.some((b) => b.league === league && b.team === team);
      return exists
        ? prev.filter((b) => !(b.league === league && b.team === team))
        : [...prev, { league, team, stadium, city }];
    });
  }

  function toggleFavoriteTeam(league, team) {
    setFavoriteTeam((prev) => (prev && prev.league === league && prev.team === team ? null : { league, team }));
  }

  function openAdd()  { setFormPrefill(null); setFormConfig({ visible: true, editingId: null }); }
  function openEdit() { setFormConfig({ visible: true, editingId: detailEvent.id }); }
  function closeForm() { setFormConfig({ visible: false, editingId: null }); setFormPrefill(null); }

  function handlePlaceSelect(prefill) {
    setFormPrefill(prefill);
    setFormConfig({ visible: true, editingId: null });
  }

  async function handleSave(form) {
    const { editingId } = formConfig;
    if (editingId) {
      const updated = {
        name:     form.name.trim(),
        venue:    form.venue.trim(),
        location: form.city.trim()  || '—',
        date:     form.date        || '—',
        category: form.category,
        notes:    form.notes.trim(),
        photos:   form.photos,
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        result:   form.result,
        ticketPhoto: form.ticketPhoto || null,
        verified: !!form.ticketPhoto,
      };
      setEvents((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...updated } : e)));
      setDetailEvent((prev) => ({ ...prev, ...updated }));
      closeForm();
      const existing = events.find((e) => e.id === editingId);
      if (existing && (existing.venue !== updated.venue || existing.location !== updated.location)) {
        const coords = await geocodeVenue(updated.venue, updated.location);
        if (coords) {
          setEvents((prev) => prev.map((e) => (e.id === editingId ? { ...e, coordinates: coords } : e)));
          setDetailEvent((prev) => prev && prev.id === editingId ? { ...prev, coordinates: coords } : prev);
        }
      }
      if (existing && (
        existing.date !== updated.date || existing.homeTeam !== updated.homeTeam ||
        existing.awayTeam !== updated.awayTeam || existing.category !== updated.category
      ) && canFetchGameStats(updated)) {
        setEvents((prev) => prev.map((e) => (e.id === editingId ? { ...e, gameStats: { status: 'loading' } } : e)));
        setDetailEvent((prev) => prev && prev.id === editingId ? { ...prev, gameStats: { status: 'loading' } } : prev);
        fetchGameStats(updated).then((gameStats) => {
          setEvents((prev) => prev.map((e) => (e.id === editingId ? { ...e, gameStats } : e)));
          setDetailEvent((prev) => prev && prev.id === editingId ? { ...prev, gameStats } : prev);
        });
      }
    } else {
      const newEvent = {
        id:          Date.now().toString(),
        name:        form.name.trim(),
        venue:       form.venue.trim(),
        location:    form.city.trim()  || '—',
        date:        form.date        || '—',
        category:    form.category,
        notes:       form.notes.trim(),
        photos:      form.photos,
        homeTeam:    form.homeTeam.trim(),
        awayTeam:    form.awayTeam.trim(),
        result:      form.result,
        ticketPhoto: form.ticketPhoto || null,
        verified:    !!form.ticketPhoto,
        coordinates: null,
      };
      setEvents((prev) => [newEvent, ...prev]);
      closeForm();
      console.log('[handleSave] new event saved, geocoding venue:', newEvent.venue, newEvent.location);
      geocodeVenue(newEvent.venue, newEvent.location).then((coords) => {
        console.log('[handleSave] geocode result for', newEvent.venue, ':', coords);
        if (coords) {
          setEvents((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, coordinates: coords } : e)));
          console.log('[handleSave] event', newEvent.id, 'updated with coordinates — should now render as a map pin');
        } else {
          console.log('[handleSave] no coordinates found — event', newEvent.id, 'will not get a map pin');
        }
      });
      if (canFetchGameStats(newEvent)) {
        setEvents((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, gameStats: { status: 'loading' } } : e)));
        fetchGameStats(newEvent).then((gameStats) => {
          setEvents((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, gameStats } : e)));
        });
      }
    }
  }

  function retryGameStats(event) {
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, gameStats: { status: 'loading' } } : e)));
    setDetailEvent((prev) => prev && prev.id === event.id ? { ...prev, gameStats: { status: 'loading' } } : prev);
    setBoxScoreEvent((prev) => prev && prev.id === event.id ? { ...prev, gameStats: { status: 'loading' } } : prev);
    fetchGameStats(event).then((gameStats) => {
      setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, gameStats } : e)));
      setDetailEvent((prev) => prev && prev.id === event.id ? { ...prev, gameStats } : prev);
      setBoxScoreEvent((prev) => prev && prev.id === event.id ? { ...prev, gameStats } : prev);
    });
  }

  function handleDelete() {
    Alert.alert('Delete Event', `Remove "${detailEvent.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setEvents((prev) => prev.filter((e) => e.id !== detailEvent.id)); setDetailEvent(null); } },
    ]);
  }

  const inEventDetail  = detailEvent !== null && activeTab === 'events';
  const inLeagueDetail = selectedLeague !== null && activeTab === 'leagues';
  const inTeamDetail   = selectedTeam !== null && activeTab === 'stats';
  const inBoxScore     = boxScoreEvent !== null && inTeamDetail;
  const inFullTeamStats = showFullTeamStats && inTeamDetail;
  const inDetail = inEventDetail || inLeagueDetail || inTeamDetail;
  const formInitialValues = formConfig.editingId && detailEvent
    ? eventToForm(detailEvent)
    : formPrefill
      ? { ...EMPTY_FORM, venue: formPrefill.venue ?? '', city: formPrefill.city ?? '' }
      : EMPTY_FORM;

  function handleBack() {
    // inBoxScore/inFullTeamStats imply inTeamDetail is also true (selectedTeam
    // still set), so this must be an else-if chain — otherwise multiple would
    // clear at once and skip a level of back navigation.
    if (inBoxScore)               setBoxScoreEvent(null);
    else if (inFullTeamStats)     setShowFullTeamStats(false);
    else if (inEventDetail)       setDetailEvent(null);
    else if (inLeagueDetail)      setSelectedLeague(null);
    else if (inTeamDetail)        setSelectedTeam(null);
  }

  const backLabel = inLeagueDetail ? 'Leagues'
    : (inBoxScore || inFullTeamStats) ? selectedTeam.team
    : inTeamDetail ? 'Stats' : 'Events';

  // Still checking AsyncStorage for the onboarding flag — native splash
  // screen is still showing, so render nothing rather than a content flash.
  if (onboarded === null) return null;
  if (!onboarded) return <OnboardingScreen onComplete={completeOnboarding} />;

  // Exactly one texture layer for the whole app — wrapping the root
  // container itself, with header/screen/tab bar all left transparent so
  // this single image shows through everywhere. Per-component
  // ImageBackgrounds (one on the header, one per screen, one on the tab
  // bar) each independently resized/cropped the same source image to fit
  // their own container, so the grain scaled differently in each strip —
  // visible seams and a washed-out look at the boundaries. A single layer
  // sized to the whole screen removes that mismatch entirely.
  const RootContainer = retro ? ImageBackground : View;
  const rootContainerProps = retro
    ? { source: PARCHMENT_BG, resizeMode: 'cover', style: styles.root }
    : { style: styles.root };

  const headerContent = (
    <View style={styles.headerRow}>
      {inDetail ? (
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ {backLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.logoStamp, retro && styles.logoStampRetro]}>
          <View style={styles.logoStampInnerRect}>
            <Text style={styles.logoStampText} numberOfLines={1}>
              FANSTAMP
            </Text>
          </View>
        </View>
      )}
      <View style={styles.headerRightGroup}>
        <TouchableOpacity
          onPress={() => (user ? setShowProfile(true) : setShowAuthScreen(true))}
          style={[styles.profileBtn, user && styles.profileBtnSignedIn]}
          activeOpacity={0.7}
        >
          {user ? (
            <Text style={styles.profileBtnText}>
              {(user.displayName || user.email || '?').trim().charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Text style={styles.profileBtnIcon}>👤</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleRetro(user?.uid)} style={styles.retroToggleBtn} activeOpacity={0.7}>
          <Text style={styles.retroToggleIcon}>{retro ? '🌙' : '📜'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <RootContainer {...rootContainerProps}>
        {/* Without this, the native status bar keeps its own opaque background
            on Android regardless of anything rendered in the JS tree below —
            no amount of ImageBackground/View nesting reaches it. */}
        <StatusBar style={retro ? 'dark' : 'light'} translucent backgroundColor="transparent" />
        <View style={styles.header}>
          {headerContent}
        </View>

        <View style={styles.screen}>
          {activeTab === 'events' ? (
            inEventDetail ? (
              <DetailScreen event={detailEvent} onEdit={openEdit} onDelete={handleDelete} onRetryStats={retryGameStats} />
            ) : (
              <EventsScreen events={events} onCardPress={setDetailEvent} onAddPress={openAdd} onPlaceSelect={handlePlaceSelect} />
            )
          ) : activeTab === 'map' ? (
            <MapScreen events={events} />
          ) : activeTab === 'leagues' ? (
            inLeagueDetail ? (
              <LeagueDetailScreen
                league={selectedLeague}
                events={events}
                bucketList={bucketList}
                onToggleBucketList={toggleBucketList}
              />
            ) : (
              <LeaguesScreen events={events} onSelectLeague={setSelectedLeague} />
            )
          ) : inTeamDetail ? (
            inBoxScore ? (
              <BoxScoreScreen event={boxScoreEvent} onRetryStats={retryGameStats} />
            ) : inFullTeamStats ? (
              <CumulativeTeamStatsScreen league={selectedTeam.league} team={selectedTeam.team} events={events} />
            ) : (
              <TeamGameLogScreen
                league={selectedTeam.league}
                team={selectedTeam.team}
                events={events}
                onSelectGame={setBoxScoreEvent}
                onSelectFullStats={() => setShowFullTeamStats(true)}
              />
            )
          ) : (
            <StatsScreen
              events={events}
              bucketList={bucketList}
              onToggleBucketList={toggleBucketList}
              favoriteTeam={favoriteTeam}
              onToggleFavoriteTeam={toggleFavoriteTeam}
              onSelectTeam={(league, team) => { setBoxScoreEvent(null); setShowFullTeamStats(false); setSelectedTeam({ league, team }); }}
              user={user}
            />
          )}
        </View>

        {!inDetail && (
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}>
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                  {active && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <EventFormModal
          visible={formConfig.visible}
          editMode={!!formConfig.editingId}
          initialValues={formInitialValues}
          onClose={closeForm}
          onSave={handleSave}
        />

        <AuthScreen visible={showAuthScreen} onClose={() => setShowAuthScreen(false)} />
        <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />

        {/* Painted last so they sit on top of the header, screen, and tab
            bar — all transparent now that the single texture layer above
            them supplies the parchment background. Four separate strips
            rather than one bordered box, since each needs its own fade
            direction (edge → transparent) pointing inward. */}
        {retro && (
          <>
            <LinearGradient
              pointerEvents="none"
              colors={[VIGNETTE_EDGE_COLOR, VIGNETTE_TRANSPARENT]}
              style={styles.vignetteEdgeTop}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[VIGNETTE_TRANSPARENT, VIGNETTE_EDGE_COLOR]}
              style={styles.vignetteEdgeBottom}
            />
            <LinearGradient
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[VIGNETTE_EDGE_COLOR, VIGNETTE_TRANSPARENT]}
              style={styles.vignetteEdgeLeft}
            />
            <LinearGradient
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={[VIGNETTE_TRANSPARENT, VIGNETTE_EDGE_COLOR]}
              style={styles.vignetteEdgeRight}
            />
          </>
        )}
      </RootContainer>
    </>
  );
}
