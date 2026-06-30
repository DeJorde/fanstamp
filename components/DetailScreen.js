import { ScrollView, TouchableOpacity, View, Text, Image, Modal } from 'react-native';
import { useState } from 'react';
import { CategoryBadge } from './CategoryBadge';
import { formatDisplayDate } from '../utils/dates';
import { styles } from '../styles';

function FullScreenPhotoModal({ uri, onClose }) {
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.photoFullScreen}>
        <TouchableOpacity style={styles.photoFullClose} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.photoFullCloseText}>✕</Text>
        </TouchableOpacity>
        {uri ? (
          <Image source={{ uri }} style={styles.photoFullImage} resizeMode="contain" />
        ) : null}
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value }) {
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

export function DetailScreen({ event, onEdit, onDelete }) {
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

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionLabel}>Personal Notes</Text>
          <Text style={[styles.detailNotesText, !event.notes && { color: '#444' }]}>
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
