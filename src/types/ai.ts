import { ClothingItem } from "./wardrobe";

// 패션 스타일 카테고리
export type FashionStyle =
  | "캐주얼"
  | "포멀"
  | "스트릿"
  | "빈티지"
  | "미니멀"
  | "스포티"
  | "페미닌"
  | "댄디"
  | "기타";

// TPO (Time, Place, Occasion) 상황
export type Occasion =
  | "date" // 데이트
  | "business" // 면접/비즈니스
  | "casual" // 일상/캐주얼
  | "party" // 파티/행사
  | "exercise"; // 운동

export const OccasionLabels: Record<Occasion, string> = {
  date: "데이트",
  business: "면접/비즈니스",
  casual: "일상/캐주얼",
  party: "파티/행사",
  exercise: "운동",
};

// 색상 조화 점수
export interface ColorHarmony {
  score: number; // 1-10
  description: string;
  complementaryColors: string[]; // 보색 제안
}

// 코디 조합 분석 결과 (Phase A)
export interface OutfitAnalysis {
  compatibility: number; // 전체 적합도 (1-10)
  colorHarmony: ColorHarmony; // 색상 조화
  styleConsistency: number; // 스타일 일관성 (1-10)
  advice: string; // AI 조언
  suggestions: string[]; // 개선 제안
  selectedItems: ClothingItem[]; // 분석한 옷들
}

// TPO 분석 결과 (Phase C)
export interface TPOAnalysis extends OutfitAnalysis {
  tpoScore: number; // TPO 적합도 (1-10)
  occasion: Occasion; // 상황
  appropriateness: string; // 적합성 설명
  formalityLevel: number; // 격식 수준 (1-10)
}

// 날씨 정보 (Phase D)
export interface WeatherInfo {
  temperature: number; // 온도 (°C)
  feelsLike: number; // 체감온도
  humidity: number; // 습도 (%)
  condition: string; // 날씨 상태 (맑음, 비, 눈 등)
  windSpeed: number; // 풍속 (m/s)
  description: string; // 상세 설명
}

// 날씨 기반 분석 (Phase D)
export interface WeatherOutfitAnalysis extends TPOAnalysis {
  weatherSuitability: number; // 날씨 적합도 (1-10)
  weather: WeatherInfo;
  temperatureAdvice: string; // 온도 관련 조언
  weatherWarnings: string[]; // 날씨 경고 (비/눈 대비 등)
}

// 옷장 분석 결과 (Phase E)
export interface WardrobeAnalysis {
  totalItems: number; // 총 옷 개수
  categoryCoverage: Record<string, number>; // 카테고리별 개수
  styleCoverage: Record<FashionStyle, number>; // 스타일별 분포
  colorDistribution: Record<string, number>; // 색상 분포
  missingItems: MissingItem[]; // 부족한 아이템
  recommendations: string[]; // 전체 추천
  wardrobeScore: number; // 옷장 완성도 (1-100)
}

// 부족한 아이템 정보 (Phase E)
export interface MissingItem {
  category: string; // 카테고리 (상의, 하의 등)
  item: string; // 구체적 아이템 (흰색 셔츠, 청바지 등)
  reason: string; // 필요한 이유
  priority: "high" | "medium" | "low"; // 우선순위
  styleMatch: FashionStyle[]; // 어울리는 스타일
  estimatedPrice?: string; // 예상 가격대 (옵션)
}

// Gemini AI 응답 형식
export interface GeminiOutfitResponse {
  compatibility: number;
  colorHarmony: {
    score: number;
    description: string;
    complementaryColors: string[];
  };
  styleConsistency: number;
  advice: string;
  suggestions: string[];
}

export interface GeminiTPOResponse extends GeminiOutfitResponse {
  tpoScore: number;
  appropriateness: string;
  formalityLevel: number;
}

export interface GeminiWeatherResponse extends GeminiTPOResponse {
  weatherSuitability: number;
  temperatureAdvice: string;
  weatherWarnings: string[];
}

export interface GeminiWardrobeResponse {
  totalItems: number;
  categoryCoverage: Record<string, number>;
  styleCoverage: Record<string, number>;
  colorDistribution: Record<string, number>;
  missingItems: Array<{
    category: string;
    item: string;
    reason: string;
    priority: "high" | "medium" | "low";
    styleMatch: string[];
  }>;
  recommendations: string[];
  wardrobeScore: number;
}

// AI 분석 상태
export type AIAnalysisStatus = "idle" | "loading" | "success" | "error";

// AI 분석 에러
export interface AIAnalysisError {
  message: string;
  code?: string;
  details?: string;
}
