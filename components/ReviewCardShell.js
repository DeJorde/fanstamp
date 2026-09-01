import { forwardRef } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

// Same fixed "Wrapped"-style gradient (standard mode) / parchment texture
// (retro mode) background as YearInReviewCard — shared here so every review
// card (Sports/Concert/Comedy/All Events) reads as one family of keepsakes.
const GRADIENT_COLORS = ['#0f0026', '#3d0a6b', '#c2185b'];
const PARCHMENT_BG = require('../assets/parchment.png');

// Captured off-screen for sharing (see utils/shareImage + ReviewModal),
// rendered at a fixed width regardless of device size, the same convention
// as YearInReviewCard/RichShareCard/ShareStatsCard.
export const ReviewCardShell = forwardRef(function ReviewCardShell({ children }, ref) {
  const { styles, retro } = useTheme();
  return (
    <View ref={ref} collapsable={false} style={styles.yrCard}>
      {retro ? (
        <ImageBackground source={PARCHMENT_BG} resizeMode="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient colors={GRADIENT_COLORS} style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.yrContent}>
        {retro && (
          <View style={[styles.shareCardStamp, styles.shareCardStampRetro]}>
            <View style={styles.shareCardStampInner}>
              <Text style={styles.shareCardStampText} numberOfLines={1}>FANSTAMP</Text>
            </View>
          </View>
        )}
        {children}
      </View>
    </View>
  );
});
