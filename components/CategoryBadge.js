import { View, Text } from 'react-native';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { styles } from '../styles';

export function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {CATEGORY_ICONS[category]} {category}
      </Text>
    </View>
  );
}
