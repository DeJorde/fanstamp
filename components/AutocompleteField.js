import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export function AutocompleteField({ value, placeholder, onChangeText, onSelect, fetchSuggestions }) {
  const { styles, colors } = useTheme();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const closeTimer              = useRef(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const r = await fetchSuggestions(q, controller.signal);
        setResults(r);
        setLoading(false);
      } catch {
        if (!controller.signal.aborted) { setResults([]); setLoading(false); }
      }
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, fetchSuggestions]);

  const showDrop = dropOpen && value.trim().length >= 2 && (results.length > 0 || loading);

  function handleFocus() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropOpen(true);
  }
  function handleBlur() {
    closeTimer.current = setTimeout(() => setDropOpen(false), 160);
  }
  function pick(result) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropOpen(false);
    setResults([]);
    onSelect(result);
  }

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {showDrop && (
        <View style={styles.formDropdown}>
          {loading && results.length === 0 && (
            <View style={[styles.formDropdownRow, styles.formDropdownRowFirst]}>
              <Text style={styles.formDropdownSub}>Searching…</Text>
            </View>
          )}
          {results.map((r, i) => (
            <TouchableOpacity
              key={r.id ?? i}
              style={[styles.formDropdownRow, i === 0 && styles.formDropdownRowFirst]}
              onPress={() => pick(r)}
              activeOpacity={0.7}
            >
              <Text style={styles.formDropdownLabel} numberOfLines={1}>{r.name}</Text>
              {r.subtitle ? (
                <Text style={styles.formDropdownSub} numberOfLines={1}>{r.subtitle}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
