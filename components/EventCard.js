import { TouchableOpacity, View, Text, Image } from 'react-native';
import { CategoryBadge } from './CategoryBadge';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';

export function EventCard({ item, onPress }) {
  const { styles } = useTheme();
  const thumb = item.photos && item.photos.length > 0 ? item.photos[0] : null;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardRow}>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.eventName}>{item.name}</Text>
            <CategoryBadge category={item.category} />
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.metaIcon}>📍</Text>
            <View>
              <Text style={styles.venue}>{item.venue}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.date}>{formatDisplayDate(item.date)}</Text>
          </View>
          {item.notes ? (
            <View style={styles.cardMeta}>
              <Text style={styles.metaIcon}>📝</Text>
              <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
            </View>
          ) : null}
        </View>
        {thumb && (
          <Image source={{ uri: thumb }} style={styles.cardThumb} resizeMode="cover" />
        )}
      </View>
    </TouchableOpacity>
  );
}
