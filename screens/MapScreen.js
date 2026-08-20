import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { CATEGORY_COLORS, CATEGORY_ICONS, MAP_STYLES, MAP_STYLE_KEYS, FILTERS } from '../constants';
import { matchesFilter } from '../utils/dates';
import { computeRegion } from '../utils/geo';
import { shareViewAsImage } from '../utils/shareImage';
import { FilterBar } from '../components/FilterBar';
import { CompassRose } from '../components/CompassRose';
import { useTheme } from '../context/ThemeContext';

export function MapScreen({ events }) {
  const { styles, retro } = useTheme();
  const [styleKey, setStyleKey] = useState('standard');
  const [filter, setFilter]     = useState('all');
  const [pinMode, setPinMode]   = useState('emoji');  // 'emoji' | 'classic'

  // Global retro mode drives the map's own style selector automatically.
  useEffect(() => {
    setStyleKey(retro ? 'retro' : 'standard');
  }, [retro]);

  const filtered = useMemo(() => events.filter((e) => matchesFilter(e, filter)), [events, filter]);

  const venueMarkers = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      if (!e.coordinates) return;
      if (!map[e.venue]) {
        map[e.venue] = {
          key: e.venue,
          venue: e.venue,
          location: e.location,
          coordinates: e.coordinates,
          category: e.category,   // most-recent event wins (events are newest-first)
          count: 0,
        };
      }
      map[e.venue].count++;
    });
    return Object.values(map);
  }, [filtered]);

  const initialRegion = useMemo(() => computeRegion(venueMarkers), [venueMarkers]);

  // `initialRegion` only positions the camera on the MapView's first mount —
  // react-native-maps does not re-read it on prop changes. A pin geocoded
  // after that first render (which is *every* newly saved event, since
  // geocoding is an async network call) still gets added to the map, but
  // the camera never moves to show it, so it can render entirely off-screen
  // and look like it "didn't appear." Explicitly animate to the new region
  // whenever a marker is added.
  const mapRef = useRef(null);
  const mapCaptureRef = useRef(null);
  const prevMarkerCount = useRef(venueMarkers.length);
  useEffect(() => {
    console.log('[MapScreen] venueMarkers changed:', prevMarkerCount.current, '->', venueMarkers.length);
    if (venueMarkers.length > prevMarkerCount.current && mapRef.current) {
      const region = computeRegion(venueMarkers);
      console.log('[MapScreen] new marker detected, animating camera to', region);
      mapRef.current.animateToRegion(region, 600);
    }
    prevMarkerCount.current = venueMarkers.length;
  }, [venueMarkers]);

  const activeStyle = MAP_STYLES[styleKey];

  function cycleStyle() {
    const idx = MAP_STYLE_KEYS.indexOf(styleKey);
    setStyleKey(MAP_STYLE_KEYS[(idx + 1) % MAP_STYLE_KEYS.length]);
  }

  const isRetro = styleKey === 'retro';

  async function handleShareMap() {
    try {
      await shareViewAsImage(mapCaptureRef, 'My FanStamp explorer map 🗺 #FanStamp');
    } catch {
      Alert.alert('Share Failed', 'Could not create the image to share. Please try again.');
    }
  }

  return (
    // The outer View is the full content area; MapView fills it absolutely
    <View style={{ flex: 1 }}>
      {/* Captured subtree for sharing — map + pins + retro overlay + compass
          rose only, so the shared image excludes the filter bar and toggles. */}
      <View ref={mapCaptureRef} collapsable={false} style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          mapType="standard"
          customMapStyle={activeStyle.json}
          // Push camera down so filter overlay doesn't obscure pins
          mapPadding={{ top: 52, right: 0, bottom: 0, left: 0 }}
        >
          {venueMarkers.map((marker) => {
            const colors = CATEGORY_COLORS[marker.category] ?? CATEGORY_COLORS.Other;
            const callout = (
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutVenue}>{marker.venue}</Text>
                  <Text style={styles.calloutLocation}>{marker.location}</Text>
                  <Text style={[styles.calloutCategory, { color: colors.text }]}>
                    {CATEGORY_ICONS[marker.category]} {marker.category}
                  </Text>
                  <Text style={styles.calloutCount}>
                    {marker.count} event{marker.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </Callout>
            );
            if (pinMode === 'classic') {
              return (
                <Marker
                  key={`${marker.key}-classic`}
                  coordinate={{ latitude: marker.coordinates.lat, longitude: marker.coordinates.lng }}
                  pinColor="#e63946"
                >
                  {callout}
                </Marker>
              );
            }
            return (
              <Marker
                key={`${marker.key}-emoji`}
                coordinate={{ latitude: marker.coordinates.lat, longitude: marker.coordinates.lng }}
              >
                <View style={[styles.mapPin, { backgroundColor: colors.bg, borderColor: colors.text }]}>
                  <Text style={styles.mapPinIcon}>{CATEGORY_ICONS[marker.category] ?? '📌'}</Text>
                </View>
                {callout}
              </Marker>
            );
          })}
        </MapView>

        {/* Compass rose — only in retro mode */}
        {isRetro && <CompassRose />}
      </View>

      {/* Filter bar floats over the map at the top */}
      <View style={[styles.mapFilterOverlay, isRetro && styles.mapFilterOverlayRetro]}>
        <FilterBar value={filter} onChange={setFilter} />
      </View>

      {/* Share button — top right, over the filter bar band */}
      <TouchableOpacity style={styles.mapShareBtn} onPress={handleShareMap} activeOpacity={0.7}>
        <Text style={styles.mapShareBtnIcon}>📤</Text>
      </TouchableOpacity>

      {/* Compact 3-way style toggle — top right */}
      <TouchableOpacity style={styles.mapToggle} onPress={cycleStyle} activeOpacity={0.8}>
        {MAP_STYLE_KEYS.map((key) => {
          const active = key === styleKey;
          return (
            <View key={key} style={[styles.mapToggleOption, active && styles.mapToggleOptionActive]}>
              <Text style={styles.mapToggleEmoji}>{MAP_STYLES[key].label}</Text>
              {active && <Text style={styles.mapToggleLabel}>{MAP_STYLES[key].title}</Text>}
            </View>
          );
        })}
      </TouchableOpacity>

      {/* Pin mode toggle — below style toggle */}
      <TouchableOpacity
        style={styles.mapPinToggle}
        onPress={() => setPinMode((m) => (m === 'emoji' ? 'classic' : 'emoji'))}
        activeOpacity={0.8}
      >
        {[
          { key: 'emoji',   label: 'Emoji',   icon: '🎯' },
          { key: 'classic', label: 'Classic', icon: '📍' },
        ].map(({ key, label, icon }) => {
          const active = key === pinMode;
          return (
            <View key={key} style={[styles.mapToggleOption, active && styles.mapToggleOptionActive]}>
              <Text style={styles.mapToggleEmoji}>{icon}</Text>
              {active && <Text style={styles.mapToggleLabel}>{label}</Text>}
            </View>
          );
        })}
      </TouchableOpacity>

      {venueMarkers.length === 0 && (
        <View style={styles.mapEmptyOverlay} pointerEvents="none">
          <Text style={[styles.mapEmptyText, isRetro && styles.mapEmptyTextRetro]}>
            {filter === 'all' ? 'Add events to see venues on the map' : 'No venues in this period'}
          </Text>
        </View>
      )}
    </View>
  );
}
