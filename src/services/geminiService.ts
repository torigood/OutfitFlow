import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import { Platform } from "react-native";
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
  // Python SDK에서 사용하는 최신 모델
  // gemini-2.5-flash: 최신 멀티모달 모델 (이미지 + 텍스트 모두 지원)
  const modelName = "gemini-2.0-flash-exp";

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
 * 웹에서 이미지 URL을 Base64로 변환
 */
const imageUrlToBase64Web = async (imageUrl: string): Promise<string> => {
  try {
    console.log("웹: 이미지 fetch 시작:", imageUrl);

    // fetch로 이미지 가져오기
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`이미지 로드 실패: ${response.status}`);
    }

    // Blob으로 변환
    const blob = await response.blob();

    // Base64로 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // "data:image/jpeg;base64," 부분 제거
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("웹 이미지 변환 오류:", error);
    throw new Error(
      `이미지를 불러올 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 모바일 앱에서 이미지 URL을 Base64로 변환
 */
const imageUrlToBase64Native = async (imageUrl: string): Promise<string> => {
  try {
    console.log("모바일: 이미지 다운로드 시작:", imageUrl);

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
    console.error("모바일 이미지 변환 오류:", error);
    throw new Error(
      `이미지를 불러올 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 이미지 URL을 Base64로 변환 (모든 플랫폼 통합)
 * @param imageUrl Cloudinary 이미지 URL
 * @returns Base64 인코딩된 이미지 데이터
 */
export const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  // 플랫폼별로 다른 함수 사용
  if (Platform.OS === "web") {
    return imageUrlToBase64Web(imageUrl);
  } else {
    return imageUrlToBase64Native(imageUrl);
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
  // 여러 모델을 순서대로 시도 (fallback)
  const modelNames = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-pro-vision",
    "gemini-pro",
  ];

  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      const hasImages = imageUrls.length > 0;
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });

      console.log("=== Gemini API 호출 시작 ===");
      console.log("시도 모델:", modelName);
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
      console.log(`=== Gemini API 호출 성공 (모델: ${modelName}) ===`);

      return text;
    } catch (error) {
      console.error(`모델 ${modelName} 실패:`, error);

      // 404 에러면 다음 모델 시도
      if (error instanceof Error && error.message.includes("404")) {
        console.log(`모델 ${modelName}를 사용할 수 없음, 다음 모델 시도...`);
        lastError = error;
        continue;
      }

      // 다른 치명적 에러는 즉시 throw
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
          error.message.includes("blocked") ||
          error.message.includes("safety")
        ) {
          throw new Error(
            "AI가 요청을 거부했습니다. 다른 내용으로 시도해주세요."
          );
        }
      }

      lastError = error as Error;
      console.log("다음 모델 시도...");
    }
  }

  // 모든 모델이 실패한 경우
  console.error("=== 모든 Gemini 모델 실패 ===");
  throw new Error(
    `모든 AI 모델을 시도했지만 실패했습니다. 마지막 오류: ${
      lastError?.message || "알 수 없는 오류"
    }`
  );
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
