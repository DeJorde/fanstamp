import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, EMPTY_FORM } from './constants';
import { eventToForm, geocodeVenue } from './utils/geo';
import { EventsScreen } from './screens/EventsScreen';
import { MapScreen } from './screens/MapScreen';
import { StatsScreen } from './screens/StatsScreen';
import { LeaguesScreen } from './screens/LeaguesScreen';
import { EventFormModal } from './components/EventFormModal';
import { DetailScreen } from './components/DetailScreen';
import { LeagueDetailScreen } from './components/LeagueDetailScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';

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
  const [activeTab, setActiveTab]     = useState('events');
  const [events, setEvents]           = useState([]);
  const [hasLoaded, setHasLoaded]     = useState(false);
  const [detailEvent, setDetailEvent]   = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [formConfig, setFormConfig]   = useState({ visible: false, editingId: null });
  const [formPrefill, setFormPrefill] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
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
    });
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, hasLoaded]);

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
        coordinates: null,
      };
      setEvents((prev) => [newEvent, ...prev]);
      closeForm();
      geocodeVenue(newEvent.venue, newEvent.location).then((coords) => {
        if (coords) setEvents((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, coordinates: coords } : e)));
      });
    }
  }

  function handleDelete() {
    Alert.alert('Delete Event', `Remove "${detailEvent.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setEvents((prev) => prev.filter((e) => e.id !== detailEvent.id)); setDetailEvent(null); } },
    ]);
  }

  const inEventDetail  = detailEvent !== null && activeTab === 'events';
  const inLeagueDetail = selectedLeague !== null && activeTab === 'leagues';
  const inDetail = inEventDetail || inLeagueDetail;
  const formInitialValues = formConfig.editingId && detailEvent
    ? eventToForm(detailEvent)
    : formPrefill
      ? { ...EMPTY_FORM, venue: formPrefill.venue ?? '', city: formPrefill.city ?? '' }
      : EMPTY_FORM;

  function handleBack() {
    if (inEventDetail)  setDetailEvent(null);
    if (inLeagueDetail) setSelectedLeague(null);
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {inDetail ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ {inLeagueDetail ? 'Leagues' : 'Events'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logoRow}>
              <Text style={styles.headerLogo}>Stadium</Text>
              <Text style={styles.headerLogoAccent}>Log</Text>
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
            <DetailScreen event={detailEvent} onEdit={openEdit} onDelete={handleDelete} />
          ) : (
            <EventsScreen events={events} onCardPress={setDetailEvent} onAddPress={openAdd} onPlaceSelect={handlePlaceSelect} />
          )
        ) : activeTab === 'map' ? (
          <MapScreen events={events} />
        ) : activeTab === 'leagues' ? (
          inLeagueDetail ? (
            <LeagueDetailScreen league={selectedLeague} events={events} />
          ) : (
            <LeaguesScreen events={events} onSelectLeague={setSelectedLeague} />
          )
        ) : (
          <StatsScreen events={events} />
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
