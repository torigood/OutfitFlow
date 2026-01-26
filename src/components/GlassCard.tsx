import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, shadows } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 60 }: GlassCardProps) => {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={intensity} tint="light" style={styles.blurView}>
          <View style={styles.inner}>{children}</View>
        </BlurView>
      </View>
    );
  }

  // Android fallback
  return (
    <View style={[styles.container, styles.androidFallback, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...Platform.select({
      ios: shadows.medium,
      android: { elevation: shadows.medium.elevation },
    }),
  },
  blurView: {
    flex: 1,
  },
  androidFallback: {
    backgroundColor: colors.cardBg,
  },
  inner: {
    padding: 16,
  },
});
