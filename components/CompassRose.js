import { View, Text } from 'react-native';
import { CR } from '../constants';
import { useTheme } from '../context/ThemeContext';

export function CompassRose() {
  const { styles } = useTheme();
  return (
    <View style={styles.compassWrap} pointerEvents="none">
      {/* Faint ring */}
      <View style={styles.compassRing} />

      {/* Cardinal arms ─ N is dark (traditional convention) */}
      <View style={styles.compassArmN} />
      <View style={styles.compassArmS} />
      <View style={styles.compassArmE} />
      <View style={styles.compassArmW} />

      {/* Ordinal tick-marks at 45° diagonals */}
      <View style={[styles.compassOrdinal, { transform: [{ rotate: '45deg'  }] }]} />
      <View style={[styles.compassOrdinal, { transform: [{ rotate: '-45deg' }] }]} />

      {/* Center jewel */}
      <View style={styles.compassCenter} />

      {/* Cardinal labels */}
      <Text style={[styles.compassLabel, { top: 1,        left: 0, right: 0, textAlign: 'center' }]}>N</Text>
      <Text style={[styles.compassLabel, { bottom: 2,     left: 0, right: 0, textAlign: 'center' }]}>S</Text>
      <Text style={[styles.compassLabel, { top: CR - 6,   right: 1 }]}>E</Text>
      <Text style={[styles.compassLabel, { top: CR - 6,   left: 1  }]}>W</Text>
    </View>
  );
}
