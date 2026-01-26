import React from 'react';
import { StyleSheet, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, shadows } from '../theme/colors';

interface GlowTileProps {
  icon: React.ReactNode;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlowTile({ icon, size = 88, onPress, accessibilityLabel, accessibilityHint }: GlowTileProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.92]);
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.08, 0.03]);

    return {
      transform: [{ scale: withSpring(scale, { damping: 15, stiffness: 400 }) }],
      shadowOpacity: withTiming(shadowOpacity, { duration: 100 }),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pressed.value, [0, 1], [0.6, 0.9]);
    const scale = interpolate(pressed.value, [0, 1], [1, 1.2]);

    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ scale: withSpring(scale, { damping: 12, stiffness: 300 }) }],
    };
  });

  const handlePressIn = () => {
    pressed.value = 1;
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  return (
    <AnimatedPressable
      style={[styles.box, { width: size, height: size }, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Animated.View style={[styles.radial, glowStyle]} />
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 18,
    backgroundColor: colors.softCard,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...Platform.select({
      ios: shadows.medium,
      android: { elevation: shadows.medium.elevation },
    }),
  },
  radial: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: colors.white,
    opacity: 0.6,
  },
});
