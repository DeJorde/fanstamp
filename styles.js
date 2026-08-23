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

function buildStyles(c, retroMode) {
  return {
    root: { flex: 1, backgroundColor: retroMode ? 'transparent' : c.bg0 },

    // In retro mode this is rendered as an ImageBackground (see App.js), so
    // this backgroundColor only applies in normal mode — the ImageBackground
    // supplies its own texture fill directly, not a passthrough.
    header: {
      backgroundColor: retroMode ? 'transparent' : c.bg0,
      paddingTop: 64, paddingBottom: 16, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: c.borderSubtle,
      justifyContent: 'flex-end',
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },

    // ── Rectangular ink-stamp wordmark — outer + inner rounded-rect border,
    // tilted like it was pressed on at an angle, with "FANSTAMP" set inside.
    // Border and text are always brand red (#CC0000) in both themes — only
    // the faint background fill tint adapts, shifting to sepia in retro so
    // the wash still fits the parchment palette. ───────────────────────────
    logoStamp: {
      width: 160, height: 52, borderRadius: 6,
      borderWidth: 2.5, borderColor: '#CC0000',
      backgroundColor: 'rgba(204, 0, 0, 0.08)',
      alignItems: 'center', justifyContent: 'center',
      transform: [{ rotate: '-8deg' }],
    },
    logoStampRetro: { backgroundColor: 'rgba(139, 105, 20, 0.08)' },
    logoStampInnerRect: {
      position: 'absolute', top: 5, left: 5, right: 5, bottom: 5,
      borderRadius: 3, borderWidth: 1.5, borderColor: '#CC0000',
      alignItems: 'center', justifyContent: 'center',
    },
    logoStampText: {
      fontSize: 18, fontWeight: '800', color: '#CC0000',
      letterSpacing: 2, textTransform: 'uppercase',
    },

    backBtn: { alignSelf: 'flex-start' },
    backBtnText: { fontSize: 17, color: c.accent, fontWeight: '500' },

    retroToggleBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    retroToggleIcon: { fontSize: 17 },

    // Left transparent so each screen's own retro ImageBackground (see the
    // individual screen components) isn't masked by a flat fill here.
    screen: { flex: 1, backgroundColor: retroMode ? 'transparent' : c.bg1 },

    // Aged-paper darkening around the screen edges — four LinearGradient
    // strips (see App.js), each fading from the edge color at the true
    // screen edge to fully transparent toward the center. A flat border
    // color always reads as a hard bar no matter how low its opacity goes;
    // an actual gradient is what makes it read as a soft vignette instead.
    vignetteEdgeTop:    { position: 'absolute', top: 0, left: 0, right: 0, height: 60 },
    vignetteEdgeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
    vignetteEdgeLeft:   { position: 'absolute', top: 0, bottom: 0, left: 0, width: 60 },
    vignetteEdgeRight:  { position: 'absolute', top: 0, bottom: 0, right: 0, width: 60 },

    // ── Filter bar (used by MapTab's FilterBar component) ────────────────────────
    filterBarWrap: {
      backgroundColor: c.bg0,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
      flexGrow: 0,
    },
    // paddingRight is wider than paddingLeft: the map's share button floats
    // fixed at top-right (mapShareBtn, top:14/right:12) over this bar and
    // doesn't scroll with it, so without extra clearance the last chip ends
    // up permanently hidden underneath it even when scrolled fully into view.
    filterBar: { flexDirection: 'row', paddingLeft: 14, paddingRight: 60, paddingVertical: 10, gap: 8 },

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

    // Share button — floats over the filter bar's translucent band, top right,
    // clear of the style/pin toggle stack that starts at top: 60.
    mapShareBtn: {
      position: 'absolute', top: 14, right: 12,
      width: 32, height: 32, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(10,10,10,0.88)',
      borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.45, shadowRadius: 4, elevation: 4,
    },
    mapShareBtnIcon: { fontSize: 15 },

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

    // ── Game Stats card (event detail) ─────────────────────────────────────────
    gameStatsLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    gameStatsLoadingText: { fontSize: 14, color: c.textSecondary },
    gameStatsEmptyText: { fontSize: 14, color: c.textDim, padding: 14, paddingBottom: 4 },
    gameStatsRetryText: { fontSize: 13, fontWeight: '700', color: c.accent, paddingHorizontal: 14, paddingBottom: 14 },
    gameStatsScoreRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, paddingBottom: 12,
    },
    gameStatsScoreTeam: { flex: 1, fontSize: 13, fontWeight: '600', color: c.textSecondary, textAlign: 'center' },
    gameStatsScoreValue: { fontSize: 22, fontWeight: '800', color: c.text, paddingHorizontal: 12 },
    gameStatsStatRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 14, paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.borderFaint,
    },
    gameStatsStatValue: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text, textAlign: 'center' },
    gameStatsStatLabel: {
      flex: 1.4, fontSize: 11, color: c.textDim, textAlign: 'center',
      textTransform: 'uppercase', letterSpacing: 0.4,
    },

    editBtn: { backgroundColor: c.bg2, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 16, alignItems: 'center' },
    editBtnText: { fontSize: 16, fontWeight: '600', color: c.text },
    deleteBtn: { backgroundColor: '#2d0f0f', borderRadius: 14, borderWidth: 1, borderColor: '#5c1a1a', padding: 16, alignItems: 'center' },
    deleteBtnText: { fontSize: 16, fontWeight: '600', color: '#ff4d4d' },

    // Tab bar — transparent in retro mode so the parchment texture shows
    // through behind it instead of a flat tan fill.
    tabBar: {
      flexDirection: 'row', backgroundColor: retroMode ? 'transparent' : c.bg0,
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

    resultChipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    resultChip: {
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.bg2,
    },
    resultChipActive:     { backgroundColor: c.accentBgSoft, borderColor: c.accent },
    resultChipText:       { fontSize: 13, fontWeight: '600', color: c.textDim },
    resultChipTextActive: { color: c.accent },

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

    // Event-count badge overlaid on a venue pin (2+ events only)
    mapPinBadge: {
      position: 'absolute', top: -6, right: -6,
      minWidth: 18, height: 18, borderRadius: 9,
      paddingHorizontal: 3,
      backgroundColor: '#CC0000',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: '#ffffff',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4, shadowRadius: 2, elevation: 5,
    },
    mapPinBadgeClassic: { top: -2, right: -2 },
    mapPinBadgeText: { fontSize: 10, fontWeight: '700', color: '#ffffff' },

    // Classic pin wrapper (teardrop SVG + optional badge)
    mapClassicPinWrap: { width: 30, height: 40, alignItems: 'center', justifyContent: 'flex-start' },

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
    statsHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6,
      backgroundColor: c.bg0,
    },
    yearInReviewBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18,
      backgroundColor: c.accentBgSoft, borderWidth: 1, borderColor: c.accent,
    },
    yearInReviewBtnIcon: { fontSize: 14 },
    yearInReviewBtnText: { fontSize: 13, fontWeight: '700', color: c.accent },
    statsScroll: { flex: 1 },
    statsContent: { padding: 16, paddingBottom: 56, gap: 10 },
    statsEmpty: { alignItems: 'center', paddingVertical: 60, gap: 8 },

    statsSectionHeader: {
      fontSize: 11, fontWeight: '700', color: c.textDim,
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginTop: 6, paddingHorizontal: 2,
    },

    // ── States Visited map ─────────────────────────────────────────────────────
    statesCounter: { fontSize: 14, color: c.textMuted, fontWeight: '600', marginBottom: 8 },
    statesMapWrap: {
      width: '100%', aspectRatio: 975 / 610,
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      overflow: 'hidden',
    },
    statesModalBackdrop: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    },
    statesModalCard: {
      width: '100%', maxWidth: 380, maxHeight: '70%',
      backgroundColor: c.bg1, borderRadius: 20,
      borderWidth: 1, borderColor: c.border,
      padding: 20, gap: 4,
    },
    statesModalTitle:    { fontSize: 19, fontWeight: '800', color: c.text },
    statesModalSubtitle: { fontSize: 13, color: c.textMuted, fontWeight: '600', marginBottom: 8 },
    statesModalList:     { flexGrow: 0 },
    statesModalRow:      { paddingVertical: 10, gap: 2 },
    statesModalEventName: { fontSize: 15, fontWeight: '700', color: c.text },
    statesModalEventSub:  { fontSize: 12, color: c.textDim },
    statesModalCloseBtn: {
      marginTop: 14, alignSelf: 'center',
      paddingHorizontal: 20, paddingVertical: 10,
      backgroundColor: c.bg2, borderRadius: 12,
      borderWidth: 1, borderColor: c.border,
    },
    statesModalCloseText: { fontSize: 14, fontWeight: '700', color: c.accent },

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

    // ── Milestones & badges ────────────────────────────────────────────────────
    badgeGroupLabel: {
      fontSize: 10, fontWeight: '700', color: c.textFaint,
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginTop: 4, paddingHorizontal: 2,
    },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badgeCard: {
      width: '31%', backgroundColor: c.bg2, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: 14, paddingHorizontal: 6,
      alignItems: 'center', gap: 4,
    },
    badgeCardLocked: { opacity: 0.4 },
    badgeIcon:  { fontSize: 26 },
    badgeLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, textAlign: 'center' },
    badgeDate:  { fontSize: 10, color: c.textDim, textAlign: 'center' },

    trophyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    trophyCard: {
      width: '47%', backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: 16, alignItems: 'center', gap: 4,
    },
    // Gold border + glow — reserved for a fully-completed league, so the
    // color is intentionally constant across themes (a trophy is gold either way).
    trophyCardGold: {
      borderColor: '#FFD700', borderWidth: 2,
      shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.85, shadowRadius: 12, elevation: 10,
    },
    trophyIcon:     { fontSize: 22 },
    trophyLeague:   { fontSize: 13, fontWeight: '800', color: c.text, marginTop: 4 },
    trophyFraction: { fontSize: 12, fontWeight: '600', color: c.textMuted },

    // ── Leagues (stadium passport) ──────────────────────────────────────────────
    leaguesScroll:  { flex: 1 },
    leaguesContent: { padding: 16, paddingBottom: 56, gap: 12 },
    leaguesIntro:   { fontSize: 13, color: c.textDim, lineHeight: 18, marginBottom: 2 },

    leagueChapterLabel: {
      fontSize: 9, fontWeight: '700', color: c.textFaint,
      textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 2,
    },
    leagueCard: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border, padding: 14,
    },
    leagueCardGold: {
      borderColor: '#FFD700', borderWidth: 2,
      shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.85, shadowRadius: 12, elevation: 10,
    },
    leagueCardRingEmoji: { fontSize: 22 },
    leagueCardBody:      { flex: 1, gap: 2 },
    leagueCardName:      { fontSize: 17, fontWeight: '800', color: c.text },
    leagueCardFraction:  { fontSize: 13, color: c.textMuted, fontWeight: '500' },
    leagueCardTrailing:  { alignItems: 'flex-end', gap: 2 },
    leagueCardPct:       { fontSize: 15, fontWeight: '800', color: c.accent },
    leagueCardChevron:   { fontSize: 18, color: c.textFaint },

    leagueDetailSubtitle: { fontSize: 14, color: c.textMuted, fontWeight: '600', marginBottom: 4, marginTop: -8 },

    leagueTeamCard: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      backgroundColor: c.bg2, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
      padding: 14,
    },
    leagueTeamCardLocked: { opacity: 0.45 },
    leagueTeamThumb: { width: 64, height: 64, borderRadius: 10 },
    leagueTeamThumbPlaceholder: {
      width: 64, height: 64, borderRadius: 10,
      backgroundColor: c.bg3, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4,
    },
    leagueTeamThumbEmoji: { fontSize: 20 },
    leagueTeamThumbName: {
      fontSize: 8, fontWeight: '600', color: c.textFaint,
      textAlign: 'center', lineHeight: 10,
    },
    leagueTeamBody:    { flex: 1, gap: 4 },
    leagueTeamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leagueTeamStadium: { fontSize: 15, fontWeight: '700', color: c.text, flex: 1 },
    leagueTeamName:    { fontSize: 13, color: c.textSecondary, fontWeight: '500' },
    leagueTeamCity:    { fontSize: 12, color: c.textDim },
    leagueDateChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
    leagueDateChip: {
      backgroundColor: c.bg3, borderRadius: 10,
      borderWidth: 1, borderColor: c.border,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    leagueDateChipText: { fontSize: 11, color: c.textDim, fontWeight: '600' },

    bucketBadge: {
      backgroundColor: c.accentBgSoft, borderRadius: 10,
      paddingHorizontal: 7, paddingVertical: 2,
    },
    bucketBadgeText: { fontSize: 12 },
    bucketRemoveText: { fontSize: 16, color: c.textFaint, fontWeight: '700', paddingHorizontal: 4 },

    // ── League Detail header + share button ──────────────────────────────────
    leagueDetailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    shareBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    shareBtnIcon: { fontSize: 16 },

    // Progress card — the capture target for the league share image
    leagueProgressCard: {
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      padding: 20, gap: 8, alignItems: 'center',
    },
    leagueProgressCardTitle: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    leagueProgressCardFraction: { fontSize: 36, fontWeight: '800', color: c.text, letterSpacing: -1 },
    leagueProgressCardLabel: {
      fontSize: 11, fontWeight: '600', color: c.textDim,
      textTransform: 'uppercase', letterSpacing: 0.8, marginTop: -6,
    },
    leagueProgressBarTrack: {
      alignSelf: 'stretch', height: 10, borderRadius: 5,
      backgroundColor: c.trackBg, overflow: 'hidden', marginTop: 4,
    },
    leagueProgressBarFill: { height: 10, borderRadius: 5, backgroundColor: c.accent },
    leagueProgressCardPct: { fontSize: 13, fontWeight: '700', color: c.accent },

    // ── My Teams (Stats tab) ───────────────────────────────────────────────────
    teamCard: {
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      padding: 16, gap: 10,
    },
    // Favorite gets a touch more room + a warm gold border, same "always gold"
    // convention as trophyCardGold — it's a personal pick, not theme-dependent.
    teamCardFavorite: {
      padding: 20, borderColor: '#FFD700', borderWidth: 2,
      shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
    },
    teamCardTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    teamCardBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    teamCardLeagueBadge: {
      backgroundColor: c.bg3, borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
      fontSize: 11, fontWeight: '700', color: c.textDim,
    },
    teamCardFavoritePill: {
      backgroundColor: '#3a2e00', borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
      fontSize: 11, fontWeight: '700', color: '#FFD700',
    },
    teamCardStarBtn:  { fontSize: 22 },
    teamCardName:     { fontSize: 17, fontWeight: '800', color: c.text },
    teamCardNameLarge: { fontSize: 20 },
    teamCardStatsRow: { flexDirection: 'row' },
    teamCardStat:     { flex: 1, alignItems: 'center', gap: 2 },
    teamCardStatValue: { fontSize: 17, fontWeight: '800', color: c.text },
    teamCardStatLabel: {
      fontSize: 10, fontWeight: '700', color: c.textFaint,
      textTransform: 'uppercase', letterSpacing: 0.6,
    },
    teamCardLabelPill: {
      alignSelf: 'flex-start', borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 5,
    },
    teamCardLabelText: { fontSize: 12, fontWeight: '700' },
    // Fixed colors (not theme-adaptive) — same convention as CATEGORY_COLORS,
    // which already reads consistently in both dark and retro mode.
    teamLabelLucky:     { backgroundColor: '#0d2818' },
    teamLabelLuckyText: { color: '#4ADE80' },
    teamLabelBalanced:     { backgroundColor: '#1a1a2e' },
    teamLabelBalancedText: { color: '#8ab4f8' },
    teamLabelJinx:     { backgroundColor: '#2a0808' },
    teamLabelJinxText: { color: '#ff6b6b' },
    teamLabelUndecided:     { backgroundColor: '#1a1a1a' },
    teamLabelUndecidedText: { color: '#999999' },
    teamLabelRegular:     { backgroundColor: '#1a1a2e' },
    teamLabelRegularText: { color: '#8ab4f8' },
    teamLabelHot:     { backgroundColor: '#0d2818' },
    teamLabelHotText: { color: '#4ADE80' },

    // ── Team Game Log screen ──────────────────────────────────────────────────
    gameLogCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.bg2, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
      padding: 14,
    },
    gameLogBadge: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center',
    },
    gameLogBadgeText: { fontSize: 16, fontWeight: '800' },
    gameLogBadgeWin:     { backgroundColor: '#0d2818' },
    gameLogBadgeWinText: { color: '#4ADE80' },
    gameLogBadgeLoss:     { backgroundColor: '#2a0808' },
    gameLogBadgeLossText: { color: '#ff6b6b' },
    gameLogBadgeTie:     { backgroundColor: '#1a1a2e' },
    gameLogBadgeTieText: { color: '#8ab4f8' },
    gameLogBadgeUnknown:     { backgroundColor: '#1a1a1a' },
    gameLogBadgeUnknownText: { color: '#999999' },
    gameLogBody:     { flex: 1, gap: 2 },
    gameLogOpponent: { fontSize: 15, fontWeight: '700', color: c.text },
    gameLogVenue:    { fontSize: 13, color: c.textSecondary },
    gameLogDate:     { fontSize: 12, color: c.textDim },
    gameLogChevron:  { fontSize: 20, color: c.textFaint, fontWeight: '600' },

    // ── My Player Stats (Team Game Log screen) ────────────────────────────────
    playerStatsSection: { gap: 10, marginBottom: 22 },
    playerStatCard: {
      backgroundColor: c.bg2, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
      padding: 14, gap: 6,
    },
    playerStatTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    playerStatName: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text },
    playerStatPosition: {
      fontSize: 11, fontWeight: '700', color: c.textDim,
      backgroundColor: c.bg3, borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2,
    },
    playerStatLine: { fontSize: 13, color: c.textSecondary },
    playerStatBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
    // Cumulative (multi-game) player card — stat line + running-rate sparkline.
    cumulativeStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    cumulativeStatLine: { flex: 1 },
    playerArrowPill: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    playerArrowText: { fontSize: 12, fontWeight: '800' },
    // Fixed colors (not theme-adaptive) — same convention as gameLogBadgeWin.
    playerArrowUp:        { backgroundColor: '#0d2818' },
    playerArrowUpText:    { color: '#4ADE80' },
    playerArrowDown:      { backgroundColor: '#2a0808' },
    playerArrowDownText:  { color: '#ff6b6b' },
    playerArrowNeutral:     { backgroundColor: '#1a1a1a' },
    playerArrowNeutralText: { color: '#999999' },

    // ── Verified attendance badge ──────────────────────────────────────────────
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    // Fixed colors (not theme-adaptive) — same convention as gameLogBadgeWin.
    verifiedBadge: {
      alignSelf: 'flex-start', backgroundColor: '#0d2818', borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    verifiedBadgeText: { fontSize: 11, fontWeight: '700', color: '#4ADE80' },
    // Retro-only "old passport stamp" look — red ink, rotated, double-ruled
    // border like a real notary/customs stamp. Always these fixed red tones
    // regardless of which palette built this stylesheet, since a screen only
    // ever renders this when retro mode is on.
    verifiedStamp: {
      alignSelf: 'flex-start', borderWidth: 2, borderColor: '#CC0000', borderRadius: 4,
      padding: 2,
      backgroundColor: 'rgba(204, 0, 0, 0.06)',
      transform: [{ rotate: '-6deg' }],
    },
    verifiedStampInner: {
      borderWidth: 1, borderColor: '#CC0000', borderRadius: 2,
      paddingHorizontal: 6, paddingVertical: 1,
    },
    verifiedStampText: {
      fontSize: 11, fontWeight: '400', color: '#CC0000',
      letterSpacing: 1.5, textTransform: 'uppercase',
    },

    // ── Full Team Stats screen (cumulative, sticky-header box-score-reference
    // style table) — reached via the button atop Team Game Log ─────────────────
    fullTeamStatsBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      backgroundColor: c.bg2, borderRadius: 14,
      borderWidth: 1, borderColor: c.border,
      paddingVertical: 12,
    },
    fullTeamStatsBtnText: { fontSize: 15, fontWeight: '700', color: c.accent },
    statTableCard: {
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      overflow: 'hidden', marginBottom: 16,
    },
    statHeaderRowWrap: { backgroundColor: c.bg3, borderBottomWidth: 1, borderBottomColor: c.border },
    statHeaderRow: { flexDirection: 'row' },
    statHeaderText: {
      fontSize: 10, fontWeight: '700', color: c.textDim,
      textTransform: 'uppercase', letterSpacing: 0.4,
    },
    statRow: {
      flexDirection: 'row', alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.borderFaint,
    },
    statRowAlt: { backgroundColor: c.bg3 },
    // Fixed gold highlight (not theme-adaptive) — same convention as trophyCardGold.
    statRowGold: { backgroundColor: 'rgba(255, 215, 0, 0.18)' },
    statColCell: { width: 44, textAlign: 'center', fontSize: 11, paddingVertical: 6 },
    statCellText: { color: c.textSecondary, fontWeight: '600' },
    statNameCell: { width: 148, paddingLeft: 10, paddingRight: 6, justifyContent: 'center' },
    statNameText: { fontSize: 12, fontWeight: '700', color: c.text },
    statSubtext: { fontSize: 10, color: c.textDim },

    // ── Box Score screen (Team Game Log → tap a game) ──────────────────────────
    boxScoreTableCard: {
      backgroundColor: c.bg2, borderRadius: 16,
      borderWidth: 1, borderColor: c.border,
      overflow: 'hidden',
    },
    boxScoreHeaderRow: {
      flexDirection: 'row', backgroundColor: c.bg3,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    boxScoreRow: {
      flexDirection: 'row', alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.borderFaint,
    },
    boxScoreColCell: { width: 48, textAlign: 'center', paddingVertical: 8 },
    boxScoreHeaderText: {
      fontSize: 10, fontWeight: '700', color: c.textDim,
      textTransform: 'uppercase', letterSpacing: 0.4,
    },
    boxScoreCellText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
    boxScoreNameCell: {
      width: 150, flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingLeft: 12, paddingRight: 6,
    },
    boxScoreNameText: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: c.text },
    // Fixed colors (not theme-adaptive) — same convention as gameLogBadgeWin.
    boxScoreTag: {
      fontSize: 9, fontWeight: '800', color: '#3a86ff',
      backgroundColor: '#1a2e4a', borderRadius: 4,
      paddingHorizontal: 4, paddingVertical: 1,
    },

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
    photoFullScrollView: { flex: 1, width: '100%' },
    photoFullZoomContent: { flexGrow: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
    photoFullHint: {
      position: 'absolute', bottom: 42, alignSelf: 'center',
      color: 'rgba(255,255,255,0.6)', fontSize: 12,
    },

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

    // ── Onboarding (first-launch welcome flow) ────────────────────────────────
    onboardingRoot: { flex: 1, backgroundColor: c.bg0 },
    onboardingSkipBtn: {
      position: 'absolute', top: 60, right: 20, zIndex: 10,
      paddingHorizontal: 12, paddingVertical: 8,
    },
    onboardingSkipText: { fontSize: 15, fontWeight: '600', color: c.textMuted },
    onboardingSlide: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 130 },
    onboardingVisualWrap: {
      height: 220, width: '100%',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 36,
    },
    onboardingTitle: {
      fontSize: 24, fontWeight: '800', color: c.text,
      textAlign: 'center', lineHeight: 30, marginBottom: 12,
    },
    onboardingDescription: {
      fontSize: 15, color: c.textSecondary,
      textAlign: 'center', lineHeight: 22, paddingHorizontal: 8,
    },
    onboardingFooter: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48,
      alignItems: 'center', gap: 20,
    },
    onboardingDotsRow: { flexDirection: 'row', gap: 8 },
    onboardingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.trackBg },
    onboardingDotActive: { width: 22, backgroundColor: c.accent },
    onboardingPrimaryBtn: {
      width: '100%', backgroundColor: c.accent,
      borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    },
    onboardingPrimaryBtnText: { fontSize: 17, fontWeight: '700', color: '#ffffff' },

    // Slide 1 — large stamp mark (same double-border tilted rect as the header
    // logo, just bigger; red ink stays fixed across themes like logoStamp).
    onboardingStampLarge: {
      width: 240, height: 82, borderRadius: 10,
      borderWidth: 3.5, borderColor: '#CC0000',
      backgroundColor: 'rgba(204, 0, 0, 0.08)',
      alignItems: 'center', justifyContent: 'center',
      transform: [{ rotate: '-8deg' }],
    },
    onboardingStampLargeRetro: { backgroundColor: 'rgba(139, 105, 20, 0.08)' },
    onboardingStampLargeInner: {
      position: 'absolute', top: 7, left: 7, right: 7, bottom: 7,
      borderRadius: 5, borderWidth: 2, borderColor: '#CC0000',
      alignItems: 'center', justifyContent: 'center',
    },
    onboardingStampLargeText: {
      fontSize: 27, fontWeight: '800', color: '#CC0000',
      letterSpacing: 3, textTransform: 'uppercase',
    },

    // Slide 3 — mock explorer-map panel (compass rose + a couple of pins,
    // standing in for the real MapView so onboarding stays lightweight).
    onboardingMapPanel: {
      width: '100%', height: 200, borderRadius: 20,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      overflow: 'hidden',
    },
    onboardingMapPin: { position: 'absolute' },

    // Slide 4 — trio of progress rings standing in for the stadium passport.
    onboardingRingsRow: {
      flexDirection: 'row', gap: 22,
      justifyContent: 'center', alignItems: 'flex-start',
    },
    onboardingRingCol: { alignItems: 'center', gap: 8 },
    onboardingRingLabel: { fontSize: 12, fontWeight: '700', color: c.textSecondary },

    // ── Auth screen ────────────────────────────────────────────────────────────
    authIntroText: { fontSize: 14, color: c.textSecondary, lineHeight: 20 },
    authErrorText: { fontSize: 13, color: '#ff4d4d', fontWeight: '500' },
    authLinkText: { fontSize: 14, fontWeight: '600', color: c.accent, textAlign: 'center' },
    authGuestText: { fontSize: 14, color: c.textDim, textAlign: 'center', marginTop: 4 },

    // ── Header profile entry point + Profile modal ───────────────────────────
    headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    profileBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    },
    profileBtnSignedIn: { backgroundColor: c.accentBgSoft, borderColor: c.accent },
    profileBtnText: { fontSize: 15, fontWeight: '700', color: c.accent },
    profileBtnIcon: { fontSize: 16 },

    profileHeaderRow: { alignItems: 'center', gap: 10, paddingVertical: 12 },
    profileAvatar: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: c.accentBgSoft, borderWidth: 1, borderColor: c.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    profileAvatarText: { fontSize: 24, fontWeight: '800', color: c.accent },
    profileEmailText: { fontSize: 16, fontWeight: '600', color: c.text },
    profileSyncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    profileSyncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71' },
    profileSyncText: { fontSize: 13, color: c.textDim, fontWeight: '500' },
    profileSignOutBtn: {
      backgroundColor: '#2d0f0f', borderRadius: 14,
      borderWidth: 1, borderColor: '#5c1a1a',
      padding: 16, alignItems: 'center',
    },
    profileSignOutText: { fontSize: 16, fontWeight: '600', color: '#ff4d4d' },

    // ── Shareable stats card (captured off-screen for social sharing —
    // see components/RichShareCard + StatsScreen's handleShareOverview).
    // Fixed dark navy or parchment background regardless of the app's own
    // theme shades, since this is meant to look right posted standalone
    // on Instagram/Twitter, not blend into the app chrome. ──────────────
    shareCard: {
      width: 360,
      paddingVertical: 32, paddingHorizontal: 24,
      borderRadius: 28, alignItems: 'center',
      backgroundColor: retroMode ? c.bg1 : '#1a1a2e',
    },
    shareCardStamp: {
      width: 176, height: 58, borderRadius: 7,
      borderWidth: 3, borderColor: '#CC0000',
      backgroundColor: 'rgba(204, 0, 0, 0.08)',
      alignItems: 'center', justifyContent: 'center',
      transform: [{ rotate: '-8deg' }],
      marginBottom: 22,
    },
    shareCardStampRetro: { backgroundColor: 'rgba(139, 105, 20, 0.08)' },
    shareCardStampInner: {
      position: 'absolute', top: 6, left: 6, right: 6, bottom: 6,
      borderRadius: 4, borderWidth: 1.75, borderColor: '#CC0000',
      alignItems: 'center', justifyContent: 'center',
    },
    shareCardStampText: {
      fontSize: 20, fontWeight: '800', color: '#CC0000',
      letterSpacing: 2, textTransform: 'uppercase',
    },
    shareCardTitle: {
      fontSize: 24, fontWeight: '800', textAlign: 'center',
      color: retroMode ? c.text : '#ffffff',
      marginBottom: 24,
    },
    shareCardGrid: {
      flexDirection: 'row', flexWrap: 'wrap',
      gap: 12, width: '100%',
    },
    shareCardMetric: {
      width: '47%',
      backgroundColor: retroMode ? c.bg2 : '#242444',
      borderRadius: 18,
      borderWidth: 1, borderColor: retroMode ? c.border : '#34345c',
      paddingVertical: 18, paddingHorizontal: 14,
      alignItems: 'center', gap: 4,
    },
    shareCardMetricIcon:  { fontSize: 24, marginBottom: 4 },
    shareCardMetricValue: {
      fontSize: 30, fontWeight: '800', letterSpacing: -1,
      color: retroMode ? c.text : '#ffffff',
    },
    shareCardMetricLabel: {
      fontSize: 12, fontWeight: '600', textAlign: 'center',
      color: retroMode ? c.textDim : '#9a9ac0',
    },
    shareCardTagline: {
      marginTop: 26, fontSize: 13, fontWeight: '600', textAlign: 'center',
      color: retroMode ? c.textMuted : '#7a7aae',
    },

    // ── Rich Share Card additions (components/RichShareCard) ─────────────────────
    richShareUserName: {
      fontSize: 14, fontWeight: '600', textAlign: 'center',
      color: retroMode ? c.textSecondary : '#b8b8dc',
      marginTop: -14, marginBottom: 20,
    },
    richShareMapWrap: {
      width: '100%', height: 140, borderRadius: 18, overflow: 'hidden',
      marginBottom: 18,
      borderWidth: 1, borderColor: retroMode ? c.border : '#34345c',
    },
    richShareMapInner: { flex: 1 },
    richShareBlock: { width: '100%', marginTop: 18, gap: 8 },
    richShareSectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 1,
      color: retroMode ? c.textDim : '#8a8ac0',
    },
    richShareVenueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    richShareVenueRank: {
      fontSize: 13, fontWeight: '800', width: 18, textAlign: 'center',
      color: retroMode ? c.accent : '#7a7aff',
    },
    richShareVenueName: {
      flex: 1, fontSize: 14, fontWeight: '600',
      color: retroMode ? c.text : '#ffffff',
    },
    richShareVenueCount: {
      fontSize: 13, fontWeight: '700',
      color: retroMode ? c.textDim : '#9a9ac0',
    },
    richShareLuckyBlock: {
      backgroundColor: retroMode ? c.bg2 : '#242444',
      borderRadius: 16, borderWidth: 1, borderColor: retroMode ? c.border : '#34345c',
      padding: 14, gap: 4,
    },
    richShareLuckyName: {
      fontSize: 15, fontWeight: '700',
      color: retroMode ? c.text : '#ffffff',
    },
    richShareLuckyLine: {
      fontSize: 12, fontWeight: '500',
      color: retroMode ? c.textMuted : '#9a9ac0',
    },

    // ── Year in Review (components/YearInReviewCard + YearInReviewModal) ─────────
    // Fixed bold gradient card, theme-independent by design (see the card's
    // own comment) — only the surrounding modal chrome below follows c.*.
    yrCard: {
      width: 340, borderRadius: 28, overflow: 'hidden', alignSelf: 'center',
    },
    yrContent: { padding: 26, alignItems: 'center' },
    yrEyebrow: {
      fontSize: 12, fontWeight: '800', letterSpacing: 3,
      color: 'rgba(255,255,255,0.65)', marginBottom: 4,
    },
    yrYear: {
      fontSize: 56, fontWeight: '900', color: '#ffffff',
      letterSpacing: -1, marginBottom: 18,
    },
    yrStatRow: {
      flexDirection: 'row', width: '100%', justifyContent: 'space-around',
      marginBottom: 16,
    },
    yrStatBlock: { alignItems: 'center', gap: 2 },
    yrStatValue: { fontSize: 30, fontWeight: '800', color: '#ffffff' },
    yrStatLabel: {
      fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)',
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    yrPill: {
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
      paddingVertical: 8, paddingHorizontal: 16, marginBottom: 4,
    },
    yrPillText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
    yrBiggestBlock: { width: '100%', marginTop: 20, gap: 8 },
    yrSectionLabel: {
      fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
      color: 'rgba(255,255,255,0.6)',
    },
    yrBiggestName: { fontSize: 17, fontWeight: '800', color: '#ffffff' },
    yrBiggestSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
    yrMonthGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    yrMonthCell: { flex: 1, alignItems: 'center', gap: 4 },
    yrMonthBarWrap: { height: 56, width: '70%', justifyContent: 'flex-end', alignItems: 'center' },
    yrMonthBar: { width: '100%', borderRadius: 3, backgroundColor: '#ff4fa3' },
    yrMonthLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
    yrMilestoneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    yrMilestoneChip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
      paddingVertical: 6, paddingHorizontal: 10, maxWidth: '100%',
    },
    yrMilestoneIcon: { fontSize: 14 },
    yrMilestoneLabel: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
    yrTagline: {
      marginTop: 24, fontSize: 12, fontWeight: '600', textAlign: 'center',
      color: 'rgba(255,255,255,0.6)',
    },

    // Modal chrome around the Year in Review card — follows the app's own
    // theme (unlike the card itself), same as any other modal.
    yrPickerWrap: {
      flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.borderSubtle,
    },
    yrPickerRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    yrPickerChip: {
      borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7,
      backgroundColor: c.bg2, borderWidth: 1, borderColor: c.border,
    },
    yrPickerChipActive: { backgroundColor: c.accentBgSoft, borderColor: c.accent },
    yrPickerChipText: { fontSize: 14, fontWeight: '600', color: c.textMuted },
    yrPickerChipTextActive: { color: c.accent, fontWeight: '800' },
    yrModalScroll: { alignItems: 'center', padding: 20, paddingBottom: 12 },
    yrShareBtn: {
      marginHorizontal: 20, marginBottom: 20, marginTop: 4,
      paddingVertical: 15, borderRadius: 16,
      backgroundColor: c.accent, alignItems: 'center',
    },
    yrShareBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  };
}

export function createStyles(retroMode) {
  const raw = buildStyles(getPalette(retroMode), retroMode);
  if (!retroMode) return StyleSheet.create(raw);
  const withFont = Object.fromEntries(
    Object.entries(raw).map(([key, style]) => [key, { ...style, fontFamily: RETRO_FONT_FAMILY }])
  );
  return StyleSheet.create(withFont);
}
