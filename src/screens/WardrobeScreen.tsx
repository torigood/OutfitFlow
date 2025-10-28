import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// 샘플 옷 데이터
const SAMPLE_CLOTHES = [
  {
    id: 1,
    name: "화이트 셔츠",
    color: "화이트",
    brand: "유니클로",
    category: "상의",
    image: "https://via.placeholder.com/300x400/CCCCCC/666666?text=Shirt",
  },
  {
    id: 2,
    name: "블랙 진",
    color: "블랙",
    brand: "리바이스",
    category: "하의",
    image: "https://via.placeholder.com/300x400/333333/AAAAAA?text=Jeans",
  },
  {
    id: 3,
    name: "스니커즈",
    color: "화이트",
    brand: "나이키",
    category: "신발",
    image: "https://via.placeholder.com/300x400/EEEEEE/888888?text=Shoes",
  },
  {
    id: 4,
    name: "레더 자켓",
    color: "블랙",
    brand: "Zara",
    category: "아우터",
    image: "https://via.placeholder.com/300x400/222222/999999?text=Jacket",
  },
];

const CATEGORIES = ["전체", "상의", "하의", "아우터", "신발", "악세사리"];
const SEASONS = ["봄", "여름", "가을", "겨울"];

export default function WardrobeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [clothes, setClothes] = useState(SAMPLE_CLOTHES);
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState("전체");

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 드롭다운 상태
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showSeasonFilterDropdown, setShowSeasonFilterDropdown] =
    useState(false);

  // 폼 데이터
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemSeasons, setItemSeasons] = useState<string[]>([]); // 복수 선택 가능
  const [itemColor, setItemColor] = useState("");
  const [itemBrand, setItemBrand] = useState("");

  // 이미지 선택 함수
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 카메라로 사진 찍기
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 계절 토글 (복수 선택)
  const toggleSeason = (season: string) => {
    if (itemSeasons.includes(season)) {
      setItemSeasons(itemSeasons.filter((s) => s !== season));
    } else {
      setItemSeasons([...itemSeasons, season]);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setSelectedImage(null);
    setItemName("");
    setItemCategory("");
    setItemSeasons([]);
    setItemColor("");
    setItemBrand("");
    setShowCategoryDropdown(false);
    setShowSeasonDropdown(false);
  };

  // 모달 닫기
  const closeModal = () => {
    resetForm();
    setIsModalVisible(false);
  };

  // 아이템 추가
  const handleAddItem = () => {
    if (!selectedImage || !itemName || !itemCategory) {
      Alert.alert("입력 오류", "이미지, 아이템 이름, 카테고리는 필수입니다.");
      return;
    }

    const newItem = {
      id: clothes.length + 1,
      name: itemName,
      color: itemColor,
      brand: itemBrand,
      category: itemCategory,
      seasons: itemSeasons.join(", "), // 배열을 문자열로 변환
      image: selectedImage,
    };

    setClothes([...clothes, newItem]);

    // 폼 초기화 및 모달 닫기
    resetForm();
    setIsModalVisible(false);

    Alert.alert("성공", "아이템이 추가되었습니다!");
  };

  // 필터링된 옷 목록
  const filteredClothes = clothes.filter((item) => {
    const matchCategory =
      selectedCategory === "전체" || item.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSeason =
      selectedSeasonFilter === "전체" ||
      (item as any).seasons?.includes(selectedSeasonFilter);
    return matchCategory && matchSearch && matchSeason;
  });

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>내 옷장</Text>
          <Text style={styles.subtitle}>총 {clothes.length}개의 아이템</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>아이템 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="아이템 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 카테고리 및 필터 섹션 */}
      <View style={styles.filterSectionContainer}>
        {/* 카테고리 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 계절 필터 드롭다운 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setShowSeasonFilterDropdown(!showSeasonFilterDropdown)
            }
          >
            <Ionicons name="filter" size={16} color="#666" />
            <Text style={styles.filterText}>{selectedSeasonFilter}</Text>
            <Ionicons
              name={showSeasonFilterDropdown ? "chevron-up" : "chevron-down"}
              size={16}
              color="#666"
            />
          </TouchableOpacity>
          {showSeasonFilterDropdown && (
            <View style={styles.seasonFilterDropdown}>
              <Pressable
                style={({ hovered }: any) => [
                  styles.seasonFilterItem,
                  hovered && styles.seasonFilterItemHovered,
                ]}
                onPress={() => {
                  setSelectedSeasonFilter("전체");
                  setShowSeasonFilterDropdown(false);
                }}
              >
                <Text style={styles.seasonFilterText}>전체</Text>
                {selectedSeasonFilter === "전체" && (
                  <Ionicons name="checkmark" size={20} color="#000" />
                )}
              </Pressable>
              {SEASONS.map((season) => (
                <Pressable
                  key={season}
                  style={({ hovered }: any) => [
                    styles.seasonFilterItem,
                    hovered && styles.seasonFilterItemHovered,
                  ]}
                  onPress={() => {
                    setSelectedSeasonFilter(season);
                    setShowSeasonFilterDropdown(false);
                  }}
                >
                  <Text style={styles.seasonFilterText}>{season}</Text>
                  {selectedSeasonFilter === season && (
                    <Ionicons name="checkmark" size={20} color="#000" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 옷 그리드 */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {filteredClothes.map((item) => (
            <TouchableOpacity key={item.id} style={styles.clothingCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.clothingImage}
              />
              <View style={styles.clothingInfo}>
                <Text style={styles.clothingName}>{item.name}</Text>
                <Text style={styles.clothingColor}>{item.color}</Text>
                <Text style={styles.clothingBrand}>{item.brand}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 빈 상태 */}
        {filteredClothes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>아이템이 없습니다</Text>
            <Text style={styles.emptySubtext}>새로운 옷을 추가해보세요</Text>
          </View>
        )}
      </ScrollView>

      {/* 아이템 추가 모달 */}
      <Modal
        visible={isModalVisible}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        presentationStyle={Platform.OS === "web" ? undefined : "formSheet"}
        transparent={Platform.OS === "web"}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 2 }}
        >
          <View
            style={
              Platform.OS === "web"
                ? styles.webModalOverlay
                : styles.mobileModalContainer
            }
          >
            <View
              style={
                Platform.OS === "web"
                  ? styles.webModalContent
                  : styles.modalContainer
              }
            >
              {/* 모달 헤더 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>새 아이템 추가</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* 이미지 업로드 영역 */}
                <View style={styles.imageUploadSection}>
                  {/* 이미지 프리뷰 */}
                  {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={28}
                          color="#ff4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePlaceholder}
                      onPress={pickImage}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={48}
                        color="#ccc"
                      />
                      <Text style={styles.imagePlaceholderText}>
                        클릭하여 파일을 선택하거나
                      </Text>
                      <Text style={styles.imagePlaceholderText}>
                        드래그 앤 드롭하세요
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* 카메라 버튼 (모바일만) */}
                  {Platform.OS !== "web" && (
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={takePhoto}
                    >
                      <Ionicons name="camera-outline" size={20} color="#666" />
                      <Text style={styles.imageUploadButtonText}>
                        사진 촬영
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 아이템 이름 */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>아이템 이름</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="아이템 이름을 입력하세요"
                    placeholderTextColor="#bbb"
                    value={itemName}
                    onChangeText={setItemName}
                  />
                </View>

                {/* 카테고리 */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>카테고리</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                  >
                    <Text style={styles.dropdownButtonText}>
                      {itemCategory || "카테고리 선택"}
                    </Text>
                    <Ionicons
                      name={
                        showCategoryDropdown ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  {showCategoryDropdown && (
                    <View style={styles.dropdownList}>
                      {CATEGORIES.filter((cat) => cat !== "전체").map(
                        (category) => (
                          <TouchableOpacity
                            key={category}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setItemCategory(category);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>
                              {category}
                            </Text>
                            {itemCategory === category && (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color="#000"
                              />
                            )}
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  )}
                </View>

                {/* 계절 (복수 선택) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>계절</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowSeasonDropdown(!showSeasonDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {itemSeasons.length > 0
                        ? itemSeasons.join(", ")
                        : "계절 선택 (중복 선택 가능)"}
                    </Text>
                    <Ionicons
                      name={showSeasonDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                  {showSeasonDropdown && (
                    <View style={styles.dropdownList}>
                      {SEASONS.map((season) => (
                        <Pressable
                          key={season}
                          style={({ hovered }: any) => [
                            styles.dropdownItem,
                            itemSeasons.includes(season) &&
                              styles.dropdownItemSelected,
                            hovered && styles.dropdownItemHovered,
                          ]}
                          onPress={() => toggleSeason(season)}
                        >
                          <Text style={styles.dropdownItemText}>{season}</Text>
                          {itemSeasons.includes(season) && (
                            <Ionicons name="checkmark" size={20} color="#000" />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* 색상 */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>색상</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="색상을 입력하세요"
                    placeholderTextColor="#bbb"
                    value={itemColor}
                    onChangeText={setItemColor}
                  />
                </View>

                {/* 브랜드 (선택) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    브랜드 <Text style={styles.optionalText}>(선택)</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="브랜드를 입력하세요"
                    placeholderTextColor="#bbb"
                    value={itemBrand}
                    onChangeText={setItemBrand}
                  />
                </View>
              </ScrollView>

              {/* 추가 버튼 */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddItem}
                >
                  <Text style={styles.submitButtonText}>아이템 추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    width: "100%",
    maxWidth: Platform.select({ web: 1400, default: undefined }),
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  filterSectionContainer: {
    marginTop: Platform.select({ web: 16, default: 0 }),
    marginBottom: Platform.select({ web: 20, default: 16 }),
    zIndex: 100,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 35,
  },
  categoryTabActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  categoryText: {
    fontSize: 13,
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    position: "relative",
    zIndex: 100,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  seasonFilterDropdown: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 120,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  seasonFilterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.2s",
      },
    }),
  },
  seasonFilterItemHovered: {
    backgroundColor: "#f5f5f5",
  },
  seasonFilterText: {
    fontSize: 14,
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  clothingCard: {
    width: Platform.select({ web: "20%", default: "45%" }),
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  clothingImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#f0f0f0",
  },
  clothingInfo: {
    padding: 12,
  },
  clothingName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  clothingColor: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  clothingBrand: {
    fontSize: 12,
    color: "#999",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
  },
  // 모바일 모달 컨테이너
  mobileModalContainer: {
    flex: 1,
  },
  // 웹 모달 오버레이 (반투명 배경)
  webModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // 웹 모달 컨텐츠 (중앙 팝업)
  webModalContent: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageUploadSection: {
    marginVertical: 20,
  },
  imageUploadButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  imageUploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  imageUploadButtonText: {
    fontSize: 14,
    color: "#666",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
    marginTop: 12,
  },
  imagePreviewContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageRemoveButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  formInput: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 15,
  },
  categoryPickerContainer: {
    marginTop: 8,
  },
  categoryPickerButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryPickerButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  categoryPickerText: {
    fontSize: 13,
    color: "#666",
  },
  categoryPickerTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  // 드롭다운 스타일
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownButtonText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.2s",
      },
    }),
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownItemHovered: {
    backgroundColor: "#f5f5f5",
  },
  dropdownItemSelected: {
    backgroundColor: "#e8e8e8",
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
