import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

interface IOSSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function IOSSwitch({ value, onValueChange }: IOSSwitchProps) {
  const translateX = useSharedValue(value ? 20 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    const next = !value;
    translateX.value = withTiming(next ? 20 : 0, { duration: 200 });
    onValueChange(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.track, value && styles.trackActive]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[styles.thumb, animatedStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.toggleTrack,
    padding: 2,
  },
  trackActive: {
    backgroundColor: colors.toggleActive,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
