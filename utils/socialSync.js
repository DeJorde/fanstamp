import {
  doc, getDoc, setDoc, onSnapshot, collection, collectionGroup,
  query, where, orderBy, startAt, endAt, limit, writeBatch, serverTimestamp,
  getCountFromServer, getDocs,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { computeProfileSummary } from './profileStats';

function profileRef(uid) {
  return doc(db, 'users', uid, 'profile', 'public');
}

function identityFields(authUser) {
  const displayName = authUser.displayName || authUser.email || 'FanStamp User';
  const email = authUser.email || '';
  return { displayName, displayName_lower: displayName.toLowerCase(), email, email_lower: email.toLowerCase() };
}

// Called once per sign-in (alongside ensureMigrated in App.js) — a no-op for
// existing profiles, so it's safe to call on every sign-in rather than
// gating it behind a flag the way ensureMigrated does.
export async function ensureProfileDoc(uid, authUser, events) {
  const ref = profileRef(uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    ...identityFields(authUser),
    joinDate: serverTimestamp(),
    privacy: 'public',
    ...computeProfileSummary(events),
    updatedAt: serverTimestamp(),
  });
}

// Called from the debounced events-sync effect in App.js, after events
// finish syncing — keeps totals/passport/recentEvents (and identity, in case
// displayName/email ever change) current without a listener of its own.
export function syncProfileStats(uid, authUser, events) {
  return setDoc(profileRef(uid), {
    ...identityFields(authUser),
    ...computeProfileSummary(events),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function setPrivacy(uid, privacy) {
  return setDoc(profileRef(uid), { privacy, updatedAt: serverTimestamp() }, { merge: true });
}

// cb receives { uid, ...profileFields }, or null if the doc doesn't exist OR
// the security rules deny the read (private profile) — the error callback
// covers the latter so a permission-denied rejection never becomes an
// unhandled promise/crash, it just reads as "no access" to the caller.
export function subscribeToFriendProfile(uid, cb) {
  return onSnapshot(
    profileRef(uid),
    (snap) => cb(snap.exists() ? { uid, ...snap.data() } : null),
    () => cb(null),
  );
}

export async function followUser(myUid, myDisplayName, targetUid, targetDisplayName) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', myUid, 'following', targetUid), {
    uid: targetUid, displayName: targetDisplayName ?? '', since: serverTimestamp(),
  });
  batch.set(doc(db, 'users', targetUid, 'followers', myUid), {
    uid: myUid, displayName: myDisplayName ?? '', since: serverTimestamp(),
  });
  await batch.commit();
}

export async function unfollowUser(myUid, targetUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', myUid, 'following', targetUid));
  batch.delete(doc(db, 'users', targetUid, 'followers', myUid));
  await batch.commit();
}

export function subscribeFollowState(myUid, targetUid, cb) {
  return onSnapshot(doc(db, 'users', myUid, 'following', targetUid), (snap) => cb(snap.exists()));
}

export function subscribeFollowing(uid, cb) {
  return onSnapshot(collection(db, 'users', uid, 'following'), (snap) => cb(snap.docs.map((d) => d.data())));
}

export function subscribeFollowers(uid, cb) {
  return onSnapshot(collection(db, 'users', uid, 'followers'), (snap) => cb(snap.docs.map((d) => d.data())));
}

export async function getFollowCounts(uid) {
  const [followingSnap, followersSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users', uid, 'following')),
    getCountFromServer(collection(db, 'users', uid, 'followers')),
  ]);
  return { following: followingSnap.data().count, followers: followersSnap.data().count };
}

// Firestore's "starts-with" idiom: an ordered range from the term up to the
// term followed by the highest possible Unicode codepoint, so every string
// starting with `term` sorts inside the range.
const PREFIX_RANGE_SUFFIX = String.fromCodePoint(0xf8ff);

// displayName search is prefix-match (case-insensitive); email search is
// exact-match only — a prefix match on email would let any signed-in user
// harvest partial email addresses of everyone else by typing short strings.
// Both queries hit the `profile` collection group, which needs a
// collection-group index on displayName_lower (range) and one on
// email_lower (equality) — Firestore will log a direct "create index" link
// the first time each query runs against the console's project if they
// don't exist yet.
export async function searchUsers(term, myUid) {
  const q = term.trim();
  if (!q) return [];
  const lower = q.toLowerCase();

  const nameQuery = query(
    collectionGroup(db, 'profile'),
    orderBy('displayName_lower'),
    startAt(lower),
    endAt(lower + PREFIX_RANGE_SUFFIX),
    limit(20),
  );
  const emailQuery = query(
    collectionGroup(db, 'profile'),
    where('email_lower', '==', lower),
    limit(5),
  );

  const [nameSnap, emailSnap] = await Promise.all([getDocs(nameQuery), getDocs(emailQuery)]);
  const byUid = new Map();
  [...nameSnap.docs, ...emailSnap.docs].forEach((d) => {
    const uid = d.ref.parent.parent.id; // users/{uid}/profile/public -> uid
    if (uid === myUid || byUid.has(uid)) return;
    const data = d.data();
    if (data.privacy === 'private') return;
    byUid.set(uid, { uid, ...data });
  });
  return Array.from(byUid.values());
}
