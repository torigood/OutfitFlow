import { TextStyle, Platform } from "react-native";

// Typography system - 일관된 텍스트 스타일을 위한 상수
// iOS Human Interface Guidelines 기반

// 시스템 폰트 사용 (플랫폼별 최적화)
const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

// 폰트 크기 스케일
export const fontSize = {
  xs: 11,    // 캡션, 힌트
  sm: 13,    // 보조 텍스트
  md: 15,    // 본문
  lg: 17,    // 강조 본문
  xl: 20,    // 작은 제목
  xxl: 24,   // 중간 제목
  xxxl: 28,  // 큰 제목
  display: 34, // 디스플레이 제목
} as const;

// 폰트 무게
export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// 줄 높이 (폰트 크기 * 1.4 ~ 1.5 기준)
export const lineHeight = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 36,
  display: 42,
} as const;

// 미리 정의된 텍스트 스타일
export const typography = {
  // 디스플레이 (대형 제목)
  displayLarge: {
    fontFamily,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.display,
    letterSpacing: 0.35,
  } as TextStyle,

  // 제목들
  h1: {
    fontFamily,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxxl,
    letterSpacing: 0.35,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xxl,
    letterSpacing: 0.35,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.xl,
    letterSpacing: 0.35,
  } as TextStyle,

  // 본문
  bodyLarge: {
    fontFamily,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
    letterSpacing: -0.24,
  } as TextStyle,

  body: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
    letterSpacing: -0.24,
  } as TextStyle,

  bodyBold: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.md,
    letterSpacing: -0.24,
  } as TextStyle,

  // 보조 텍스트
  caption: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
    letterSpacing: -0.08,
  } as TextStyle,

  captionBold: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.sm,
    letterSpacing: -0.08,
  } as TextStyle,

  // 아주 작은 텍스트
  tiny: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.xs,
    letterSpacing: 0.06,
  } as TextStyle,

  // 버튼 텍스트
  button: {
    fontFamily,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.lg,
    letterSpacing: -0.24,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.md,
    letterSpacing: -0.24,
  } as TextStyle,

  // 라벨
  label: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.sm,
    letterSpacing: -0.08,
  } as TextStyle,
} as const;

export default typography;
