// Spacing system - 일관된 간격을 위한 상수
// 8px 기반 그리드 시스템

export const spacing = {
  // 기본 간격
  xs: 4,    // 아주 작은 간격 (아이콘 내부 등)
  sm: 8,    // 작은 간격 (버튼 내부 패딩 등)
  md: 12,   // 중간 간격 (리스트 아이템 간격 등)
  lg: 16,   // 큰 간격 (섹션 패딩 등)
  xl: 20,   // 더 큰 간격 (화면 가장자리 패딩)
  xxl: 24,  // 아주 큰 간격 (섹션 간 간격)
  xxxl: 32, // 최대 간격 (주요 섹션 구분)

  // 화면 레이아웃용
  screenPadding: 20,    // 화면 좌우 패딩
  sectionGap: 24,       // 섹션 간 간격
  cardPadding: 16,      // 카드 내부 패딩
  listItemGap: 12,      // 리스트 아이템 간격

  // 컴포넌트별 간격
  buttonPaddingH: 16,   // 버튼 좌우 패딩
  buttonPaddingV: 12,   // 버튼 상하 패딩
  inputPaddingH: 16,    // 입력 필드 좌우 패딩
  inputPaddingV: 14,    // 입력 필드 상하 패딩

  // 터치 타겟 최소 크기 (접근성)
  minTouchTarget: 44,   // WCAG 최소 터치 타겟 크기
} as const;

// 반응형 간격 헬퍼
export const getResponsiveSpacing = (screenWidth: number) => ({
  screenPadding: screenWidth < 375 ? 16 : 20,
  cardPadding: screenWidth < 375 ? 12 : 16,
});

export default spacing;
