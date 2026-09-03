import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFollowCounts, setPrivacy, subscribeToFriendProfile } from '../utils/socialSync';
import { FollowListModal } from './FollowListModal';

const PRIVACY_OPTIONS = [
  { key: 'public',  label: 'Public' },
  { key: 'friends', label: 'Friends Only' },
  { key: 'private', label: 'Private' },
];

export function ProfileModal({ visible, onClose, onOpenFriend }) {
  const { styles } = useTheme();
  const { user, signOutUser } = useAuth();
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [privacy, setPrivacyState] = useState('public');
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null

  useEffect(() => {
    if (!visible || !user) return;
    getFollowCounts(user.uid).then(setCounts).catch(() => {});
    return subscribeToFriendProfile(user.uid, (profile) => {
      if (profile?.privacy) setPrivacyState(profile.privacy);
    });
  }, [visible, user?.uid]);

  if (!user) return null;

  const initial = (user.displayName || user.email || '?').trim().charAt(0).toUpperCase();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Your data stays on this device — signing out just stops cloud sync until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOutUser(); onClose(); } },
    ]);
  }

  function handlePrivacyChange(next) {
    setPrivacyState(next);
    setPrivacy(user.uid, next).catch((err) => console.log('[FanStamp] privacy update failed:', err));
  }

  // Following/unfollowing from inside FollowListModal can change my own
  // counts (e.g. following someone back from my Followers list) — refetch
  // on close rather than wiring up a live listener just for this modal.
  function closeListModal() {
    setListModal(null);
    getFollowCounts(user.uid).then(setCounts).catch(() => {});
  }

  function handleSelectFriend(uid) {
    setListModal(null);
    onClose();
    onOpenFriend?.(uid);
  }

  return (
    <>
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
              <View style={styles.friendProfileCountsRow}>
                <TouchableOpacity onPress={() => setListModal('followers')}>
                  <Text style={styles.friendProfileCount}>
                    <Text style={styles.friendProfileCountNum}>{counts.followers}</Text> Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setListModal('following')}>
                  <Text style={styles.friendProfileCount}>
                    <Text style={styles.friendProfileCountNum}>{counts.following}</Text> Following
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.profileSectionLabel}>Privacy</Text>
              <View style={styles.privacyRow}>
                {PRIVACY_OPTIONS.map((opt) => {
                  const active = opt.key === privacy;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => handlePrivacyChange(opt.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity style={styles.profileSignOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
              <Text style={styles.profileSignOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FollowListModal
        visible={listModal !== null}
        mode={listModal ?? 'followers'}
        uid={user.uid}
        currentUser={user}
        onClose={closeListModal}
        onSelectFriend={handleSelectFriend}
      />
    </>
  );
}
