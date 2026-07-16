import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function VerifiedBadge() {
  const { styles, retro } = useTheme();
  if (retro) {
    return (
      <View style={styles.verifiedStamp}>
        <View style={styles.verifiedStampInner}>
          <Text style={styles.verifiedStampText}>Verified</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.verifiedBadge}>
      <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
    </View>
  );
}
