import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORY_GROUPS, CATEGORY_COLORS, CATEGORY_ICONS, FILTERS, CATEGORY_GROUP_MAP } from '../constants';
import { matchesFilter } from '../utils/dates';
import { fetchNominatimPlaces } from '../utils/geo';
import { EventCard } from '../components/EventCard';
import { useTheme } from '../context/ThemeContext';

const PARCHMENT_BG = require('../assets/parchment.png');

export function EventsScreen({ events, onCardPress, onAddPress, onPlaceSelect }) {
  const { styles, colors, retro } = useTheme();
  const [timeFilter, setTimeFilter]   = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [catFilter, setCatFilter]     = useState('all');

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCommit, setSearchCommit] = useState(null); // applied filter: { field, value }
  const [placeResults, setPlaceResults] = useState([]);
  const [isSearching, setIsSearching]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchBarH, setSearchBarH]     = useState(65);
  const closeTimer = useRef(null);

  // Local matches scanned from saved events
  const localMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const seenV = new Set(), seenC = new Set();
    const results = [];
    events.forEach((e) => {
      if (e.venue.toLowerCase().includes(q) && !seenV.has(e.venue)) {
        seenV.add(e.venue);
        results.push({ kind: 'venue', label: e.venue, sub: e.location !== '—' ? e.location : '' });
      }
      if (e.location && e.location !== '—' && e.location.toLowerCase().includes(q) && !seenC.has(e.location)) {
        seenC.add(e.location);
        results.push({ kind: 'city', label: e.location, sub: 'City' });
      }
    });
    return results.slice(0, 5);
  }, [searchQuery, events]);

  // Debounced Nominatim lookup
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setPlaceResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const r = await fetchNominatimPlaces(q, controller.signal);
      if (!controller.signal.aborted) { setPlaceResults(r); setIsSearching(false); }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery]);

  const showDropdown =
    dropdownOpen &&
    searchQuery.trim().length >= 2 &&
    (localMatches.length > 0 || placeResults.length > 0 || isSearching);

  function onSearchFocus() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  }
  function onSearchBlur() {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 160);
  }

  function clearSearch() {
    setSearchQuery('');
    setSearchCommit(null);
    setPlaceResults([]);
    setDropdownOpen(false);
  }

  function applyLocalMatch(match) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSearchQuery(match.label);
    setSearchCommit(match.kind === 'venue'
      ? { field: 'venue', value: match.label }
      : { field: 'city',  value: match.label });
    setDropdownOpen(false);
  }

  function applyPlaceResult(place) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSearchQuery(place.name);
    setSearchCommit({ field: 'text', value: place.name });
    setDropdownOpen(false);
    onPlaceSelect?.({ venue: place.venueName, city: place.cityName });
  }

  // ── Filters + category group ──────────────────────────────────────────────
  function selectGroup(g) { setGroupFilter(g); setCatFilter('all'); }
  const activeGroup = CATEGORY_GROUPS.find((g) => g.key === groupFilter) ?? null;

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (!matchesFilter(e, timeFilter)) return false;
      if (searchCommit) {
        if (searchCommit.field === 'venue') return e.venue === searchCommit.value;
        if (searchCommit.field === 'city')  return e.location === searchCommit.value;
        if (searchCommit.field === 'text') {
          const q = searchCommit.value.toLowerCase();
          return (
            e.venue.toLowerCase().includes(q) ||
            (e.location && e.location !== '—' && e.location.toLowerCase().includes(q)) ||
            e.name.toLowerCase().includes(q)
          );
        }
      }
      if (catFilter !== 'all') return e.category === catFilter;
      if (groupFilter !== 'all') return CATEGORY_GROUP_MAP[e.category] === groupFilter;
      return true;
    });
  }, [events, timeFilter, groupFilter, catFilter, searchCommit]);

  const isDefault = timeFilter === 'all' && groupFilter === 'all' && !searchCommit;

  const Root = retro ? ImageBackground : View;
  const rootProps = retro ? { source: PARCHMENT_BG, resizeMode: 'cover', style: { flex: 1 } } : { style: { flex: 1 } };

  return (
    <Root {...rootProps}>

      {/* ─── Search bar ──────────────────────────────────────────────────── */}
      <View
        style={styles.searchWrap}
        onLayout={(e) => setSearchBarH(e.nativeEvent.layout.height)}
      >
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues, cities…"
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); if (!t) setSearchCommit(null); }}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── Filter area ─────────────────────────────────────────────────── */}
      <View style={styles.eventsFilterArea}>

        {/* Row 1 — time period */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowInner}>
          {FILTERS.map((f) => {
            const active = f.key === timeFilter;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setTimeFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.filterDivider} />

        {/* Row 2 — category group */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowInner}>
          <TouchableOpacity
            style={[styles.filterChip, groupFilter === 'all' && styles.filterChipActive]}
            onPress={() => selectGroup('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, groupFilter === 'all' && styles.filterChipTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          {CATEGORY_GROUPS.map((g) => (
            <TouchableOpacity
              key={g.key}
              style={[styles.filterChip, groupFilter === g.key && styles.filterChipActive]}
              onPress={() => selectGroup(g.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, groupFilter === g.key && styles.filterChipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Row 3 — specific category drill-down (appears only when a group is active) */}
        {activeGroup && (
          <View style={styles.filterDrillDown}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterSubRowInner}>
              <TouchableOpacity
                style={[styles.filterChip, styles.filterChipSm, catFilter === 'all' && styles.filterChipActive]}
                onPress={() => setCatFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, catFilter === 'all' && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {activeGroup.categories.map((cat) => {
                const active = catFilter === cat;
                const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      styles.filterChipSm,
                      active && { backgroundColor: colors.bg, borderColor: colors.text },
                    ]}
                    onPress={() => setCatFilter(active ? 'all' : cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, active && { color: colors.text, fontWeight: '700' }]}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

      </View>
      {/* ─── End filter area ─────────────────────────────────────────────── */}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard item={item} onPress={() => onCardPress(item)} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎟</Text>
            <Text style={styles.emptyText}>
              {isDefault ? 'No events yet' : 'No events match this filter'}
            </Text>
            {isDefault && (
              <Text style={styles.emptySubtext}>Tap + to log your first event</Text>
            )}
          </View>
        }
      />

      {/* ─── Floating autocomplete dropdown ──────────────────────────────── */}
      {showDropdown && (
        <View style={[styles.searchDropdown, { top: searchBarH }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 340 }}
          >
            {/* Your Events */}
            {localMatches.length > 0 && (
              <>
                <Text style={styles.searchDropHeader}>Your Events</Text>
                {localMatches.map((m, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.searchDropRow, i === 0 && styles.searchDropRowFirst]}
                    onPress={() => applyLocalMatch(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.searchDropRowIcon}>
                      {m.kind === 'venue' ? '🏟' : '🏙'}
                    </Text>
                    <View style={styles.searchDropRowBody}>
                      <Text style={styles.searchDropRowLabel} numberOfLines={1}>{m.label}</Text>
                      {m.sub ? (
                        <Text style={styles.searchDropRowSub} numberOfLines={1}>{m.sub}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Places */}
            {(placeResults.length > 0 || isSearching) && (
              <>
                <Text style={[styles.searchDropHeader, localMatches.length > 0 && styles.searchDropHeaderDivided]}>
                  {isSearching && placeResults.length === 0 ? 'Searching places…' : 'Places'}
                </Text>
                {placeResults.map((p, i) => (
                  <TouchableOpacity
                    key={p.id ?? i}
                    style={[styles.searchDropRow, i === 0 && localMatches.length === 0 && styles.searchDropRowFirst]}
                    onPress={() => applyPlaceResult(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.searchDropRowIcon}>📍</Text>
                    <View style={styles.searchDropRowBody}>
                      <Text style={styles.searchDropRowLabel} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.searchDropRowSub} numberOfLines={1}>
                        {p.typeLabel}{p.subtitle ? '  ·  ' + p.subtitle : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddPress} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </Root>
  );
}
