import React from 'react';
import { Text, Pressable, Platform, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors, shadows } = useTheme();

  const wrapStyle: ViewStyle = {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.black,
          ...(Platform.OS === 'ios' ? shadows.medium : { elevation: shadows.medium.elevation }),
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.borderStrong,
        };
      case 'ghost':
        return {
          backgroundColor: colors.softCard,
        };
      default:
        return {
          backgroundColor: colors.black,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: colors.white };
      case 'secondary':
      case 'ghost':
        return { color: colors.textPrimary };
      default:
        return { color: colors.white };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 14 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const pressedStyle: ViewStyle = {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
    ...(Platform.OS === 'ios' ? shadows.small : { elevation: shadows.small.elevation }),
  };

  const disabledStyle: ViewStyle = {
    opacity: 0.4,
  };

  const textBaseStyle: TextStyle = {
    fontWeight: '600',
    fontSize: 16,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        wrapStyle,
        getButtonStyle(),
        getSizeStyle(),
        pressed && pressedStyle,
        disabled && disabledStyle,
      ]}
    >
      <Text style={[textBaseStyle, getTextStyle()]}>{label}</Text>
    </Pressable>
  );
};
