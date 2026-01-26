// Theme types
export type ThemeColors = typeof lightColors;
export type ThemeMode = "light" | "dark" | "system";

// Light Theme - Apple-inspired palette for OutfitFlow
export const lightColors = {
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

  // Text colors (WCAG AA 기준 4.5:1 이상 명도 대비)
  textPrimary: "#000000",
  textSecondary: "rgba(0, 0, 0, 0.65)",  // 개선: 0.6 → 0.65
  textTertiary: "rgba(0, 0, 0, 0.55)",   // 개선: 0.4 → 0.55 (접근성 향상)
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

// Dark Theme - Apple-inspired dark palette
export const darkColors: ThemeColors = {
  // Background colors (Dark theme base)
  bgPrimary: "#000000",
  bgSecondary: "#1C1C1E",
  bgTertiary: "#2C2C2E",
  bgElevated: "#1C1C1E",

  // Brand colors (White accent for contrast in dark mode)
  brand: "#FFFFFF",
  brandLight: "rgba(255, 255, 255, 0.7)",
  brandSubtle: "rgba(255, 255, 255, 0.06)",
  accent: "#0A84FF", // iOS blue (adjusted for dark mode)

  // Text colors (WCAG AA compliant)
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  textTertiary: "rgba(255, 255, 255, 0.55)",
  textOnDark: "#FFFFFF",
  textOnLight: "#000000",

  // Glass/Card colors
  glass: "rgba(255, 255, 255, 0.03)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  glassLight: "rgba(255, 255, 255, 0.02)",
  cardBg: "#1C1C1E",
  softCard: "#2C2C2E",

  // Glow effects
  glowWhite: "rgba(255, 255, 255, 0.04)",
  glowAccent: "rgba(10, 132, 255, 0.2)",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  lightGray: "#3A3A3C",
  darkGray: "#E5E5EA",

  // Background colors (legacy support)
  background: "#000000",
  backgroundOverlay: "rgba(0, 0, 0, 0.6)",

  // Status colors (iOS style - adjusted for dark mode)
  success: "#30D158",
  error: "#FF453A",
  warning: "#FF9F0A",
  info: "#0A84FF",

  // UI element colors - Border hierarchy
  borderLight: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.15)",
  borderDefault: "rgba(255, 255, 255, 0.15)",
  borderStrong: "rgba(255, 255, 255, 0.25)",
  divider: "rgba(255, 255, 255, 0.08)",

  // Transparent variants
  blackTransparent: "rgba(0, 0, 0, 0.5)",
  whiteTransparent: "rgba(255, 255, 255, 0.9)",

  // Interactive states
  pressed: "rgba(255, 255, 255, 0.08)",
  pressedLight: "rgba(255, 255, 255, 0.04)",
  focused: "rgba(10, 132, 255, 0.2)",
  disabled: "rgba(255, 255, 255, 0.3)",
};

// Dark mode shadow system
export const darkShadows = {
  small: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  extraLarge: {
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
};

// Default export for backward compatibility (light theme)
export const colors = lightColors;
export default colors;
