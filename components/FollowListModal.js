import { useEffect, useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { followUser, subscribeFollowState, subscribeFollowers, subscribeFollowing, unfollowUser } from '../utils/socialSync';
import { useTheme } from '../context/ThemeContext';

function FollowListRow({ item, currentUser, onSelect }) {
  const { styles } = useTheme();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSelf = currentUser?.uid === item.uid;

  useEffect(() => {
    if (!currentUser || isSelf) return;
    return subscribeFollowState(currentUser.uid, item.uid, setFollowing);
  }, [currentUser?.uid, item.uid, isSelf]);

  async function handleToggle() {
    setBusy(true);
    try {
      if (following) await unfollowUser(currentUser.uid, item.uid);
      else await followUser(currentUser.uid, currentUser.displayName || currentUser.email, item.uid, item.displayName);
    } catch (err) {
      console.log('[FanStamp] follow toggle failed:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableOpacity style={styles.friendResultRow} onPress={() => onSelect(item.uid)} activeOpacity={0.75}>
      <View style={styles.friendResultAvatar}>
        <Text style={styles.friendResultAvatarText}>{(item.displayName || '?').trim().charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.friendResultBody}>
        <Text style={styles.friendResultName}>{item.displayName}</Text>
      </View>
      {!isSelf && currentUser && (
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followBtnActive]}
          onPress={handleToggle}
          disabled={busy}
          activeOpacity={0.7}
        >
          <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// Shared by ProfileModal (viewing your own followers/following) and could be
// reused anywhere else a uid's follow list needs showing — mode picks which
// subcollection to subscribe to.
export function FollowListModal({ visible, mode, uid, currentUser, onClose, onSelectFriend }) {
  const { styles } = useTheme();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!visible || !uid) return;
    return mode === 'followers' ? subscribeFollowers(uid, setItems) : subscribeFollowing(uid, setItems);
  }, [visible, uid, mode]);

  function handleSelect(friendUid) {
    onClose();
    onSelectFriend(friendUid);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderBtn} />
          <Text style={styles.modalTitle}>{mode === 'followers' ? 'Followers' : 'Following'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalHeaderBtn}>
            <Text style={styles.modalCancelText}>Done</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <FollowListRow item={item} currentUser={currentUser} onSelect={handleSelect} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}
