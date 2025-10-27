import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function WardrobeScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // 갤러리에서 이미지 선택 (여러 장 가능)
  const pickImage = async () => {
    // 권한 요청
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // 여러 장 선택을 위해 false
      allowsMultipleSelection: true, // 여러 장 선택 가능
      quality: 0.7, // 용량 절약 (0.7 = 70% 품질)
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  // 카메라로 사진 찍기
  const takePhoto = async () => {
    // 권한 요청
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
      return;
    }

    // 카메라 실행
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4], // 세로 비율 (옷 사진에 적합)
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 모든 이미지 삭제
  const clearAllImages = () => {
    Alert.alert("모두 삭제", "선택한 모든 사진을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => setSelectedImages([]),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 옷장</Text>
        <Text style={styles.subtitle}>
          {selectedImages.length > 0
            ? `${selectedImages.length}장의 사진 선택됨`
            : "옷을 추가해보세요"}
        </Text>
      </View>

      {/* 이미지 그리드 */}
      {selectedImages.length > 0 && (
        <View style={styles.imagesSection}>
          <View style={styles.imageGrid}>
            {selectedImages.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 모두 삭제 버튼 */}
          <TouchableOpacity style={styles.clearButton} onPress={clearAllImages}>
            <Text style={styles.clearButtonText}>모두 삭제</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonText}>갤러리에서 선택</Text>
          <Text style={styles.buttonSubtext}>여러 장 선택 가능</Text>
        </TouchableOpacity>

        {/* 웹에서는 카메라 버튼 숨김 */}
        {Platform.OS !== "web" && (
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={styles.buttonText}>사진 촬영</Text>
            <Text style={styles.buttonSubtext}>카메라로 찍기</Text>
          </TouchableOpacity>
        )}

        {/* 다음 단계 버튼 (이미지가 있을 때만 활성화) */}
        {selectedImages.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              Alert.alert(
                "다음 단계",
                "옷 정보를 입력하는 화면으로 이동합니다."
              );
              // 나중에 AddClothingDetailScreen으로 이동
            }}
          >
            <Text style={styles.primaryButtonText}>다음 단계</Text>
            <Text style={styles.primaryButtonSubtext}>옷 정보 입력하기 →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 웹 사용자 안내 메시지 */}
      {Platform.OS === "web" && (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>
            💡 웹에서는 갤러리 선택만 가능합니다.
          </Text>
          <Text style={styles.webNoticeText}>
            카메라 기능은 모바일 앱에서 사용하세요.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  imagesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  imageWrapper: {
    width: "20%",
    aspectRatio: 3 / 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4444",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  button: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonSubtext: {
    color: "#666",
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    color: "#ccc",
    fontSize: 12,
  },
  webNotice: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b3d9ff",
  },
  webNoticeText: {
    color: "#0066cc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
});
