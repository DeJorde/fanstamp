import { cloneElement, isValidElement, useRef } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { shareViewAsImage } from '../utils/shareImage';
import { useTheme } from '../context/ThemeContext';

// Shared modal chrome for every category review (Sports/Concert/Comedy/All
// Events) — same header/scroll/share-button structure as YearInReviewModal,
// generalized since four near-identical copies of that boilerplate would
// otherwise exist. `children` is expected to be exactly one ReviewCardShell-
// based card element (or a falsy/empty-state node, in which case no Share
// button is shown since there'd be nothing to capture).
export function ReviewModal({ visible, onClose, title, shareCaption, children }) {
  const { styles } = useTheme();
  const cardRef = useRef(null);
  const isCard = isValidElement(children);
  const content = isCard ? cloneElement(children, { ref: cardRef }) : children;

  async function handleShare() {
    if (!cardRef.current) return;
    try {
      await shareViewAsImage(cardRef, shareCaption);
    } catch {
      Alert.alert('Share Failed', 'Could not create the image to share. Please try again.');
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderBtn} />
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.yrModalScroll} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>

        {isCard && (
          <TouchableOpacity style={styles.yrShareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.yrShareBtnText}>📤 Share</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}
