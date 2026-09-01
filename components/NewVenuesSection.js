import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Shared "NEW VENUES DISCOVERED" section for Year in Review and every
// category review card — a venue is "new" when the period being reviewed
// contains the very first time the user ever visited it (see
// utils/yearInReview.js's getNewVenues), whether that period is a calendar
// year (Year in Review) or a FilterBar window (category reviews).
export function NewVenuesSection({ newVenues }) {
  const { styles } = useTheme();
  if (!newVenues || newVenues.count === 0) return null;

  return (
    <View style={styles.yrSectionBlock}>
      <Text style={styles.yrSectionLabel}>NEW VENUES DISCOVERED</Text>
      <Text style={styles.rvNewVenueCount}>{newVenues.count} new venue{newVenues.count === 1 ? '' : 's'}</Text>
      <View style={styles.yrCatList}>
        {newVenues.venues.map((v) => (
          <View key={v.name} style={styles.rvVenueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rvVenueName} numberOfLines={1}>{v.name}</Text>
              {!!v.city && <Text style={styles.rvVenueCity} numberOfLines={1}>{v.city}</Text>}
            </View>
            <Text style={styles.rvNewVenueDate}>{v.firstVisitDateDisplay}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
