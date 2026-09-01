import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { ReviewCardShell } from './ReviewCardShell';
import { useTheme } from '../context/ThemeContext';

function MiniCard({ kind, label, data }) {
  const { styles } = useTheme();
  if (!data) return null;
  const winStyle = kind === 'win';
  return (
    <View style={[styles.rvMiniCard, winStyle ? styles.rvMiniCardWin : styles.rvMiniCardLoss]}>
      <Text style={[styles.rvMiniCardLabel, winStyle ? styles.rvMiniCardLabelWin : styles.rvMiniCardLabelLoss]}>{label}</Text>
      <Text style={styles.rvMiniCardScore} numberOfLines={1}>{data.teamScore}-{data.oppScore} vs {data.opponent}</Text>
      <Text style={styles.rvMiniCardSub} numberOfLines={1}>{data.venue}</Text>
    </View>
  );
}

function BattingLeaders({ battingLeaders, luckyPlayer }) {
  const { styles } = useTheme();
  if (battingLeaders.length === 0) return null;
  return (
    <View style={styles.yrSectionBlock}>
      <Text style={styles.yrSectionLabel}>MLB BATTING LEADERS</Text>
      <View style={styles.yrCatList}>
        {battingLeaders.map((p) => (
          <View key={p.personId} style={styles.rvPlayerRow}>
            <View style={styles.rvPlayerTopRow}>
              <Text style={styles.rvPlayerName} numberOfLines={1}>{p.name}</Text>
              {luckyPlayer?.personId === p.personId && <Text style={styles.rvPlayerLuckyTag}>🍀</Text>}
            </View>
            <Text style={styles.rvPlayerLine} numberOfLines={1}>{p.line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Captured for sharing — see components/ReviewModal + utils/sportsReview.
export const SportsReviewCard = forwardRef(function SportsReviewCard({ review }, ref) {
  const { styles } = useTheme();
  const {
    league, icon, totalGames, stadiums, yourTeam,
    wins, losses, ties, homeGames, awayGames,
    biggestWin, biggestLoss, mlb,
  } = review;

  const hasRecord = !!yourTeam && (wins + losses + ties) > 0;
  const hasHomeAway = !!yourTeam && (homeGames + awayGames) > 0;

  return (
    <ReviewCardShell ref={ref}>
      <Text style={styles.yrEyebrow}>{league} REVIEW</Text>
      <Text style={styles.yrYear}>{icon}</Text>

      <View style={styles.yrStatRow}>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{totalGames}</Text>
          <Text style={styles.yrStatLabel}>Games</Text>
        </View>
        <View style={styles.yrStatBlock}>
          <Text style={styles.yrStatValue}>{stadiums}</Text>
          <Text style={styles.yrStatLabel}>Stadiums</Text>
        </View>
        {hasRecord && (
          <View style={styles.yrStatBlock}>
            <Text style={styles.yrStatValue}>{wins}-{losses}{ties > 0 ? `-${ties}` : ''}</Text>
            <Text style={styles.yrStatLabel}>Record</Text>
          </View>
        )}
      </View>

      {yourTeam && (
        <View style={styles.yrPill}>
          <Text style={styles.yrPillText}>Following: {yourTeam}</Text>
        </View>
      )}

      {hasHomeAway && (
        <View style={styles.yrStatRow}>
          <View style={styles.yrStatBlock}>
            <Text style={styles.yrStatValue}>{homeGames}</Text>
            <Text style={styles.yrStatLabel}>🏠 Home</Text>
          </View>
          <View style={styles.yrStatBlock}>
            <Text style={styles.yrStatValue}>{awayGames}</Text>
            <Text style={styles.yrStatLabel}>🚌 Away</Text>
          </View>
        </View>
      )}

      {(biggestWin || biggestLoss) && (
        <View style={styles.yrSectionBlock}>
          <Text style={styles.yrSectionLabel}>BIGGEST GAMES</Text>
          <View style={styles.rvMiniCardRow}>
            <MiniCard kind="win" label="Biggest Win" data={biggestWin} />
            <MiniCard kind="loss" label="Biggest Loss" data={biggestLoss} />
          </View>
        </View>
      )}

      {mlb && <BattingLeaders battingLeaders={mlb.battingLeaders} luckyPlayer={mlb.luckyPlayer} />}

      <Text style={styles.yrTagline}>Track your journey at FanStamp</Text>
    </ReviewCardShell>
  );
});
