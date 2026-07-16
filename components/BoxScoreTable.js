import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Presentational-only: renders a horizontally-scrollable stat table from a
// generic { labels, rows } shape. Used for MLB batting, MLB pitching, and
// every ESPN per-sport stat group (passing/rushing/receiving, a single
// basketball group, etc.) — one renderer instead of one per stat type.
export function BoxScoreTable({ title, labels, rows }) {
  const { styles } = useTheme();
  if (!rows || rows.length === 0) return null;

  return (
    <View style={styles.boxScoreTableCard}>
      {!!title && <Text style={styles.detailSectionLabel}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.boxScoreHeaderRow}>
            <View style={styles.boxScoreNameCell} />
            {labels.map((l, i) => (
              <Text key={i} style={[styles.boxScoreColCell, styles.boxScoreHeaderText]}>{l}</Text>
            ))}
          </View>
          {rows.map((r, i) => (
            <View key={i} style={styles.boxScoreRow}>
              <View style={styles.boxScoreNameCell}>
                <Text style={styles.boxScoreNameText} numberOfLines={1}>{r.name}</Text>
                {!!r.tag && <Text style={styles.boxScoreTag}>{r.tag}</Text>}
              </View>
              {r.values.map((v, j) => (
                <Text key={j} style={[styles.boxScoreColCell, styles.boxScoreCellText]}>{v}</Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
