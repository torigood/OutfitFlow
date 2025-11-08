import React from 'react';
import { Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface WarmButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const WarmButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: WarmButtonProps) => {
  const bgColor = variant === 'primary' ? colors.brand : colors.brandLight;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        { backgroundColor: bgColor, opacity: pressed || disabled ? 0.7 : 1 },
      ]}
    >
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  txt: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
