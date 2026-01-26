import React from 'react';
import { Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors, shadows } from '../theme/colors';

interface WarmButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const WarmButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 'medium',
}: WarmButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryBg;
      case 'secondary':
        return styles.secondaryBg;
      case 'ghost':
        return styles.ghostBg;
      default:
        return styles.primaryBg;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'large':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        getButtonStyle(),
        getSizeStyle(),
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.txt, getTextStyle()]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBg: {
    backgroundColor: colors.black,
    ...Platform.select({
      ios: shadows.medium,
      android: { elevation: shadows.medium.elevation },
    }),
  },
  secondaryBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  ghostBg: {
    backgroundColor: colors.softCard,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.textPrimary,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sizeMedium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  sizeLarge: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
    ...Platform.select({
      ios: shadows.small,
      android: { elevation: shadows.small.elevation },
    }),
  },
  disabled: {
    opacity: 0.4,
  },
  txt: {
    fontWeight: '600',
    fontSize: 16,
  },
});
