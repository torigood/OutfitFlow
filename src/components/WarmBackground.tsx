import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface WarmBackgroundProps {
  children?: React.ReactNode;
  variant?: 'solid' | 'gradient';
}

export function WarmBackground({ children, variant = 'solid' }: WarmBackgroundProps) {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
