import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LEAGUE_ICONS } from '../leagueStadiums';
import { computeBadges } from '../utils/badges';
import { useTheme } from '../context/ThemeContext';
import { ProgressRing } from '../components/ProgressRing';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

export function LeaguesScreen({ events, onSelectLeague }) {
  const { styles, colors, retro } = useTheme();
  const badges = useMemo(() => computeBadges(events), [events]);

  return (
    <ScrollView style={styles.leaguesScroll} contentContainerStyle={styles.leaguesContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.leaguesIntro}>
        {retro
          ? 'An explorer’s atlas of stadiums conquered — one chapter per league.'
          : 'Your stadium passport — track how many home stadiums you’ve visited in each league.'}
      </Text>

      {badges.leagueCompletionist.map((l, i) => (
        <TouchableOpacity
          key={l.league}
          style={[styles.leagueCard, l.complete && styles.leagueCardGold]}
          onPress={() => onSelectLeague(l.league)}
          activeOpacity={0.8}
        >
          <ProgressRing
            size={56}
            strokeWidth={5}
            progress={l.pct}
            color={l.complete ? '#FFD700' : colors.accent}
            trackColor={colors.trackBg}
          >
            <Text style={styles.leagueCardRingEmoji}>{l.complete ? '🏆' : LEAGUE_ICONS[l.league]}</Text>
          </ProgressRing>
          <View style={styles.leagueCardBody}>
            {retro && <Text style={styles.leagueChapterLabel}>Chapter {ROMAN[i] ?? i + 1}</Text>}
            <Text style={styles.leagueCardName}>{LEAGUE_ICONS[l.league]} {l.league}</Text>
            <Text style={styles.leagueCardFraction}>{l.visited}/{l.total} stadiums</Text>
          </View>
          <View style={styles.leagueCardTrailing}>
            <Text style={styles.leagueCardPct}>{Math.round(l.pct * 100)}%</Text>
            <Text style={styles.leagueCardChevron}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
