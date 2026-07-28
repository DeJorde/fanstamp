import AsyncStorage from '@react-native-async-storage/async-storage';

// Values that count as "nothing here yet" under the new key — includes raw
// null/undefined as well as the empty-collection strings the app itself
// writes on a fresh (pre-migration) load, e.g. '[]' from JSON.stringify([])
// or 'null' from JSON.stringify(null). Without treating these as empty, a
// new key that got written once with empty data (for instance during a dev
// Fast Refresh that picked up the renamed key before this migration existed)
// permanently blocks the real legacy data from ever being copied over.
function isEmptyValue(raw) {
  return raw == null || raw === '[]' || raw === '{}' || raw === 'null' || raw === '';
}

// One-time migration from the app's old @stadiumlog_* AsyncStorage keys
// (pre-FanStamp rename) to their @fanstamp_* replacements, so existing
// installs don't lose events/bucket list/settings on upgrade.
export async function getItemWithMigration(newKey, oldKey) {
  const current = await AsyncStorage.getItem(newKey);
  const legacy = await AsyncStorage.getItem(oldKey);

  if (legacy == null) return current;

  if (isEmptyValue(current)) {
    await AsyncStorage.setItem(newKey, legacy);
    await AsyncStorage.removeItem(oldKey);
    return legacy;
  }

  // New key already holds real data — nothing left to migrate, just clean up.
  await AsyncStorage.removeItem(oldKey);
  return current;
}
