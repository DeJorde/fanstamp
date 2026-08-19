import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function ProfileModal({ visible, onClose }) {
  const { styles } = useTheme();
  const { user, signOutUser } = useAuth();

  if (!user) return null;

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Your data stays on this device — signing out just stops cloud sync until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOutUser(); onClose(); } },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderBtn} />
          <Text style={styles.modalTitle}>Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalForm}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initial}</Text>
            </View>
            <Text style={styles.profileEmailText}>{user.displayName || user.email}</Text>
            {!!user.displayName && <Text style={styles.profileSyncText}>{user.email}</Text>}
            <View style={styles.profileSyncRow}>
              <View style={styles.profileSyncDot} />
              <Text style={styles.profileSyncText}>Synced to the cloud</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileSignOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
            <Text style={styles.profileSignOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
