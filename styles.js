import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d0d' },

  header: {
    backgroundColor: '#0d0d0d',
    paddingTop: 64, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
    justifyContent: 'flex-end',
  },
  logoRow: { flexDirection: 'row', alignItems: 'flex-end' },
  headerLogo: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  headerLogoAccent: { fontSize: 26, fontWeight: '800', color: '#3a86ff', letterSpacing: -0.5 },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: { fontSize: 17, color: '#3a86ff', fontWeight: '500' },

  screen: { flex: 1, backgroundColor: '#111111' },

  // ── Filter bar (used by MapTab's FilterBar component) ────────────────────────
  filterBarWrap: {
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    flexGrow: 0,
  },
  filterBar: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },

  // ── EventsTab filter area ─────────────────────────────────────────────────────
  eventsFilterArea: {
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  filterRowInner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#1e1e1e',
  },
  filterDrillDown: {
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  filterSubRowInner: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 6,
  },

  // ── Shared chip styles ────────────────────────────────────────────────────────
  filterChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
  },
  filterChipActive: { backgroundColor: '#1a2e4a', borderColor: '#3a86ff' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#666666' },
  filterChipTextActive: { color: '#3a86ff', fontWeight: '700' },

  // Events list
  list: { padding: 16, paddingBottom: 100, gap: 12 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  cardRow:  { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardBody: { flex: 1, gap: 10 },
  cardThumb: { width: 76, height: 76, borderRadius: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  eventName: { flex: 1, fontSize: 17, fontWeight: '700', color: '#ffffff', lineHeight: 22 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  metaIcon: { fontSize: 14, marginTop: 1 },
  venue: { fontSize: 14, fontWeight: '600', color: '#cccccc' },
  location: { fontSize: 13, color: '#666666', marginTop: 1 },
  date: { fontSize: 14, color: '#3a86ff', fontWeight: '500' },
  notes: { fontSize: 13, color: '#888888', flex: 1 },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  emptySubtext: { fontSize: 14, color: '#555555' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#3a86ff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3a86ff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#ffffff', lineHeight: 32 },

  // Map overlays
  mapFilterOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,13,13,0.82)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  mapFilterOverlayRetro: {
    backgroundColor: 'rgba(60,30,0,0.78)',
    borderBottomColor: 'rgba(139,105,20,0.4)',
  },

  // Style toggle and pin-mode toggle — both top-right
  mapToggle: {
    position: 'absolute', top: 60, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.88)',
    borderRadius: 20, padding: 3,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45, shadowRadius: 4, elevation: 4,
    gap: 1,
  },
  mapToggleOption: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 4,
    borderRadius: 16,
  },
  mapToggleOptionActive: {
    backgroundColor: '#1a2540',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#3a86ff',
  },
  mapToggleEmoji: { fontSize: 12 },
  mapToggleLabel: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.3 },

  mapPinToggle: {
    position: 'absolute', top: 96, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,10,0.88)',
    borderRadius: 20, padding: 3,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45, shadowRadius: 4, elevation: 4,
    gap: 1,
  },

  mapEmptyOverlay: { position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' },
  mapEmptyText: {
    backgroundColor: 'rgba(0,0,0,0.7)', color: '#aaaaaa',
    fontSize: 13, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  mapEmptyTextRetro: {
    backgroundColor: 'rgba(60,30,0,0.75)', color: '#C8AA78',
  },

  // Compass rose (CS=72, CR=36, ARM=22, TIP=5)
  compassWrap: {
    position: 'absolute', bottom: 52, right: 14,
    width: 72, height: 72,
  },
  compassRing: {
    position: 'absolute', top: 0, left: 0, width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 1, borderColor: 'rgba(62,32,0,0.22)',
    backgroundColor: 'rgba(184,149,90,0.07)',
  },
  // N — dark sepia (north is traditionally the darkest point)
  compassArmN: {
    position: 'absolute',
    top: 36 - 22, left: 36 - 5,
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 22,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#2E1400',
  },
  compassArmS: {
    position: 'absolute',
    top: 36, left: 36 - 5,
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 22,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#8B6914',
  },
  compassArmE: {
    position: 'absolute',
    top: 36 - 5, left: 36,
    width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 22,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderLeftColor: '#8B6914',
  },
  compassArmW: {
    position: 'absolute',
    top: 36 - 5, left: 36 - 22,
    width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderRightWidth: 22,
    borderTopColor: 'transparent', borderBottomColor: 'transparent',
    borderRightColor: '#8B6914',
  },
  // Thin ordinal marks centred on the compass
  compassOrdinal: {
    position: 'absolute',
    top: 36 - 11, left: 36 - 1.5,
    width: 3, height: 22,
    backgroundColor: '#9A7830',
    opacity: 0.65,
  },
  compassCenter: {
    position: 'absolute',
    top: 36 - 5, left: 36 - 5,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#B8955A',
    borderWidth: 1.5, borderColor: '#2E1400',
  },
  compassLabel: {
    position: 'absolute',
    color: '#3E2000', fontSize: 8, fontWeight: '800', letterSpacing: 1.5,
  },

  callout: { padding: 4, minWidth: 140 },
  calloutVenue: { fontSize: 14, fontWeight: '700', color: '#1c1c1e', marginBottom: 2 },
  calloutLocation: { fontSize: 12, color: '#636366', marginBottom: 4 },
  calloutCount: { fontSize: 12, fontWeight: '600', color: '#3a86ff' },

  // Detail screen
  detailScroll: { flex: 1 },
  detailContent: { padding: 20, gap: 16, paddingBottom: 48 },
  detailName: { fontSize: 26, fontWeight: '800', color: '#ffffff', lineHeight: 32, letterSpacing: -0.5, marginTop: 8 },
  detailCard: { backgroundColor: '#1a1a1a', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  detailRowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  detailRowBody: { flex: 1, gap: 2 },
  detailRowLabel: { fontSize: 11, fontWeight: '600', color: '#555555', textTransform: 'uppercase', letterSpacing: 0.6 },
  detailRowValue: { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  detailDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#2a2a2a', marginLeft: 54 },
  detailSectionLabel: { fontSize: 11, fontWeight: '600', color: '#555555', textTransform: 'uppercase', letterSpacing: 0.6, padding: 14, paddingBottom: 6 },
  detailNotesText: { fontSize: 15, color: '#cccccc', lineHeight: 22, padding: 14, paddingTop: 0 },
  editBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, borderWidth: 1, borderColor: '#2a2a2a', padding: 16, alignItems: 'center' },
  editBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  deleteBtn: { backgroundColor: '#2d0f0f', borderRadius: 14, borderWidth: 1, borderColor: '#5c1a1a', padding: 16, alignItems: 'center' },
  deleteBtnText: { fontSize: 16, fontWeight: '600', color: '#ff4d4d' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#0d0d0d',
    borderTopWidth: 1, borderTopColor: '#1e1e1e',
    paddingBottom: 32, paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, position: 'relative' },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: '#444444', fontWeight: '500' },
  tabLabelActive: { color: '#3a86ff', fontWeight: '700' },
  tabIndicator: { position: 'absolute', top: -10, width: 32, height: 2, borderRadius: 1, backgroundColor: '#3a86ff' },

  // Modal
  modalRoot: { flex: 1, backgroundColor: '#0d0d0d' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  modalHeaderBtn: { minWidth: 60 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  modalCancelText: { fontSize: 16, color: '#888888' },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: '#3a86ff', textAlign: 'right' },
  modalSaveDisabled: { color: '#333333' },
  modalForm: { padding: 20, gap: 20, paddingBottom: 60 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#666666', textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#ffffff',
  },
  inputMultiline: { height: 100, paddingTop: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#555555' },
  categoryGroupSection: { gap: 8, marginTop: 4 },
  categoryGroupLabel: {
    fontSize: 10, fontWeight: '700', color: '#444444',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },

  filterChipSm: { paddingHorizontal: 10, paddingVertical: 5 },

  // Map custom pins
  mapPin: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, shadowRadius: 3, elevation: 4,
  },
  mapPinIcon: { fontSize: 16 },
  calloutCategory: { fontSize: 12, fontWeight: '600', marginBottom: 2 },

  // Date picker
  dateButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateButtonValue: { fontSize: 15, color: '#ffffff' },
  dateButtonPlaceholder: { fontSize: 15, color: '#444' },
  dateModalBackdrop: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dateModalSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  dateModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  dateModalCancel: { fontSize: 16, color: '#888888' },
  dateModalDone: { fontSize: 16, fontWeight: '700', color: '#3a86ff' },
  dateSpinner: { backgroundColor: '#1a1a1a' },

  // ── Stats tab ──────────────────────────────────────────────────────────────
  statsScroll: { flex: 1 },
  statsContent: { padding: 16, paddingBottom: 56, gap: 10 },
  statsEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },

  statsSectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#555555',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginTop: 6, paddingHorizontal: 2,
  },

  // Overview grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statsMetricCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: '#1a1a1a', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
    padding: 16, gap: 2,
  },
  statsMetricIcon:  { fontSize: 22, marginBottom: 6 },
  statsMetricValue: { fontSize: 32, fontWeight: '800', color: '#ffffff', letterSpacing: -1 },
  statsMetricLabel: { fontSize: 12, color: '#555555', fontWeight: '500', marginTop: 2 },

  // Shared card wrapper
  statsCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
    overflow: 'hidden',
  },

  // Group breakdown bar
  statsGroupBar: {
    flexDirection: 'row', height: 12, borderRadius: 6,
    overflow: 'hidden', margin: 16, marginBottom: 8,
  },
  statsGroupBarSegment: { height: 12 },
  statsGroupLegendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2a2a2a',
  },
  statsGroupDot:          { width: 10, height: 10, borderRadius: 5 },
  statsGroupLegendLabel:  { flex: 1, fontSize: 14, color: '#cccccc', fontWeight: '500' },
  statsGroupLegendCount:  { fontSize: 14, color: '#666666', fontWeight: '500', minWidth: 22, textAlign: 'right' },
  statsGroupLegendPct:    { fontSize: 13, color: '#3a86ff', fontWeight: '700', minWidth: 38, textAlign: 'right' },

  // Category ranked list
  statsCatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  statsCatRank: { fontSize: 12, color: '#3a3a3a', fontWeight: '700', minWidth: 22 },
  statsCatIcon: { fontSize: 18 },
  statsCatName: { flex: 1, fontSize: 14, color: '#cccccc', fontWeight: '500' },

  // Venue & city rank rows
  statsRankRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  statsRankNum:  { fontSize: 13, fontWeight: '700', color: '#333333', minWidth: 18, textAlign: 'center' },
  statsRankBody: { flex: 1, gap: 2 },
  statsRankName: { fontSize: 14, fontWeight: '600', color: '#cccccc' },
  statsRankSub:  { fontSize: 12, color: '#555555' },
  statsCountPill: {
    backgroundColor: '#0d1f3a', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#1a3360',
  },
  statsCountPillText: { fontSize: 13, fontWeight: '700', color: '#3a86ff' },

  // Timeline
  statsTimelineRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  statsTimelineYear:   { fontSize: 13, fontWeight: '600', color: '#666666', minWidth: 42 },
  statsTimelineBarWrap:{ flex: 1, height: 10, backgroundColor: '#252525', borderRadius: 5 },
  statsTimelineBar:    { height: 10, backgroundColor: '#3a86ff', borderRadius: 5, minWidth: 4 },
  statsTimelineCount:  { fontSize: 13, fontWeight: '600', color: '#888888', minWidth: 24, textAlign: 'right' },

  statsDivider:      { height: StyleSheet.hairlineWidth, backgroundColor: '#2a2a2a', marginHorizontal: 14 },
  statsEmptyInCard:  { padding: 16, paddingVertical: 20, color: '#444444', fontSize: 14, textAlign: 'center' },

  // Highlights card
  statsHighlightRow:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  statsHighlightIcon:  { fontSize: 22, marginTop: 2 },
  statsHighlightBody:  { flex: 1, gap: 3 },
  statsHighlightLabel: { fontSize: 11, fontWeight: '600', color: '#555555', textTransform: 'uppercase', letterSpacing: 0.6 },
  statsHighlightValue: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  statsHighlightSub:   { fontSize: 12, color: '#555555' },

  // Category bars
  statsCatBarWrap: { height: 4, backgroundColor: '#252525', borderRadius: 2, overflow: 'hidden' },
  statsCatBar:     { height: 4, borderRadius: 2, minWidth: 4 },

  // Monthly activity histogram
  statsMonthGrid:    { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 14, paddingBottom: 10, gap: 3 },
  statsMonthCell:    { flex: 1, alignItems: 'center', gap: 4 },
  statsMonthBarWrap: { height: 44, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  statsMonthBar:     { width: '80%', borderRadius: 3 },
  statsMonthLabel:   { fontSize: 9, color: '#3a3a3a', fontWeight: '600' },
  statsMonthCount:   { fontSize: 10, color: '#666666', fontWeight: '700' },

  // ── Photo picker (form) ────────────────────────────────────────────────────
  photoPickerRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoPickerThumbWrap: { position: 'relative', width: 90, height: 90 },
  photoPickerThumb:     { width: 90, height: 90, borderRadius: 10 },
  photoPickerRemove: {
    position: 'absolute', top: -7, right: -7,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.4, shadowRadius: 2, elevation: 3,
  },
  photoPickerRemoveText: { color: '#ffffff', fontSize: 11, fontWeight: '800', lineHeight: 14 },
  photoPickerAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1a1a1a', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  photoPickerAddIcon: { fontSize: 22, color: '#444444' },
  photoPickerAddText: { fontSize: 15, color: '#555555', fontWeight: '500' },

  // ── Detail photo strip ─────────────────────────────────────────────────────
  detailPhotoStrip:        { marginBottom: 4 },
  detailPhotoStripContent: { paddingHorizontal: 20, paddingVertical: 4, gap: 10 },
  detailPhotoThumb: {
    width: 130, height: 130, borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
  },

  // ── Full-screen photo viewer ───────────────────────────────────────────────
  photoFullScreen: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.96)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoFullClose: {
    position: 'absolute', top: 58, right: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  photoFullCloseText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  photoFullImage:     { width: '100%', height: '82%' },

  // ── Form autocomplete dropdown ─────────────────────────────────────────────
  formDropdown: {
    marginTop: 4,
    backgroundColor: '#1c1c1c',
    borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 10,
    elevation: 8,
  },
  formDropdownRow: {
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2a2a2a',
  },
  formDropdownRowFirst: { borderTopWidth: 0 },
  formDropdownLabel: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  formDropdownSub:   { fontSize: 12, color: '#555555', marginTop: 2 },

  // ── Search bar ─────────────────────────────────────────────────────────────
  searchWrap: {
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchIcon:     { fontSize: 14 },
  searchInput:    { flex: 1, fontSize: 15, color: '#ffffff', padding: 0 },
  searchClearBtn: { fontSize: 13, color: '#555555', fontWeight: '700', paddingHorizontal: 2 },

  // ── Autocomplete dropdown ──────────────────────────────────────────────────
  searchDropdown: {
    position: 'absolute', left: 12, right: 12,
    zIndex: 100, elevation: 20,
    backgroundColor: '#1c1c1c',
    borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55, shadowRadius: 16,
    overflow: 'hidden',
  },
  searchDropHeader: {
    fontSize: 10, fontWeight: '800', color: '#444444',
    textTransform: 'uppercase', letterSpacing: 1.2,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
  },
  searchDropHeaderDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
    marginTop: 4,
  },
  searchDropRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#252525',
  },
  searchDropRowFirst: { borderTopWidth: 0 },
  searchDropRowIcon:  { fontSize: 17, width: 24, textAlign: 'center' },
  searchDropRowBody:  { flex: 1 },
  searchDropRowLabel: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  searchDropRowSub:   { fontSize: 12, color: '#555555', marginTop: 2 },
});
