// Minimal Light Theme - Apple-inspired palette for OutfitFlow
export const colors = {
  // Background colors (Light theme base)
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8F8F8",
  bgTertiary: "#F2F2F7",
  bgElevated: "#FFFFFF",

  // Brand colors (Black accent for contrast)
  brand: "#000000",
  brandLight: "rgba(0, 0, 0, 0.7)",
  brandSubtle: "rgba(0, 0, 0, 0.06)",
  accent: "#007AFF", // iOS blue for interactive elements

  // Text colors
  textPrimary: "#000000",
  textSecondary: "rgba(0, 0, 0, 0.6)",
  textTertiary: "rgba(0, 0, 0, 0.4)",
  textOnDark: "#FFFFFF",
  textOnLight: "#000000",

  // Glass/Card colors
  glass: "rgba(0, 0, 0, 0.03)",
  glassBorder: "rgba(0, 0, 0, 0.08)",
  glassLight: "rgba(0, 0, 0, 0.02)",
  cardBg: "#FFFFFF",
  softCard: "#F5F5F7",

  // Glow effects
  glowWhite: "rgba(0, 0, 0, 0.04)",
  glowAccent: "rgba(0, 122, 255, 0.15)",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  lightGray: "#E5E5EA",
  darkGray: "#3A3A3C",

  // Background colors (legacy support)
  background: "#FFFFFF",
  backgroundOverlay: "rgba(0, 0, 0, 0.4)",

  // Status colors (iOS style)
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
  info: "#007AFF",

  // UI element colors - Border hierarchy (improved contrast)
  borderLight: "rgba(0, 0, 0, 0.08)",   // 미묘한 구분용
  border: "rgba(0, 0, 0, 0.15)",        // 기본 보더 (대비율 ~5:1)
  borderDefault: "rgba(0, 0, 0, 0.15)", // alias
  borderStrong: "rgba(0, 0, 0, 0.25)",  // 강조 카드용
  divider: "rgba(0, 0, 0, 0.08)",

  // Transparent variants
  blackTransparent: "rgba(0, 0, 0, 0.5)",
  whiteTransparent: "rgba(255, 255, 255, 0.9)",

  // Interactive states
  pressed: "rgba(0, 0, 0, 0.08)",
  pressedLight: "rgba(0, 0, 0, 0.04)",
  focused: "rgba(0, 122, 255, 0.12)",
  disabled: "rgba(0, 0, 0, 0.3)",
};

// Shadow system - 4 elevation levels
export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  extraLarge: {
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
};

export default colors;
