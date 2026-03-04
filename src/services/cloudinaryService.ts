import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import { RAILWAY_BACKEND_URL } from "@env";

/**
 * 이미지를 압축/리사이징하여 Backend를 통해 Cloudinary에 업로드
 * @param imageUri - 로컬 이미지 URI
 * @returns Cloudinary 이미지 URL과 public_id
 */
export const uploadImageToCloudinary = async (
  imageUri: string
): Promise<{ url: string; publicId: string }> => {
  try {
    let finalUri = imageUri;

    // 1. 이미지 압축 및 리사이징 (웹이 아닌 경우에만)
    if (Platform.OS !== "web") {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }], // 너비를 1200px로 제한 (비율 유지)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      finalUri = manipulatedImage.uri;
    }

    // 2. FormData 생성
    const formData = new FormData();

    // 플랫폼별 파일 처리
    if (Platform.OS === "web") {
      // 웹: Blob으로 변환
      const response = await fetch(finalUri);
      const blob = await response.blob();
      formData.append("file", blob, `photo_${Date.now()}.jpg`);
    } else {
      // 모바일: React Native 형식
      const file: any = {
        uri: finalUri,
        type: "image/jpeg",
        name: `photo_${Date.now()}.jpg`,
      };
      formData.append("file", file);
    }

    // 3. Backend API에 업로드
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/image/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `이미지 업로드 실패: ${
          errorData.detail || "알 수 없는 오류"
        }`
      );
    }

    const data = await response.json();

    // 4. 업로드된 이미지 URL과 public_id 반환
    return {
      url: data.url,
      publicId: data.publicId,
    };
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw new Error(
      `이미지 업로드 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * Backend를 통해 Cloudinary에서 이미지 삭제
 * @param publicId - Cloudinary public_id
 */
export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/image`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `이미지 삭제 실패: ${errorData.detail || "알 수 없는 오류"}`
      );
    }

    console.log("이미지 삭제 완료:", publicId);
  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    throw new Error(
      `이미지 삭제 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};
