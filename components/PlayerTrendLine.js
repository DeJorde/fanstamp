import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

// Small sparkline for a player's running AVG/ERA across attended games —
// same Svg-primitive pattern as ProgressRing.js, no charting library.
export function PlayerTrendLine({ values, width = 72, height = 26, color = '#999999' }) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const step = width / (values.length - 1);
  const y = (v) => (range === 0 ? height / 2 : height - ((v - min) / range) * height);
  const points = values.map((v, i) => `${i * step},${y(v)}`).join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
