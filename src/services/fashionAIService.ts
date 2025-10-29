import { analyzeWithGemini, parseGeminiJSON } from "./geminiService";
import { ClothingItem } from "../types/wardrobe";
import {
  OutfitAnalysis,
  GeminiOutfitResponse,
  FashionStyle,
} from "../types/ai";

/**
 * Phase A: 코디 조합 추천
 * 선택한 옷들의 조합을 분석하고 추천 제공
 */
export const analyzeOutfitCombination = async (
  items: ClothingItem[],
  preferredStyle?: FashionStyle,
  temperature?: number
): Promise<OutfitAnalysis> => {
  try {
    if (items.length < 2) {
      throw new Error("최소 2개 이상의 옷을 선택해주세요.");
    }

    if (items.length > 4) {
      throw new Error("최대 4개까지 선택할 수 있습니다.");
    }

    // 이미지 URL 추출
    const imageUrls = items.map((item) => item.imageUrl);

    // 옷 정보 텍스트 생성
    const itemsDescription = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.category}, ${item.color}, ${
            item.brand
          })`
      )
      .join("\n");

    // AI 프롬프트 생성
    const prompt = `당신은 전문 패션 스타일리스트입니다. 다음 옷들의 조합을 분석해주세요.

선택한 옷:
${itemsDescription}

${preferredStyle ? `선호 스타일: ${preferredStyle}` : ""}
${temperature !== undefined ? `현재 기온: ${temperature}°C` : ""}

다음 JSON 형식으로 응답해주세요:
{
  "compatibility": 1-10 점수 (전체 조합 적합도),
  "colorHarmony": {
    "score": 1-10 점수 (색상 조화),
    "description": "색상 조화에 대한 설명",
    "complementaryColors": ["추천 보색 1", "추천 보색 2"]
  },
  "styleConsistency": 1-10 점수 (스타일 일관성),
  "advice": "전체적인 코디 조언 (한국어, 2-3문장)",
  "suggestions": ["개선 제안 1", "개선 제안 2", "개선 제안 3"]
}

응답은 반드시 JSON만 제공하고, 다른 설명은 추가하지 마세요.`;

    // Gemini AI 분석
    const response = await analyzeWithGemini(imageUrls, prompt);
    const analysis = parseGeminiJSON<GeminiOutfitResponse>(response);

    // OutfitAnalysis 형식으로 변환
    return {
      compatibility: analysis.compatibility,
      colorHarmony: analysis.colorHarmony,
      styleConsistency: analysis.styleConsistency,
      advice: analysis.advice,
      suggestions: analysis.suggestions,
      selectedItems: items,
    };
  } catch (error) {
    console.error("코디 조합 분석 오류:", error);
    throw error;
  }
};

/**
 * 단일 옷 아이템 스타일 분석
 */
export const analyzeSingleItem = async (
  item: ClothingItem
): Promise<{
  style: FashionStyle;
  description: string;
  matchingSuggestions: string[];
}> => {
  try {
    const prompt = `당신은 전문 패션 스타일리스트입니다. 이 옷을 분석해주세요.

옷 정보:
- 이름: ${item.name}
- 카테고리: ${item.category}
- 색상: ${item.color}
- 브랜드: ${item.brand}

다음 JSON 형식으로 응답해주세요:
{
  "style": "캐주얼|포멀|스트릿|빈티지|미니멀|스포티|페미닌|댄디|기타 중 하나",
  "description": "이 옷의 스타일 설명 (한국어, 1-2문장)",
  "matchingSuggestions": ["어울리는 옷 추천 1", "어울리는 옷 추천 2", "어울리는 옷 추천 3"]
}

응답은 반드시 JSON만 제공하세요.`;

    const response = await analyzeWithGemini([item.imageUrl], prompt);
    const analysis = parseGeminiJSON<{
      style: FashionStyle;
      description: string;
      matchingSuggestions: string[];
    }>(response);

    return analysis;
  } catch (error) {
    console.error("옷 분석 오류:", error);
    throw error;
  }
};

/**
 * 자동으로 옷장에서 최적의 조합을 추천
 */
export const recommendOutfitAutomatically = async (
  allItems: ClothingItem[],
  preferredStyle: FashionStyle,
  temperature?: number
): Promise<OutfitAnalysis> => {
  try {
    if (allItems.length < 2) {
      throw new Error("옷장에 최소 2개 이상의 옷이 필요합니다.");
    }

    let itemsToUse = allItems;

    // 온도가 제공된 경우에만 계절 필터링
    if (temperature !== undefined) {
      // 온도에 맞는 계절 필터링
      let seasonFilter: string[] = [];
      if (temperature <= 5) {
        seasonFilter = ["겨울"];
      } else if (temperature <= 15) {
        seasonFilter = ["가을", "봄"];
      } else if (temperature <= 25) {
        seasonFilter = ["봄", "여름"];
      } else {
        seasonFilter = ["여름"];
      }

      // 계절에 맞는 옷 필터링
      const seasonalItems = allItems.filter((item) =>
        seasonFilter.some((season) => item.seasons.includes(season))
      );

      // 필터링된 옷이 충분하지 않으면 전체 사용
      itemsToUse = seasonalItems.length >= 2 ? seasonalItems : allItems;
    }

    // 카테고리별로 그룹화
    const topItems = itemsToUse.filter((item) => item.category === "상의");
    const bottomItems = itemsToUse.filter((item) => item.category === "하의");
    const outerItems = itemsToUse.filter((item) => item.category === "아우터");
    const shoeItems = itemsToUse.filter((item) => item.category === "신발");

    // 기본 조합 선택 (상의 + 하의)
    const selectedItems: ClothingItem[] = [];

    if (topItems.length > 0) {
      selectedItems.push(topItems[Math.floor(Math.random() * topItems.length)]);
    }
    if (bottomItems.length > 0) {
      selectedItems.push(
        bottomItems[Math.floor(Math.random() * bottomItems.length)]
      );
    }

    // 추가 아이템 (온도에 따라 또는 랜덤)
    if (
      (temperature === undefined || temperature <= 15) &&
      outerItems.length > 0
    ) {
      selectedItems.push(
        outerItems[Math.floor(Math.random() * outerItems.length)]
      );
    }
    if (shoeItems.length > 0 && selectedItems.length < 4) {
      selectedItems.push(shoeItems[Math.floor(Math.random() * shoeItems.length)]);
    }

    // 최소 2개 이상 확보
    if (selectedItems.length < 2) {
      selectedItems.push(...itemsToUse.slice(0, 2));
    }

    // 중복 제거
    const uniqueItems = Array.from(
      new Map(selectedItems.map((item) => [item.id, item])).values()
    );

    // 조합 분석
    return await analyzeOutfitCombination(
      uniqueItems.slice(0, 4),
      preferredStyle,
      temperature
    );
  } catch (error) {
    console.error("자동 추천 오류:", error);
    throw error;
  }
};

/**
 * 새로운 아이템 추천 (구매 추천)
 */
export const recommendNewItems = async (
  existingItems: ClothingItem[],
  preferredStyle: FashionStyle,
  temperature?: number
): Promise<{ category: string; item: string; reason: string }[]> => {
  try {
    // 기존 옷장 정보 요약
    const categories = existingItems.map((item) => item.category);
    const colors = existingItems.map((item) => item.color);
    const seasons = existingItems.flatMap((item) => item.seasons.split(", "));

    const summary = `
기존 옷장 정보:
- 카테고리: ${categories.join(", ")}
- 색상: ${colors.join(", ")}
- 계절: ${[...new Set(seasons)].join(", ")}
- 총 ${existingItems.length}개의 아이템

선호 스타일: ${preferredStyle}
${temperature !== undefined ? `현재 온도: ${temperature}°C` : ""}
`;

    const prompt = `당신은 전문 패션 스타일리스트입니다. 사용자의 옷장을 분석하고 새로운 아이템 구매를 추천해주세요.

${summary}

다음 JSON 형식으로 3-5개의 새로운 아이템을 추천해주세요:
{
  "recommendations": [
    {
      "category": "카테고리 (상의, 하의, 아우터, 신발, 악세사리)",
      "item": "구체적인 아이템 이름 (예: 브라운 치노팬츠, 와이드 슬랙스)",
      "reason": "추천 이유 (1-2문장)"
    }
  ]
}

응답은 반드시 JSON만 제공하세요.`;

    const response = await analyzeWithGemini([], prompt);
    const result = parseGeminiJSON<{
      recommendations: Array<{
        category: string;
        item: string;
        reason: string;
      }>;
    }>(response);

    return result.recommendations;
  } catch (error) {
    console.error("새 아이템 추천 오류:", error);
    throw error;
  }
};
