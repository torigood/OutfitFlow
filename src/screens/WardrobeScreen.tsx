import React, { useState, useEffect } from "react";
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
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import {
  addClothingItem,
  getClothingItems,
  updateClothingItem,
  deleteClothingItem,
} from "../services/wardrobeService";
import { ClothingItem } from "../types/wardrobe";

const CATEGORIES = ["전체", "상의", "하의", "아우터", "신발", "악세사리"];
const SEASONS = ["봄", "여름", "가을", "겨울"];

// 웹 호환 Alert 래퍼 함수들
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}${message ? `\n${message}` : ""}`);
  } else {
    Alert.alert(title, message);
  }
};

const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (Platform.OS === "web") {
    const result = window.confirm(`${title}\n${message}`);
    if (result) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: "취소", style: "cancel", onPress: onCancel },
      { text: "확인", style: "destructive", onPress: onConfirm },
    ]);
  }
};

export default function WardrobeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState("전체");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true); // 전체 로딩 (데이터 불러오기)
  const [isUploading, setIsUploading] = useState(false); // 업로드/저장 중
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh 상태

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  // 앱 시작 시 Firestore에서 옷 목록 불러오기
  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    try {
      setIsLoading(true);
      const items = await getClothingItems();
      setClothes(items);
    } catch (error) {
      showAlert(
        "오류",
        `옷 목록을 불러오는데 실패했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Pull-to-refresh 핸들러
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const items = await getClothingItems();
      setClothes(items);
    } catch (error) {
      showAlert(
        "오류",
        `새로고침 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setRefreshing(false);
    }
  };

  // 이미지 선택 함수
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert("권한 필요", "갤러리 접근 권한이 필요합니다.");
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
      showAlert("권한 필요", "카메라 접근 권한이 필요합니다.");
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

  // 아이템 클릭 - 상세보기
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailModalVisible(true);
  };

  // 수정 모드로 전환
  const handleEditItem = () => {
    if (selectedItem) {
      setItemName(selectedItem.name);
      setItemCategory(selectedItem.category);
      setItemSeasons(
        selectedItem.seasons ? selectedItem.seasons.split(", ") : []
      );
      setItemColor(selectedItem.color || "");
      setItemBrand(selectedItem.brand || "");
      setSelectedImage(selectedItem.imageUrl);
      setIsEditMode(true);
      setIsDetailModalVisible(false);
      setIsModalVisible(true);
    }
  };

  // 아이템 삭제
  const handleDeleteItem = () => {
    showConfirm(
      "삭제 확인",
      "이 아이템을 삭제하시겠습니까?",
      async () => {
        try {
          setIsUploading(true);
          await deleteClothingItem(selectedItem.id);
          setIsDetailModalVisible(false);
          setSelectedItem(null);
          showAlert("성공", "아이템이 삭제되었습니다.");
          // 목록 새로고침
          await loadClothes();
        } catch (error) {
          showAlert(
            "오류",
            `삭제 실패: ${
              error instanceof Error ? error.message : "알 수 없는 오류"
            }`
          );
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedItem(null);
  };

  // 아이템 추가 또는 수정
  const handleAddItem = async () => {
    if (!selectedImage || !itemName || !itemCategory) {
      showAlert("입력 오류", "이미지, 아이템 이름, 카테고리는 필수입니다.");
      return;
    }

    try {
      setIsUploading(true);

      // 이미지가 변경되었는지 확인 (수정 모드일 때)
      const isImageChanged =
        isEditMode && selectedItem && selectedImage !== selectedItem.imageUrl;

      let imageUrl = selectedImage;
      let cloudinaryPublicId =
        isEditMode && selectedItem ? selectedItem.cloudinaryPublicId : "";

      // 새 이미지이거나 이미지가 변경된 경우 Cloudinary에 업로드
      if (!isEditMode || isImageChanged) {
        // 로컬 이미지인 경우에만 업로드 (http로 시작하지 않으면 로컬)
        if (!selectedImage.startsWith("http")) {
          const uploadResult = await uploadImageToCloudinary(selectedImage);
          imageUrl = uploadResult.url;
          cloudinaryPublicId = uploadResult.publicId;
        }
      }

      if (isEditMode && selectedItem) {
        // 수정 모드
        await updateClothingItem(selectedItem.id, {
          name: itemName,
          color: itemColor,
          brand: itemBrand,
          category: itemCategory,
          seasons: itemSeasons.join(", "),
          imageUrl: imageUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        });
        showAlert("성공", "아이템이 수정되었습니다!");
      } else {
        // 추가 모드
        await addClothingItem({
          name: itemName,
          color: itemColor,
          brand: itemBrand,
          category: itemCategory,
          seasons: itemSeasons.join(", "),
          imageUrl: imageUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        });
        showAlert("성공", "아이템이 추가되었습니다!");
      }

      // 목록 새로고침
      await loadClothes();

      // 폼 초기화 및 모달 닫기
      resetForm();
      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedItem(null);
    } catch (error) {
      showAlert(
        "오류",
        `작업 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsUploading(false);
    }
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
    <TouchableWithoutFeedback
      onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
    >
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
        <View
          style={[
            styles.searchContainer,
            isSearchFocused && styles.searchContainerFocused,
          ]}
        >
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
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
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
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000"]} // Android
              tintColor="#000" // iOS
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>옷 목록을 불러오는 중...</Text>
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {filteredClothes.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.clothingCard}
                    onPress={() => handleItemClick(item)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
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
              {filteredClothes.length === 0 && !isLoading && (
                <View style={styles.emptyState}>
                  <Ionicons name="shirt-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>아이템이 없습니다</Text>
                  <Text style={styles.emptySubtext}>
                    새로운 옷을 추가해보세요
                  </Text>
                </View>
              )}
            </>
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
                        <Ionicons
                          name="camera-outline"
                          size={20}
                          color="#666"
                        />
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
                        name={
                          showSeasonDropdown ? "chevron-up" : "chevron-down"
                        }
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
                            <Text style={styles.dropdownItemText}>
                              {season}
                            </Text>
                            {itemSeasons.includes(season) && (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color="#000"
                              />
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

                {/* 추가/수정 버튼 */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isUploading && styles.submitButtonDisabled,
                    ]}
                    onPress={handleAddItem}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.submitButtonText}>
                          {isEditMode ? "수정 중..." : "추가 중..."}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isEditMode ? "아이템 수정" : "아이템 추가"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* 아이템 상세 모달 */}
        <Modal
          visible={isDetailModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={closeDetailModal}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalContent}>
              {selectedItem && (
                <>
                  {/* 상세 헤더 */}
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>아이템 상세</Text>
                    <TouchableOpacity onPress={closeDetailModal}>
                      <Ionicons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                  </View>

                  {/* 스크롤 가능한 컨텐츠 */}
                  <ScrollView
                    style={styles.detailScrollView}
                    showsVerticalScrollIndicator={true}
                  >
                    {/* 이미지 */}
                    <Image
                      source={{ uri: selectedItem.imageUrl }}
                      style={styles.detailImage}
                    />

                    {/* 정보 */}
                    <View style={styles.detailInfo}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>이름</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem.name}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>카테고리</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem.category}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>계절</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem.seasons || "-"}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>색상</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem.color || "-"}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>브랜드</Text>
                        <Text style={styles.detailValue}>
                          {selectedItem.brand || "-"}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/* 액션 버튼 */}
                  <View style={styles.detailActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleEditItem}
                    >
                      <Ionicons name="pencil" size={20} color="#fff" />
                      <Text style={styles.editButtonText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteItem}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.deleteButtonText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
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
    fontSize: 16,
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
  searchContainerFocused: {
    borderColor: "#000",
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    ...Platform.select({
      web: {
        outlineStyle: "none" as any,
      },
    }),
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
    paddingHorizontal: 13,
    paddingVertical: 7,
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
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
    aspectRatio: 3 / 2,
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // 상세 모달 스타일
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
    width: Platform.select({ web: "90%", default: "95%" }),
    maxWidth: Platform.select({ web: 500, default: undefined }),
    height: Platform.select({ web: "85%", default: "90%" }),
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detailScrollView: {
    flex: 1,
  },
  detailImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#f0f0f0",
  },
  detailInfo: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    color: "#000",
  },
  detailActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff4444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
