import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { EventCard } from './EventCard';
import { CompassRose } from './CompassRose';
import { ProgressRing } from './ProgressRing';
import { LEAGUE_ICONS } from '../leagueStadiums';

// Fabricated sample data for the slide previews below — never persisted,
// just standing in so onboarding can show real app components in action.
const MOCK_EVENT = {
  id: 'onboarding-mock',
  name: 'Dodgers vs. Giants',
  venue: 'Dodger Stadium',
  location: 'Los Angeles, CA',
  date: '2026-08-14',
  category: 'MLB',
  notes: 'Walk-off win in the 9th!',
  verified: true,
  photos: [],
};

const MOCK_RINGS = [
  { league: 'MLB', pct: 0.4, gold: false },
  { league: 'NFL', pct: 0.75, gold: false },
  { league: 'NBA', pct: 1, gold: true },
];

const MOCK_PINS = [
  { top: '28%', left: '20%' },
  { top: '55%', left: '48%' },
  { top: '35%', left: '74%' },
  { top: '68%', left: '30%' },
];

export function OnboardingScreen({ onComplete }) {
  const { styles, colors, retro } = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slides = [
    {
      key: 'welcome',
      visual: (
        <View style={[styles.onboardingStampLarge, retro && styles.onboardingStampLargeRetro]}>
          <View style={styles.onboardingStampLargeInner}>
            <Text style={styles.onboardingStampLargeText} numberOfLines={1}>FANSTAMP</Text>
          </View>
        </View>
      ),
      title: 'Your Live Event Journey, Stamped.',
      description: 'FanStamp is your passport for every game, concert, and show — log where you\'ve been, track your teams, and watch your collection grow.',
    },
    {
      key: 'events',
      visual: <EventCard item={MOCK_EVENT} onPress={() => {}} />,
      title: 'Log every game, concert, and show you attend',
      description: 'Add the venue, date, and category in seconds, then attach photos and notes to remember how it went.',
    },
    {
      key: 'map',
      visual: (
        <View style={styles.onboardingMapPanel}>
          {MOCK_PINS.map((pin, i) => (
            <View key={i} style={[styles.mapPin, styles.onboardingMapPin, { top: pin.top, left: pin.left, backgroundColor: colors.accentBgSoft, borderColor: colors.accent }]}>
              <Text style={styles.mapPinIcon}>📍</Text>
            </View>
          ))}
          <CompassRose />
        </View>
      ),
      title: 'See everywhere you\'ve been on an explorer map',
      description: 'Every venue you log drops a pin — zoom out to watch your personal map of live events fill in over time.',
    },
    {
      key: 'leagues',
      visual: (
        <View style={styles.onboardingRingsRow}>
          {MOCK_RINGS.map((r) => (
            <View key={r.league} style={styles.onboardingRingCol}>
              <ProgressRing
                size={72}
                strokeWidth={6}
                progress={r.pct}
                color={r.gold ? '#FFD700' : colors.accent}
                trackColor={colors.trackBg}
              >
                <Text style={styles.leagueCardRingEmoji}>{r.gold ? '🏆' : LEAGUE_ICONS[r.league]}</Text>
              </ProgressRing>
              <Text style={styles.onboardingRingLabel}>{r.league}</Text>
            </View>
          ))}
        </View>
      ),
      title: 'Complete your stadium passport',
      description: 'Track your progress toward visiting every home stadium in a league, and unlock a trophy chapter when you complete it.',
    },
  ];

  const isLast = index === slides.length - 1;

  function goToIndex(next) {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  }

  function handleScrollEnd(e) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(next);
  }

  function handleNext() {
    if (isLast) onComplete();
    else goToIndex(index + 1);
  }

  return (
    <View style={styles.onboardingRoot}>
      {!isLast && (
        <TouchableOpacity style={styles.onboardingSkipBtn} onPress={onComplete} activeOpacity={0.7}>
          <Text style={styles.onboardingSkipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.onboardingSlide, { width }]}>
            <View style={styles.onboardingVisualWrap}>{slide.visual}</View>
            <Text style={styles.onboardingTitle}>{slide.title}</Text>
            <Text style={styles.onboardingDescription}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.onboardingFooter}>
        <View style={styles.onboardingDotsRow}>
          {slides.map((slide, i) => (
            <View key={slide.key} style={[styles.onboardingDot, i === index && styles.onboardingDotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.onboardingPrimaryBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.onboardingPrimaryBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
