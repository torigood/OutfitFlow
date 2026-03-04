import { RAILWAY_BACKEND_URL } from "@env";

/**
 * Backend OpenRouter API를 통해 이미지와 텍스트 프롬프트로 분석 요청
 * @param imageUrls 이미지 URL 배열 (빈 배열 가능)
 * @param prompt 분석 요청 프롬프트
 * @returns AI 응답 텍스트
 */
export const analyzeWithGemini = async (
  imageUrls: string[],
  prompt: string
): Promise<string> => {
  try {
    console.log("=== Backend OpenRouter API 호출 시작 ===");
    console.log("이미지 개수:", imageUrls.length);
    console.log("프롬프트 길이:", prompt.length);

    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_urls: imageUrls,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `AI 분석 실패 (${response.status}): ${
          errorData.detail || "알 수 없는 오류"
        }`
      );
    }

    const data = await response.json();
    const text = data.result || data.message || "";

    if (!text || text.trim().length === 0) {
      throw new Error("AI가 빈 응답을 반환했습니다. 다시 시도해주세요.");
    }

    console.log("AI 응답 길이:", text.length);
    console.log("AI 응답 미리보기:", text.substring(0, 300));
    console.log("=== Backend OpenRouter API 호출 성공 ===");

    return text;
  } catch (error) {
    console.error("Backend AI 분석 오류:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("API_KEY")
      ) {
        throw new Error(
          "API 키 설정 오류입니다. 백엔드 서버 설정을 확인해주세요."
        );
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new Error(
          "API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    }

    throw new Error(
      `AI 분석 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * JSON 응답을 파싱 (마크다운 코드 블록으로 감싸는 경우 처리)
 * @param text AI 응답 텍스트
 * @returns 파싱된 JSON 객체
 */
export const parseGeminiJSON = <T>(text: string): T => {
  try {
    // 빈 응답 체크
    if (!text || text.trim().length === 0) {
      throw new Error("AI 응답이 비어있습니다. 다시 시도해주세요.");
    }

    // 마크다운 코드 블록 제거
    let cleanText = text.trim();

    // ```json ... ``` 형식 제거
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }
    // ``` ... ``` 형식 제거
    else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // JSON 객체 추출 시도 (텍스트 중간에 JSON이 있는 경우)
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    cleanText = cleanText.trim();

    // 빈 텍스트 재확인
    if (!cleanText) {
      throw new Error(
        "JSON 형식을 찾을 수 없습니다. AI 응답이 올바르지 않습니다."
      );
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    console.error("원본 텍스트:", text);
    console.error("텍스트 길이:", text?.length || 0);

    // 더 명확한 에러 메시지
    if (error instanceof SyntaxError) {
      throw new Error(
        `AI 응답이 올바른 JSON 형식이 아닙니다. 다시 시도해주세요. (${error.message})`
      );
    }

    throw new Error(
      `AI 응답을 해석할 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};
