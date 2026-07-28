import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStyles, getPalette } from '../styles';
import { getItemWithMigration } from '../utils/storage';

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

  function toggleRetro() {
    setRetro((prev) => {
      const next = !prev;
      AsyncStorage.setItem(RETRO_MODE_STORAGE_KEY, String(next));
      return next;
    });
  }

  const value = useMemo(() => ({
    retro,
    toggleRetro,
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
