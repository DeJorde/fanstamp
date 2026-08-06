import { ScrollView, TouchableOpacity, View, Text, Image } from 'react-native';
import { useState } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { FullScreenPhotoModal } from './FullScreenPhotoModal';
import { GameStatsCard } from './GameStatsCard';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';

function DetailRow({ icon, label, value }) {
  const { styles } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowIcon}>{icon}</Text>
      <View style={styles.detailRowBody}>
        <Text style={styles.detailRowLabel}>{label}</Text>
        <Text style={styles.detailRowValue}>{value}</Text>
      </View>
    </View>
  );
}

export function DetailScreen({ event, onEdit, onDelete, onRetryStats }) {
  const { styles, colors } = useTheme();
  const [fullPhotoUri, setFullPhotoUri] = useState(null);
  const hasPhotos = event.photos && event.photos.length > 0;

  return (
    <>
      <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>

        {hasPhotos && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.detailPhotoStrip}
            contentContainerStyle={styles.detailPhotoStripContent}
          >
            {event.photos.map((uri, i) => (
              <TouchableOpacity key={i} onPress={() => setFullPhotoUri(uri)} activeOpacity={0.85}>
                <Image source={{ uri }} style={styles.detailPhotoThumb} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <CategoryBadge category={event.category} />
        <Text style={styles.detailName}>{event.name}</Text>

        <View style={styles.detailCard}>
          <DetailRow icon="📍" label="Venue"    value={event.venue} />
          <View style={styles.detailDivider} />
          <DetailRow icon="🏙"  label="Location" value={event.location} />
          <View style={styles.detailDivider} />
          <DetailRow icon="📅" label="Date"     value={formatDisplayDate(event.date)} />
        </View>

        <GameStatsCard event={event} onRetry={onRetryStats} />

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionLabel}>Personal Notes</Text>
          <Text style={[styles.detailNotesText, !event.notes && { color: colors.placeholder }]}>
            {event.notes || 'No notes added.'}
          </Text>
        </View>

        <TouchableOpacity style={styles.editBtn}   onPress={onEdit}   activeOpacity={0.8}>
          <Text style={styles.editBtnText}>✏️  Edit Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>🗑  Delete Event</Text>
        </TouchableOpacity>
      </ScrollView>

      <FullScreenPhotoModal uri={fullPhotoUri} onClose={() => setFullPhotoUri(null)} />
    </>
  );
}
