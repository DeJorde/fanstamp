import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import {
  STORAGE_KEY, BUCKET_LIST_STORAGE_KEY, FAVORITE_TEAM_STORAGE_KEY, ONBOARDED_STORAGE_KEY, EMPTY_FORM,
  LEGACY_STORAGE_KEY, LEGACY_BUCKET_LIST_STORAGE_KEY, LEGACY_FAVORITE_TEAM_STORAGE_KEY,
} from './constants';
import { eventToForm, geocodeVenue } from './utils/geo';
import { getItemWithMigration } from './utils/storage';
import { canFetchGameStats, fetchGameStats, needsGameStatsRefresh } from './utils/gameStatsApi';
import { EventsScreen } from './screens/EventsScreen';
import { MapScreen } from './screens/MapScreen';
import { StatsScreen } from './screens/StatsScreen';
import { LeaguesScreen } from './screens/LeaguesScreen';
import { EventFormModal } from './components/EventFormModal';
import { DetailScreen } from './components/DetailScreen';
import { LeagueDetailScreen } from './components/LeagueDetailScreen';
import { TeamGameLogScreen } from './components/TeamGameLogScreen';
import { BoxScoreScreen } from './components/BoxScoreScreen';
import { CumulativeTeamStatsScreen } from './components/CumulativeTeamStatsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Keep the native splash screen up until the first-launch check below
// resolves, so the app never flashes empty content before the onboarding
// decision is made. Must run at module scope, not inside the component.
SplashScreen.preventAutoHideAsync();

const TABS = [
  { key: 'events',  label: 'Events',  icon: '🎟' },
  { key: 'map',     label: 'Map',     icon: '🗺' },
  { key: 'stats',   label: 'Stats',   icon: '📊' },
  { key: 'leagues', label: 'Leagues', icon: '🏆' },
];

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { styles, retro, toggleRetro } = useTheme();
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
      geocodeVenue(newEvent.venue, newEvent.location).then((coords) => {
        if (coords) setEvents((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, coordinates: coords } : e)));
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
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
          <TouchableOpacity onPress={toggleRetro} style={styles.retroToggleBtn} activeOpacity={0.7}>
            <Text style={styles.retroToggleIcon}>{retro ? '🌙' : '📜'}</Text>
          </TouchableOpacity>
        </View>
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
    </View>
  );
}
