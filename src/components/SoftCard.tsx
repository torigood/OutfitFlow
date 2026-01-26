import React from 'react';
import { View, StyleSheet, Text, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, shadows } from '../theme/colors';

type ElevationLevel = 'none' | 'small' | 'medium' | 'large';

interface SoftCardProps {
  title?: string;
  children?: React.ReactNode;
  style?: any;
  blur?: boolean;
  elevation?: ElevationLevel;
}

const getElevationStyle = (level: ElevationLevel): ViewStyle => {
  if (level === 'none') return {};
  return Platform.OS === 'ios' ? shadows[level] : { elevation: shadows[level].elevation };
};

const getBorderColor = (level: ElevationLevel): string => {
  switch (level) {
    case 'large':
      return colors.borderStrong;
    case 'medium':
      return colors.border;
    default:
      return colors.borderLight;
  }
};

export const SoftCard = ({ title, children, style, blur = false, elevation = 'small' }: SoftCardProps) => {
  const elevationStyle = getElevationStyle(elevation);
  const borderColor = getBorderColor(elevation);

  if (blur && Platform.OS === 'ios') {
    return (
      <View style={[styles.wrap, { borderColor }, elevationStyle, style]}>
        <BlurView intensity={40} tint="light" style={styles.blurView}>
          <View style={styles.inner}>
            {children}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, styles.solidBg, { borderColor }, elevationStyle, style]}>
      <View style={styles.inner}>
        {children}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    margin: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  solidBg: {
    backgroundColor: colors.softCard,
  },
  blurView: {
    flex: 1,
  },
  inner: {
    padding: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
