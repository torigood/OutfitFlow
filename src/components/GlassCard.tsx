import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
}

export const GlassCard = ({ children, style }: GlassCardProps) => (
  <View style={[styles.container, style]}>
    <View style={styles.inner}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
    margin: 12,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inner: {
    padding: 16,
  },
});
