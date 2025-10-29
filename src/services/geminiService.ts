import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Gemini 2.5 Flash 모델 가져오기
 */
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
};

/**
 * 이미지 URL을 Base64로 변환 (플랫폼별 처리)
 * @param imageUrl Cloudinary 이미지 URL
 * @returns Base64 인코딩된 이미지 데이터
 */
export const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    if (Platform.OS === "web") {
      // 웹: fetch + ArrayBuffer + btoa 사용
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } else {
      // 모바일: expo-file-system 사용
      const file = await File.downloadFileAsync(imageUrl, Paths.cache);
      const base64 = file.base64();
      file.delete();
      return base64;
    }
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
 * @param imageUrls 이미지 URL 배열
 * @param prompt 분석 요청 프롬프트
 * @returns AI 응답 텍스트
 */
export const analyzeWithGemini = async (
  imageUrls: string[],
  prompt: string
): Promise<string> => {
  try {
    const model = getGeminiModel();

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

    // Gemini에게 분석 요청
    const result = await model.generateContent([...imageParts, prompt]);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini 분석 오류:", error);
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
    // 마크다운 코드 블록 제거
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/, "").replace(/```$/, "");
    }

    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    console.error("원본 텍스트:", text);
    throw new Error(
      `AI 응답을 해석할 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};
