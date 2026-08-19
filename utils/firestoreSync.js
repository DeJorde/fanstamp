import {
  doc, getDoc, setDoc, deleteDoc, onSnapshot, collection,
  writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Bucket list items have no id of their own — league+team is unique per user.
function bucketItemId(league, team) {
  return `${league}::${team}`.replace(/\//g, '_');
}

// Event photos/ticketPhoto are inline base64 data URIs (see EventFormModal) —
// a few photos easily blow past Firestore's 1MB-per-document limit. Everything
// else about an event is small and syncs fine; photo sync would need Firebase
// Storage, which is out of scope for now.
function toSyncableEvent(event) {
  const { photos, ticketPhoto, ...rest } = event;
  return rest;
}

// `id` is a Date.now().toString() timestamp, so string-descending order
// reconstructs "most recently added first" — several screens (e.g. the map's
// per-venue category pin) rely on that array order for correctness, not just
// display, so a Firestore-driven refresh has to restore it explicitly.
function sortNewestFirst(events) {
  return [...events].sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
}

export function subscribeToUserData(uid, { onEvents, onBucketList, onUserDoc }) {
  const unsubEvents = onSnapshot(collection(db, 'users', uid, 'events'), (snap) => {
    onEvents(sortNewestFirst(snap.docs.map((d) => d.data())));
  });
  const unsubBucket = onSnapshot(collection(db, 'users', uid, 'bucketList'), (snap) => {
    onBucketList(snap.docs.map((d) => d.data()));
  });
  const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
    onUserDoc(snap.exists() ? snap.data() : null);
  });
  return () => { unsubEvents(); unsubBucket(); unsubUser(); };
}

// One-time upload of whatever's in local storage at first sign-in, guarded by
// a flag on the user doc so it never runs again (and never clobbers cloud
// data with stale local data on a second device).
export async function ensureMigrated(uid, { events, bucketList, favoriteTeam, retroMode }) {
  const userRef = doc(db, 'users', uid);
  const existing = await getDoc(userRef);
  if (existing.exists() && existing.data().migratedFromLocal) return false;

  const writes = [
    ...events.map((e) => ({ ref: doc(db, 'users', uid, 'events', e.id), data: toSyncableEvent(e) })),
    ...bucketList.map((b) => ({ ref: doc(db, 'users', uid, 'bucketList', bucketItemId(b.league, b.team)), data: b })),
  ];
  for (let i = 0; i < writes.length; i += 400) {
    const batch = writeBatch(db);
    writes.slice(i, i + 400).forEach(({ ref, data }) => batch.set(ref, data));
    await batch.commit();
  }

  await setDoc(userRef, {
    favoriteTeam: favoriteTeam ?? null,
    retroMode: !!retroMode,
    migratedFromLocal: true,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return true;
}

// Diffs `events` against the last-synced snapshot (kept in a ref by the
// caller, not state) so a debounced effect on every local change only writes
// what actually changed — covers edits, deletes, and the async geocode/
// game-stats backfills alike without needing a sync call at every one of
// those call sites individually.
export async function syncEventsToFirestore(uid, events, lastSyncedRef) {
  const prevMap = lastSyncedRef.current ?? new Map();
  const nextMap = new Map();
  const batch = writeBatch(db);
  let dirty = false;

  events.forEach((e) => {
    const syncable = toSyncableEvent(e);
    const json = JSON.stringify(syncable);
    nextMap.set(e.id, json);
    if (prevMap.get(e.id) !== json) {
      batch.set(doc(db, 'users', uid, 'events', e.id), syncable);
      dirty = true;
    }
  });
  prevMap.forEach((_, id) => {
    if (!nextMap.has(id)) {
      batch.delete(doc(db, 'users', uid, 'events', id));
      dirty = true;
    }
  });

  if (dirty) await batch.commit();
  lastSyncedRef.current = nextMap;
}

export async function syncBucketListToFirestore(uid, bucketList, lastSyncedRef) {
  const prevIds = lastSyncedRef.current ?? new Set();
  const nextIds = new Set();
  const batch = writeBatch(db);
  let dirty = false;

  bucketList.forEach((b) => {
    const id = bucketItemId(b.league, b.team);
    nextIds.add(id);
    if (!prevIds.has(id)) {
      batch.set(doc(db, 'users', uid, 'bucketList', id), b);
      dirty = true;
    }
  });
  prevIds.forEach((id) => {
    if (!nextIds.has(id)) {
      batch.delete(doc(db, 'users', uid, 'bucketList', id));
      dirty = true;
    }
  });

  if (dirty) await batch.commit();
  lastSyncedRef.current = nextIds;
}

export function setUserFields(uid, fields) {
  return setDoc(doc(db, 'users', uid), { ...fields, updatedAt: serverTimestamp() }, { merge: true });
}
