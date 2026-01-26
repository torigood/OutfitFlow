import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 60 }: GlassCardProps) => {
  const { colors, shadows, isDark } = useTheme();

  const containerStyle: ViewStyle = {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...(Platform.OS === 'ios' ? shadows.medium : { elevation: shadows.medium.elevation }),
  };

  const innerStyle: ViewStyle = {
    padding: 16,
  };

  const androidFallbackStyle: ViewStyle = {
    backgroundColor: colors.cardBg,
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={[containerStyle, style]}>
        <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }}>
          <View style={innerStyle}>{children}</View>
        </BlurView>
      </View>
    );
  }

  // Android fallback
  return (
    <View style={[containerStyle, androidFallbackStyle, style]}>
      <View style={innerStyle}>{children}</View>
    </View>
  );
};
