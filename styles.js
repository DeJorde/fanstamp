import { StyleSheet, Platform } from 'react-native';

// Old-English-ish serif used across the whole app when retro mode is on.
// Georgia ships with iOS; Android has no Georgia font, so fall back to its
// built-in serif family.
export const RETRO_FONT_FAMILY = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const dark = {
  bg0: '#0d0d0d', bg0Deep: '#080808', bg1: '#111111', bg2: '#1a1a1a', bg3: '#1c1c1c',
  border: '#2a2a2a', borderSubtle: '#1e1e1e', borderFaint: '#222222', borderHairline: '#252525',
  text: '#ffffff', textSecondary: '#cccccc', textTertiary: '#e0e0e0', textBody: '#888888',
  textMuted: '#666666', textDim: '#555555', textFaint: '#444444', textVeryFaint: '#3a3a3a', textGhost: '#333333',
  placeholder: '#444444', trackBg: '#252525',
  accent: '#3a86ff', accentRgb: '58,134,255',
  accentBgSoft: '#1a2e4a', accentBgDeep: '#0d1f3a', accentBorderDeep: '#1a3360', tabToggleBg: '#1a2540',
};

// Parchment/sepia palette used when retro mode is on.
const retro = {
  bg0: '#B8955A', bg0Deep: '#A8854A', bg1: '#C8A96E', bg2: '#D8C08A', bg3: '#DEC894',
  border: '#8B6914', borderSubtle: '#A8894A', borderFaint: '#9A7830', borderHairline: '#C8AA78',
  text: '#3E2000', textSecondary: '#4A2808', textTertiary: '#3E2000', textBody: '#5C3A08',
  textMuted: '#6B4010', textDim: '#7A5810', textFaint: '#8B6914', textVeryFaint: '#9A7830', textGhost: '#AD8A4A',
  placeholder: '#8B6914', trackBg: '#C8AA78',
  accent: '#8B4513', accentRgb: '139,69,19',
  accentBgSoft: '#E8D4A0', accentBgDeep: '#DEC894', accentBorderDeep: '#8B6914', tabToggleBg: '#E8D4A0',
};

export function getPalette(retroMode) {
  return retroMode ? retro : dark;
}

function buildStyles(c) {
  return {
    root: { flex: 1, backgroundColor: c.bg0 },

    header: {
      backgroundColor: c.bg0,
      paddingTop: 64, paddingBottom: 16, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: c.borderSubtle,
      justifyContent: 'flex-end',
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    logoRow: { flexDirection: 'row', alignItems: 'flex-end' },
    headerLogo: { fontSize: 26, fontWeight: '800', color: c.text, letterSpacing: -0.5 },
    headerLogoAccent: { fontSize: 26, fontWeight: '800', color: c.accent, letterSpacing: -0.5 },
    backBtn: { alignSelf: 'flex-start' },
    backBtnText: { fontSize: 17, color: c.accent, fontWeight: '500' },

    retroToggleBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    retroToggleIcon: { fontSize: 17 },

    screen: { flex: 1, backgroundColor: c.bg1 },

    // ── Filter bar (used by MapTab's FilterBar component) ────────────────────────
    filterBarWrap: {
      backgroundColor: c.bg0,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      flexGrow: 0,
    },
    filterBar: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },

    // ── EventsTab filter area ─────────────────────────────────────────────────────
    eventsFilterArea: {
      backgroundColor: c.bg0,
      borderBottomWidth: 1,
      borderBottomColor: c.borderFaint,
    },
    filterRowInner: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    filterDivider: {
      height: 1,
      backgroundColor: c.borderSubtle,
    },
    filterDrillDown: {
      backgroundColor: c.bg0Deep,
      borderTopWidth: 1,
      borderTopColor: c.border,
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
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
    },
    filterChipActive: { backgroundColor: c.accentBgSoft, borderColor: c.accent },
    filterChipText: { fontSize: 13, fontWeight: '500', color: c.textMuted },
    filterChipTextActive: { color: c.accent, fontWeight: '700' },

    // Events list
    list: { padding: 16, paddingBottom: 100, gap: 12 },
    card: { backgroundColor: c.bg2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
    cardRow:  { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    cardBody: { flex: 1, gap: 10 },
    cardThumb: { width: 76, height: 76, borderRadius: 10 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    eventName: { flex: 1, fontSize: 17, fontWeight: '700', color: c.text, lineHeight: 22 },
    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    cardMeta: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    metaIcon: { fontSize: 14, marginTop: 1 },
    venue: { fontSize: 14, fontWeight: '600', color: c.textSecondary },
    location: { fontSize: 13, color: c.textMuted, marginTop: 1 },
    date: { fontSize: 14, color: c.accent, fontWeight: '500' },
    notes: { fontSize: 13, color: c.textBody, flex: 1 },

    emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyIcon: { fontSize: 40, marginBottom: 4 },
    emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
    emptySubtext: { fontSize: 14, color: c.textDim },

    fab: {
      position: 'absolute', bottom: 24, right: 20,
      width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: c.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
    },
    fabText: { fontSize: 28, color: '#ffffff', lineHeight: 32 },

    // Map overlays (mapFilterOverlayRetro/mapEmptyTextRetro already carry their own
    // parchment look tied to the map's own "retro" style — left theme-independent)
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

    // Compass rose (CS=72, CR=36, ARM=22, TIP=5) — part of the map's own retro
    // style, always sepia regardless of the global theme.
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

    // Map callout bubble — native map UI always renders this on a white balloon
    callout: { padding: 4, minWidth: 140 },
    calloutVenue: { fontSize: 14, fontWeight: '700', color: '#1c1c1e', marginBottom: 2 },
    calloutLocation: { fontSize: 12, color: '#636366', marginBottom: 4 },
    calloutCount: { fontSize: 12, fontWeight: '600', color: '#3a86ff' },

    // Detail screen
    detailScroll: { flex: 1 },
    detailContent: { padding: 20, gap: 16, paddingBottom: 48 },
    detailName: { fontSize: 26, fontWeight: '800', color: c.text, lineHeight: 32, letterSpacing: -0.5, marginTop: 8 },
    detailCard: { backgroundColor: c.bg2, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    detailRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    detailRowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
    detailRowBody: { flex: 1, gap: 2 },
    detailRowLabel: { fontSize: 11, fontWeight: '600', color: c.textDim, textTransform: 'uppercase', letterSpacing: 0.6 },
    detailRowValue: { fontSize: 15, color: c.text, fontWeight: '500' },
    detailDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 54 },
    detailSectionLabel: { fontSize: 11, fontWeight: '600', color: c.textDim, textTransform: 'uppercase', letterSpacing: 0.6, padding: 14, paddingBottom: 6 },
    detailNotesText: { fontSize: 15, color: c.textSecondary, lineHeight: 22, padding: 14, paddingTop: 0 },
    editBtn: { backgroundColor: c.bg2, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 16, alignItems: 'center' },
    editBtnText: { fontSize: 16, fontWeight: '600', color: c.text },
    deleteBtn: { backgroundColor: '#2d0f0f', borderRadius: 14, borderWidth: 1, borderColor: '#5c1a1a', padding: 16, alignItems: 'center' },
    deleteBtnText: { fontSize: 16, fontWeight: '600', color: '#ff4d4d' },

    // Tab bar
    tabBar: {
      flexDirection: 'row', backgroundColor: c.bg0,
      borderTopWidth: 1, borderTopColor: c.borderSubtle,
      paddingBottom: 32, paddingTop: 10,
    },
    tabItem: { flex: 1, alignItems: 'center', gap: 3, position: 'relative' },
    tabIcon: { fontSize: 22 },
    tabLabel: { fontSize: 11, color: c.textFaint, fontWeight: '500' },
    tabLabelActive: { color: c.accent, fontWeight: '700' },
    tabIndicator: { position: 'absolute', top: -10, width: 32, height: 2, borderRadius: 1, backgroundColor: c.accent },

    // Modal
    modalRoot: { flex: 1, backgroundColor: c.bg0 },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: c.borderSubtle,
    },
    modalHeaderBtn: { minWidth: 60 },
    modalTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    modalCancelText: { fontSize: 16, color: c.textBody },
    modalSaveText: { fontSize: 16, fontWeight: '700', color: c.accent, textAlign: 'right' },
    modalSaveDisabled: { color: c.textVeryFaint },
    modalForm: { padding: 20, gap: 20, paddingBottom: 60 },
    fieldGroup: { gap: 8 },
    fieldLabel: { fontSize: 12, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    input: {
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, color: c.text,
    },
    inputMultiline: { height: 100, paddingTop: 12 },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg2 },
    categoryChipText: { fontSize: 13, fontWeight: '600', color: c.textDim },
    categoryGroupSection: { gap: 8, marginTop: 4 },
    categoryGroupLabel: {
      fontSize: 10, fontWeight: '700', color: c.textFaint,
      textTransform: 'uppercase', letterSpacing: 1.2,
    },

    filterChipSm: { paddingHorizontal: 10, paddingVertical: 5 },

    // Map custom pins (colors supplied per-marker from CATEGORY_COLORS)
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
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    },
    dateButtonValue: { fontSize: 15, color: c.text },
    dateButtonPlaceholder: { fontSize: 15, color: c.placeholder },
    dateModalBackdrop: {
      flex: 1, justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dateModalSheet: {
      backgroundColor: c.bg2,
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      paddingBottom: 34,
    },
    dateModalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    dateModalCancel: { fontSize: 16, color: c.textBody },
    dateModalDone: { fontSize: 16, fontWeight: '700', color: c.accent },
    dateSpinner: { backgroundColor: c.bg2 },

    // ── Stats tab ──────────────────────────────────────────────────────────────
    statsScroll: { flex: 1 },
    statsContent: { padding: 16, paddingBottom: 56, gap: 10 },
    statsEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },

    statsSectionHeader: {
      fontSize: 11, fontWeight: '700', color: c.textDim,
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginTop: 6, paddingHorizontal: 2,
    },

    // Overview grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statsMetricCard: {
      flex: 1, minWidth: '45%',
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      padding: 16, gap: 2,
    },
    statsMetricIcon:  { fontSize: 22, marginBottom: 6 },
    statsMetricValue: { fontSize: 32, fontWeight: '800', color: c.text, letterSpacing: -1 },
    statsMetricLabel: { fontSize: 12, color: c.textDim, fontWeight: '500', marginTop: 2 },

    // Shared card wrapper
    statsCard: {
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
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
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border,
    },
    statsGroupDot:          { width: 10, height: 10, borderRadius: 5 },
    statsGroupLegendLabel:  { flex: 1, fontSize: 14, color: c.textSecondary, fontWeight: '500' },
    statsGroupLegendCount:  { fontSize: 14, color: c.textMuted, fontWeight: '500', minWidth: 22, textAlign: 'right' },
    statsGroupLegendPct:    { fontSize: 13, color: c.accent, fontWeight: '700', minWidth: 38, textAlign: 'right' },

    // Category ranked list
    statsCatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
    statsCatRank: { fontSize: 12, color: c.textVeryFaint, fontWeight: '700', minWidth: 22 },
    statsCatIcon: { fontSize: 18 },
    statsCatName: { flex: 1, fontSize: 14, color: c.textSecondary, fontWeight: '500' },

    // Venue & city rank rows
    statsRankRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    statsRankNum:  { fontSize: 13, fontWeight: '700', color: c.textVeryFaint, minWidth: 18, textAlign: 'center' },
    statsRankBody: { flex: 1, gap: 2 },
    statsRankName: { fontSize: 14, fontWeight: '600', color: c.textSecondary },
    statsRankSub:  { fontSize: 12, color: c.textDim },
    statsCountPill: {
      backgroundColor: c.accentBgDeep, borderRadius: 12,
      paddingHorizontal: 10, paddingVertical: 4,
      borderWidth: 1, borderColor: c.accentBorderDeep,
    },
    statsCountPillText: { fontSize: 13, fontWeight: '700', color: c.accent },

    // Timeline
    statsTimelineRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
    statsTimelineYear:   { fontSize: 13, fontWeight: '600', color: c.textMuted, minWidth: 42 },
    statsTimelineBarWrap:{ flex: 1, height: 10, backgroundColor: c.trackBg, borderRadius: 5 },
    statsTimelineBar:    { height: 10, backgroundColor: c.accent, borderRadius: 5, minWidth: 4 },
    statsTimelineCount:  { fontSize: 13, fontWeight: '600', color: c.textBody, minWidth: 24, textAlign: 'right' },

    statsDivider:      { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginHorizontal: 14 },
    statsEmptyInCard:  { padding: 16, paddingVertical: 20, color: c.textFaint, fontSize: 14, textAlign: 'center' },

    // Highlights card
    statsHighlightRow:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
    statsHighlightIcon:  { fontSize: 22, marginTop: 2 },
    statsHighlightBody:  { flex: 1, gap: 3 },
    statsHighlightLabel: { fontSize: 11, fontWeight: '600', color: c.textDim, textTransform: 'uppercase', letterSpacing: 0.6 },
    statsHighlightValue: { fontSize: 16, fontWeight: '700', color: c.text },
    statsHighlightSub:   { fontSize: 12, color: c.textDim },

    // Category bars
    statsCatBarWrap: { height: 4, backgroundColor: c.trackBg, borderRadius: 2, overflow: 'hidden' },
    statsCatBar:     { height: 4, borderRadius: 2, minWidth: 4 },

    // Monthly activity histogram (bar color computed inline from c.accentRgb)
    statsMonthGrid:    { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 14, paddingBottom: 10, gap: 3 },
    statsMonthCell:    { flex: 1, alignItems: 'center', gap: 4 },
    statsMonthBarWrap: { height: 44, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
    statsMonthBar:     { width: '80%', borderRadius: 3 },
    statsMonthLabel:   { fontSize: 9, color: c.textVeryFaint, fontWeight: '600' },
    statsMonthCount:   { fontSize: 10, color: c.textMuted, fontWeight: '700' },

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
      backgroundColor: c.bg2, borderRadius: 12,
      borderWidth: 1, borderColor: c.border,
      paddingHorizontal: 16, paddingVertical: 14,
    },
    photoPickerAddIcon: { fontSize: 22, color: c.textFaint },
    photoPickerAddText: { fontSize: 15, color: c.textDim, fontWeight: '500' },

    // ── Detail photo strip ─────────────────────────────────────────────────────
    detailPhotoStrip:        { marginBottom: 4 },
    detailPhotoStripContent: { paddingHorizontal: 20, paddingVertical: 4, gap: 10 },
    detailPhotoThumb: {
      width: 130, height: 130, borderRadius: 12,
      borderWidth: 1, borderColor: c.border,
    },

    // ── Full-screen photo viewer — deliberately theme-independent (black backdrop) ──
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
      backgroundColor: c.bg3,
      borderRadius: 12, borderWidth: 1, borderColor: c.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45, shadowRadius: 10,
      elevation: 8,
    },
    formDropdownRow: {
      paddingHorizontal: 14, paddingVertical: 11,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border,
    },
    formDropdownRowFirst: { borderTopWidth: 0 },
    formDropdownLabel: { fontSize: 14, fontWeight: '600', color: c.textTertiary },
    formDropdownSub:   { fontSize: 12, color: c.textDim, marginTop: 2 },

    // ── Search bar ─────────────────────────────────────────────────────────────
    searchWrap: {
      backgroundColor: c.bg0,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.bg2,
      borderRadius: 12, borderWidth: 1, borderColor: c.border,
      paddingHorizontal: 12, paddingVertical: 10,
    },
    searchIcon:     { fontSize: 14 },
    searchInput:    { flex: 1, fontSize: 15, color: c.text, padding: 0 },
    searchClearBtn: { fontSize: 13, color: c.textDim, fontWeight: '700', paddingHorizontal: 2 },

    // ── Autocomplete dropdown ──────────────────────────────────────────────────
    searchDropdown: {
      position: 'absolute', left: 12, right: 12,
      zIndex: 100, elevation: 20,
      backgroundColor: c.bg3,
      borderRadius: 16, borderWidth: 1, borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.55, shadowRadius: 16,
      overflow: 'hidden',
    },
    searchDropHeader: {
      fontSize: 10, fontWeight: '800', color: c.textFaint,
      textTransform: 'uppercase', letterSpacing: 1.2,
      paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
    },
    searchDropHeaderDivided: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      marginTop: 4,
    },
    searchDropRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 11,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.borderHairline,
    },
    searchDropRowFirst: { borderTopWidth: 0 },
    searchDropRowIcon:  { fontSize: 17, width: 24, textAlign: 'center' },
    searchDropRowBody:  { flex: 1 },
    searchDropRowLabel: { fontSize: 14, fontWeight: '600', color: c.textTertiary },
    searchDropRowSub:   { fontSize: 12, color: c.textDim, marginTop: 2 },
  };
}

export function createStyles(retroMode) {
  const raw = buildStyles(getPalette(retroMode));
  if (!retroMode) return StyleSheet.create(raw);
  const withFont = Object.fromEntries(
    Object.entries(raw).map(([key, style]) => [key, { ...style, fontFamily: RETRO_FONT_FAMILY }])
  );
  return StyleSheet.create(withFont);
}
