import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { US_STATES_PATHS, US_STATES_VIEWBOX } from '../usStatesMap';
import { formatDisplayDate } from '../utils/dates';
import { useTheme } from '../context/ThemeContext';

// Fixed regardless of theme — a "muted gray" for unvisited states needs to
// read the same way against both the dark and parchment backgrounds, same
// convention as CATEGORY_COLORS/trophyCardGold elsewhere in styles.js.
const UNVISITED_FILL = '#7a7a7a';

export function USStatesMap({ statesVisited }) {
  const { styles, colors } = useTheme();
  const [selectedState, setSelectedState] = useState(null);

  const selectedEvents = selectedState ? statesVisited.get(selectedState) ?? [] : [];

  return (
    <View>
      <Text style={styles.statesCounter}>{statesVisited.size} of 50 states visited</Text>

      <View style={styles.statesMapWrap}>
        <Svg viewBox={US_STATES_VIEWBOX} width="100%" height="100%">
          {US_STATES_PATHS.map((s) => {
            const visited = statesVisited.has(s.name);
            return (
              <Path
                key={s.name}
                d={s.d}
                fill={visited ? colors.accent : UNVISITED_FILL}
                stroke={colors.bg1}
                strokeWidth={0.75}
                onPress={visited ? () => setSelectedState(s.name) : undefined}
              />
            );
          })}
        </Svg>
      </View>

      <Modal
        visible={selectedState !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedState(null)}
      >
        <Pressable style={styles.statesModalBackdrop} onPress={() => setSelectedState(null)}>
          <Pressable style={styles.statesModalCard} onPress={() => {}}>
            <Text style={styles.statesModalTitle}>{selectedState}</Text>
            <Text style={styles.statesModalSubtitle}>
              {selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'} attended
            </Text>
            <ScrollView style={styles.statesModalList} showsVerticalScrollIndicator={false}>
              {selectedEvents.map((e, i) => (
                <View key={e.id}>
                  {i > 0 && <View style={styles.statsDivider} />}
                  <View style={styles.statesModalRow}>
                    <Text style={styles.statesModalEventName} numberOfLines={1}>{e.name}</Text>
                    <Text style={styles.statesModalEventSub} numberOfLines={1}>
                      {e.venue} · {formatDisplayDate(e.date)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.statesModalCloseBtn} onPress={() => setSelectedState(null)}>
              <Text style={styles.statesModalCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
