import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface GlowTileProps {
  icon: React.ReactNode;
  size?: number;
}

export function GlowTile({ icon, size = 88 }: GlowTileProps) {
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View
        style={[
          styles.radial,
          {
            backgroundColor: colors.glowOrange,
          },
        ]}
      />
      {icon}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
    backgroundColor: colors.softCard,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  radial: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    opacity: 0.35,
  },
});
