import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { FILTERS } from '../constants';
import { useTheme } from '../context/ThemeContext';

export function FilterBar({ value, onChange }) {
  const { styles } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterBarWrap}
      contentContainerStyle={styles.filterBar}
    >
      {FILTERS.map((f) => {
        const active = f.key === value;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={() => onChange(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
