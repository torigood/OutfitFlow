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
${
  temperature !== undefined
    ? `현재 기온: ${temperature}°C - 이 온도에 적합한지 반드시 고려하세요`
    : ""
}

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
 * 날씨 기반 스마트 코디 추천
 * 유저가 선택한 아이템을 무조건 포함하고, 부족한 부분을 AI가 채워서 완성
 */
export const recommendSmartOutfit = async (
  userSelectedItems: ClothingItem[], // 유저가 선택한 아이템 (0개 이상)
  allItems: ClothingItem[], // 옷장 전체
  preferredStyle: FashionStyle,
  temperature?: number
): Promise<OutfitAnalysis> => {
  try {
    // 유저 선택 아이템으로 시작
    const finalItems: ClothingItem[] = [...userSelectedItems];

    // 온도 기반 계절 필터링
    let availableItems = allItems;
    if (temperature !== undefined) {
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

      const seasonalItems = allItems.filter((item) =>
        seasonFilter.some((season) => item.seasons.includes(season))
      );
      availableItems = seasonalItems.length >= 2 ? seasonalItems : allItems;
    }

    // 이미 선택된 아이템 제외
    const remainingItems = availableItems.filter(
      (item) => !userSelectedItems.find((selected) => selected.id === item.id)
    );

    // 카테고리별 그룹화 (선택되지 않은 아이템들)
    const topItems = remainingItems.filter((item) => item.category === "상의");
    const bottomItems = remainingItems.filter(
      (item) => item.category === "하의"
    );
    const outerItems = remainingItems.filter(
      (item) => item.category === "아우터"
    );
    const shoeItems = remainingItems.filter((item) => item.category === "신발");

    // 이미 선택된 카테고리 확인
    const selectedCategories = userSelectedItems.map((item) => item.category);

    // 상의가 없으면 추가
    if (!selectedCategories.includes("상의") && topItems.length > 0) {
      finalItems.push(topItems[Math.floor(Math.random() * topItems.length)]);
    }

    // 하의가 없으면 추가
    if (!selectedCategories.includes("하의") && bottomItems.length > 0) {
      finalItems.push(
        bottomItems[Math.floor(Math.random() * bottomItems.length)]
      );
    }

    // 추운 날씨면 아우터 추가
    if (
      temperature !== undefined &&
      temperature <= 15 &&
      !selectedCategories.includes("아우터") &&
      outerItems.length > 0 &&
      finalItems.length < 4
    ) {
      finalItems.push(
        outerItems[Math.floor(Math.random() * outerItems.length)]
      );
    }

    // 신발 추가
    if (
      !selectedCategories.includes("신발") &&
      shoeItems.length > 0 &&
      finalItems.length < 4
    ) {
      finalItems.push(shoeItems[Math.floor(Math.random() * shoeItems.length)]);
    }

    // 최소 2개 확보
    if (finalItems.length < 2 && remainingItems.length > 0) {
      const needed = 2 - finalItems.length;
      finalItems.push(...remainingItems.slice(0, needed));
    }

    if (finalItems.length < 2) {
      throw new Error("코디를 완성하기에 옷이 부족합니다.");
    }

    // 중복 제거
    const uniqueItems = Array.from(
      new Map(finalItems.map((item) => [item.id, item])).values()
    );

    // AI 분석
    return await analyzeOutfitCombination(
      uniqueItems.slice(0, 4),
      preferredStyle,
      temperature
    );
  } catch (error) {
    console.error("스마트 추천 오류:", error);
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
    // 기존 옷장 정보 상세 요약
    const itemDetails = existingItems.map(
      (item) => `${item.category} - ${item.color} ${item.name} (${item.brand})`
    );

    const summary = `
기존 옷장에 있는 아이템들:
${itemDetails.join("\n")}

총 ${existingItems.length}개의 아이템 보유
선호 스타일: ${preferredStyle}
${temperature !== undefined ? `현재 온도: ${temperature}°C` : ""}
`;

    const prompt = `당신은 전문 패션 스타일리스트입니다. 사용자의 옷장을 분석하고 새로운 아이템 구매를 추천해주세요.

${summary}

**중요**: 위에 나열된 기존 옷장 아이템과 **유사하거나 중복되는 아이템은 절대 추천하지 마세요**.
옷장에 없거나 부족한 카테고리, 색상, 스타일의 아이템만 추천해주세요.
${
  temperature !== undefined
    ? `현재 온도(${temperature}°C)를 고려하여 지금 시즌에 활용도가 높은 아이템을 우선 추천해주세요.`
    : ""
}

다음 JSON 형식으로 3-5개의 새로운 아이템을 추천해주세요:
{
  "recommendations": [
    {
      "category": "카테고리 (상의, 하의, 아우터, 신발, 악세사리)",
      "item": "구체적인 아이템 이름 (예: 브라운 치노팬츠, 와이드 슬랙스)",
      "reason": "왜 이 아이템이 옷장에 필요한지 설명 (1-2문장)"
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
