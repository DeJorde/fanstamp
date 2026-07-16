import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TABLE_MAX_HEIGHT = 380;

// Baseball-reference-style stat table: compact alternating rows, a header
// row that stays pinned while the body scrolls vertically (via ScrollView's
// native stickyHeaderIndices, scoped to this table), and a shared horizontal
// scroll for wide column sets — the header ScrollView is non-interactive and
// its scroll position is mirrored from the body's onScroll so columns always
// stay aligned no matter how far right you've scrolled.
export function StickyStatTable({ title, labels, rows, highlightId }) {
  const { styles } = useTheme();
  const headerScrollRef = useRef(null);
  const lastX = useRef(0);

  if (!rows || rows.length === 0) return null;

  function handleBodyScroll(e) {
    const x = e.nativeEvent.contentOffset.x;
    if (Math.abs(x - lastX.current) > 0.5) {
      lastX.current = x;
      headerScrollRef.current?.scrollTo({ x, animated: false });
    }
  }

  return (
    <View style={styles.statTableCard}>
      {!!title && <Text style={styles.detailSectionLabel}>{title}</Text>}
      <ScrollView style={{ maxHeight: TABLE_MAX_HEIGHT }} stickyHeaderIndices={[0]} nestedScrollEnabled showsVerticalScrollIndicator>
        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.statHeaderRowWrap}
        >
          <View style={styles.statHeaderRow}>
            <View style={styles.statNameCell} />
            {labels.map((l, i) => (
              <Text key={i} style={[styles.statColCell, styles.statHeaderText]}>{l}</Text>
            ))}
          </View>
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleBodyScroll}
          scrollEventThrottle={16}
        >
          <View>
            {rows.map((r, i) => (
              <View
                key={r.id ?? i}
                style={[
                  styles.statRow,
                  i % 2 === 1 && styles.statRowAlt,
                  highlightId != null && r.id === highlightId && styles.statRowGold,
                ]}
              >
                <View style={styles.statNameCell}>
                  <Text numberOfLines={1} style={styles.statNameText}>{r.name}</Text>
                  {!!r.subtext && <Text style={styles.statSubtext}>{r.subtext}</Text>}
                </View>
                {r.values.map((v, j) => (
                  <Text key={j} style={[styles.statColCell, styles.statCellText]}>{v}</Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
