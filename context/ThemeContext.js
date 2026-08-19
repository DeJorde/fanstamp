import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStyles, getPalette } from '../styles';
import { getItemWithMigration } from '../utils/storage';
import { setUserFields } from '../utils/firestoreSync';

const RETRO_MODE_STORAGE_KEY = '@fanstamp_retro_mode';
const LEGACY_RETRO_MODE_STORAGE_KEY = '@stadiumlog_retro_mode';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [retro, setRetro] = useState(false);

  useEffect(() => {
    getItemWithMigration(RETRO_MODE_STORAGE_KEY, LEGACY_RETRO_MODE_STORAGE_KEY).then((raw) => {
      if (raw != null) setRetro(raw === 'true');
    });
  }, []);

  // `uid` is only passed by callers that know the user is signed in — see
  // App.js's header retro-toggle button — so this stays a no-op for guests.
  function toggleRetro(uid) {
    setRetro((prev) => {
      const next = !prev;
      AsyncStorage.setItem(RETRO_MODE_STORAGE_KEY, String(next));
      if (uid) setUserFields(uid, { retroMode: next }).catch(() => {});
      return next;
    });
  }

  // Applies a retroMode value that arrived from a Firestore listener, without
  // writing it back to Firestore — otherwise every remote update would
  // trigger another write, echoing forever between devices.
  function applyRemoteRetro(next) {
    setRetro((prev) => {
      if (prev === next) return prev;
      AsyncStorage.setItem(RETRO_MODE_STORAGE_KEY, String(next));
      return next;
    });
  }

  const value = useMemo(() => ({
    retro,
    toggleRetro,
    applyRemoteRetro,
    styles: createStyles(retro),
    colors: getPalette(retro),
  }), [retro]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
