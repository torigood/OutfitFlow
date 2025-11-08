import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface SoftCardProps {
  title?: string;
  children?: React.ReactNode;
  style?: any;
}

export const SoftCard = ({ title, children, style }: SoftCardProps) => (
  <View style={[styles.wrap, style]}>
    <View style={styles.inner}>
      {children}
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 22,
    margin: 12,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inner: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.white,
  },
  title: {
    color: colors.textOnLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
