import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import {
  downloadAsync,
  readAsStringAsync,
  deleteAsync,
  cacheDirectory,
  EncodingType,
} from "expo-file-system/legacy";

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Gemini 모델 가져오기
 * Gemini 1.5는 2025년 4월에 사용 중단됨, 2.0+ 모델 사용
 */
export const getGeminiModel = () => {
  // gemini-2.0-flash: 멀티모달 (이미지 + 텍스트 모두 지원)
  // gemini-2.5-flash: 최신 모델 (Python SDK에서 사용)
  const modelName = "gemini-2.0-flash";

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });
};

/**
 * 이미지 URL을 Base64로 변환 (모든 플랫폼 통합)
 * @param imageUrl Cloudinary 이미지 URL
 * @returns Base64 인코딩된 이미지 데이터
 */
export const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    // 임시 파일명 생성
    const filename = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.jpg`;
    const fileUri = `${cacheDirectory}${filename}`;

    // 이미지 다운로드
    const downloadResult = await downloadAsync(imageUrl, fileUri);

    // Base64로 읽기
    const base64 = await readAsStringAsync(downloadResult.uri, {
      encoding: EncodingType.Base64,
    });

    // 임시 파일 삭제
    await deleteAsync(fileUri, { idempotent: true });

    return base64;
  } catch (error) {
    console.error("이미지 변환 오류:", error);
    throw new Error(
      `이미지를 불러올 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * Gemini AI에게 이미지와 텍스트 프롬프트로 분석 요청
 * @param imageUrls 이미지 URL 배열 (빈 배열 가능)
 * @param prompt 분석 요청 프롬프트
 * @returns AI 응답 텍스트
 */
export const analyzeWithGemini = async (
  imageUrls: string[],
  prompt: string
): Promise<string> => {
  try {
    const hasImages = imageUrls.length > 0;
    const model = getGeminiModel(); // gemini-2.0-flash는 멀티모달이라 하나로 통일

    console.log("=== Gemini API 호출 시작 ===");
    console.log("사용 모델: gemini-2.0-flash");
    console.log("이미지 개수:", imageUrls.length);
    console.log("프롬프트 길이:", prompt.length);

    let result;

    // 이미지가 있는 경우
    if (hasImages) {
      // 이미지를 Base64로 변환
      const imagePromises = imageUrls.map(async (url) => {
        const base64 = await imageUrlToBase64(url);
        return {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64,
          },
        };
      });

      const imageParts = await Promise.all(imagePromises);
      console.log("이미지 변환 완료:", imageParts.length, "개");

      // Gemini에게 분석 요청 (이미지 + 텍스트)
      result = await model.generateContent([...imageParts, prompt]);
    } else {
      // 이미지 없이 텍스트만 요청
      console.log("텍스트만 요청");
      result = await model.generateContent(prompt);
    }

    console.log("API 응답 받음");
    const response = result.response;

    // 응답 상태 확인
    console.log("응답 candidates:", response.candidates?.length || 0);

    const text = response.text();
    console.log("텍스트 추출 완료");

    // 빈 응답 체크
    if (!text || text.trim().length === 0) {
      console.error("빈 응답 감지!");
      throw new Error("AI가 빈 응답을 반환했습니다. 다시 시도해주세요.");
    }

    console.log("Gemini 응답 길이:", text.length);
    console.log("Gemini 응답 미리보기:", text.substring(0, 300));
    console.log("=== Gemini API 호출 완료 ===");

    return text;
  } catch (error) {
    console.error("=== Gemini 분석 오류 ===");
    console.error("오류 타입:", error?.constructor?.name);
    console.error("오류 메시지:", error);

    // 더 구체적인 에러 메시지
    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("API_KEY")
      ) {
        throw new Error(
          "API 키가 올바르지 않습니다. .env 파일의 GEMINI_API_KEY를 확인해주세요."
        );
      }
      if (error.message.includes("quota") || error.message.includes("429")) {
        throw new Error(
          "API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요."
        );
      }
      if (
        error.message.includes("network") ||
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "네트워크 연결을 확인해주세요. 인터넷에 연결되어 있나요?"
        );
      }
      if (
        error.message.includes("blocked") ||
        error.message.includes("safety")
      ) {
        throw new Error(
          "AI가 요청을 거부했습니다. 다른 내용으로 시도해주세요."
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
 * JSON 응답을 파싱 (Gemini가 마크다운 코드 블록으로 감싸는 경우 처리)
 * @param text Gemini 응답 텍스트
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
