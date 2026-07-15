import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Pinch-to-zoom comes from ScrollView's built-in maximumZoomScale (core RN,
// no extra dependency) — this is the only zoom mechanism available without
// a native rebuild, but it's genuinely native pinch/pan on both platforms.
export function FullScreenPhotoModal({ uri, onClose }) {
  const { styles } = useTheme();
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.photoFullScreen}>
        <TouchableOpacity style={styles.photoFullClose} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.photoFullCloseText}>✕</Text>
        </TouchableOpacity>
        {uri ? (
          <ScrollView
            style={styles.photoFullScrollView}
            contentContainerStyle={styles.photoFullZoomContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image source={{ uri }} style={styles.photoFullImage} resizeMode="contain" />
          </ScrollView>
        ) : null}
        <Text style={styles.photoFullHint}>Pinch to zoom</Text>
      </View>
    </Modal>
  );
}
