import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import { CLOUDINARY_CONFIG } from "../config/cloudinary";
import { CloudinaryUploadResponse } from "../types/wardrobe";

/**
 * 이미지를 압축/리사이징하여 Cloudinary에 업로드
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

    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", "wardrobe"); // wardrobe 폴더에 저장

    // 3. Cloudinary에 업로드
    const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Cloudinary 업로드 실패: ${
          errorData.error?.message || "알 수 없는 오류"
        }`
      );
    }

    const data: CloudinaryUploadResponse = await response.json();

    // 4. 업로드된 이미지 URL과 public_id 반환
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary 업로드 오류:", error);
    throw new Error(
      `이미지 업로드 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * Cloudinary에서 이미지 삭제
 * 참고: Unsigned 업로드 방식에서는 클라이언트에서 직접 삭제가 불가능합니다.
 * Cloudinary Dashboard에서 수동으로 삭제하거나, 백엔드 서버를 통해 삭제해야 합니다.
 * 현재는 삭제 기능을 생략하고, Firestore에서만 데이터를 삭제합니다.
 */
export const deleteImageFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  // Unsigned 업로드 방식에서는 클라이언트에서 삭제 불가
  // 추후 백엔드 서버 구현 시 추가 가능
  console.log("Cloudinary 이미지는 Dashboard에서 수동 삭제 필요:", imageUrl);
};
