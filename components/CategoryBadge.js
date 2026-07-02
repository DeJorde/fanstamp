import { View, Text } from 'react-native';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { useTheme } from '../context/ThemeContext';

export function CategoryBadge({ category }) {
  const { styles } = useTheme();
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {CATEGORY_ICONS[category]} {category}
      </Text>
    </View>
  );
}
