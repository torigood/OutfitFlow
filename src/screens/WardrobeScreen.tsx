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
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import {
  t,
  tCategory,
  CategoryKey,
  tSeason,
  SeasonKey,
} from "../localization/i18n";

import { useLanguage } from "../contexts/LanguageContext"; // 언어 변경 감지

const CATEGORY_LABEL_MAP: Record<string, CategoryKey> = {
  전체: "all",
  all: "all",
  상의: "tops",
  tops: "tops",
  하의: "bottoms",
  bottoms: "bottoms",
  아우터: "outer",
  outerwear: "outer",
  신발: "shoes",
  shoes: "shoes",
  악세사리: "accessories",
  accessories: "accessories",
};

const SEASON_LABEL_MAP: Record<string, SeasonKey> = {
  전체: "all",
  all: "all",
  봄: "spring",
  spring: "spring",
  여름: "summer",
  summer: "summer",
  가을: "autumn",
  autumn: "autumn",
  겨울: "winter",
  winter: "winter",
};

// 카테고리와 계절 key 배열
const CATEGORY_KEYS: CategoryKey[] = [
  "all",
  "tops",
  "bottoms",
  "outer",
  "shoes",
  "accessories",
];
const SEASONS: SeasonKey[] = ["spring", "summer", "autumn", "winter"];

const CATEGORY_ALL: CategoryKey = "all";
const SEASON_FILTER_ALL: SeasonKey = "all";

// Alert 래퍼 함수들
const showAlert = (title: string, message?: string) => {
  Alert.alert(title, message);
};

const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    { text: t("cancleDelete"), style: "cancel", onPress: onCancel },
    { text: t("confirmDelete"), style: "destructive", onPress: onConfirm },
  ]);
};

export default function WardrobeScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedSeasonFilter, setSelectedSeasonFilter] =
    useState<SeasonKey>(SEASON_FILTER_ALL);
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
  const isSeasonFilterActive =
    showSeasonFilterDropdown || selectedSeasonFilter !== SEASON_FILTER_ALL;
  const filterIconColor = isSeasonFilterActive
    ? colors.white
    : colors.textSecondary;

  // 폼 데이터
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<CategoryKey | "">("");
  const [itemSeasons, setItemSeasons] = useState<SeasonKey[]>([]); // 복수 선택 가능
  const [itemColor, setItemColor] = useState("");
  const [itemBrand, setItemBrand] = useState("");

  // 앱 시작 시 Firestore에서 옷 목록 불러오기
  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const items = await getClothingItems(user.uid);
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

  // 렌더링
  const { language } = useLanguage(); // 언어 바뀌면 다시 렌더

  // Pull-to-refresh 핸들러
  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const items = await getClothingItems(user.uid);
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
      showAlert(t("permissionTitle"), t("permissionGallery"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
      showAlert(t("permissionTitle"), t("permissionCamera"));
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
  const toggleSeason = (season: SeasonKey) => {
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
      // DB에 저장된 category 값을 key로 변환
      setItemCategory(
        CATEGORY_LABEL_MAP[selectedItem.category] || selectedItem.category
      );
      // DB에 저장된 seasons 문자열을 key 배열로 변환
      setItemSeasons(
        selectedItem.seasons
          ? selectedItem.seasons
              .split(", ")
              .map((s: string) => SEASON_LABEL_MAP[s] || s)
              .filter((s: any): s is SeasonKey => SEASONS.includes(s))
          : []
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
    if (!user) return;

    showConfirm(
      t("deleteItemConfirmTitle"),
      t("deleteItemConfirmMessage"),
      async () => {
        try {
          setIsUploading(true);
          await deleteClothingItem(user.uid, selectedItem.id);
          setIsDetailModalVisible(false);
          setSelectedItem(null);
          showAlert(t("deleteSuccess"));
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
    if (!user) {
      showAlert("오류", "로그인이 필요합니다.");
      return;
    }

    if (!selectedImage || !itemName || !itemCategory) {
      showAlert(t("enterErrorTitle"), t("enterError"));
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
        await updateClothingItem(user.uid, selectedItem.id, {
          name: itemName,
          color: itemColor,
          brand: itemBrand,
          category: itemCategory,
          seasons: itemSeasons.join(", "),
          imageUrl: imageUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        });
        showAlert(t("itemEditSuccessTitle"), t("itemEditMessage"));
      } else {
        // 추가 모드
        await addClothingItem(user.uid, {
          name: itemName,
          color: itemColor,
          brand: itemBrand,
          category: itemCategory,
          seasons: itemSeasons.join(", "),
          imageUrl: imageUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        });
        showAlert(t("itemAddedTitle"), t("itemAddedMessage"));
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
    // DB에 저장된 category를 key로 변환 (한글/영어 호환)
    const itemCategoryKey = CATEGORY_LABEL_MAP[item.category] || item.category;
    const matchCategory =
      selectedCategory === CATEGORY_ALL || itemCategoryKey === selectedCategory;

    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());

    // DB에 저장된 seasons를 key로 변환해서 매칭 (한글/영어 호환)
    const itemSeasonKeys = (item as any).seasons
      ? (item as any).seasons
          .split(", ")
          .map((s: string) => SEASON_LABEL_MAP[s] || s)
      : [];
    const matchSeason =
      selectedSeasonFilter === SEASON_FILTER_ALL ||
      itemSeasonKeys.includes(selectedSeasonFilter);

    return matchCategory && matchSearch && matchSeason;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t("myWardrobe")}</Text>
              <Text style={styles.subtitle}>
                {t("total")} {clothes.length}
                {t("afterTotal")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.addButtonText}>{t("addItemButton")}</Text>
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
              color={colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchItems")}
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
              key={language} // 언어 바뀌면 스크롤뷰도 리렌더
            >
              {CATEGORY_KEYS.map((category) => (
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
                      selectedCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {tCategory(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 계절 필터 드롭다운 */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  isSeasonFilterActive && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setShowSeasonFilterDropdown(!showSeasonFilterDropdown)
                }
                activeOpacity={0.8}
              >
                <Ionicons name="filter" size={16} color={filterIconColor} />
                <Text
                  style={[
                    styles.filterText,
                    isSeasonFilterActive && styles.filterTextActive,
                  ]}
                >
                  {tSeason(selectedSeasonFilter)}
                </Text>
                <Ionicons
                  name={
                    showSeasonFilterDropdown ? "chevron-up" : "chevron-down"
                  }
                  size={16}
                  color={filterIconColor}
                />
              </TouchableOpacity>
              {showSeasonFilterDropdown && (
                <View style={styles.seasonFilterDropdown}>
                  {[SEASON_FILTER_ALL, ...SEASONS].map((season) => {
                    const isSelected = selectedSeasonFilter === season;
                    return (
                      <Pressable
                        key={season}
                        style={({ hovered, pressed }: any) => [
                          styles.seasonFilterItem,
                          hovered && styles.seasonFilterItemHovered,
                          pressed && styles.seasonFilterItemPressed,
                          isSelected && styles.seasonFilterItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedSeasonFilter(season);
                          setShowSeasonFilterDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.seasonFilterText,
                            isSelected && styles.seasonFilterTextActive,
                          ]}
                        >
                          {tSeason(season)}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.white}
                          />
                        )}
                      </Pressable>
                    );
                  })}
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
                colors={[colors.brand]} // Android
                tintColor={colors.brand} // iOS
              />
            }
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brand} />
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
                    <Ionicons
                      name="shirt-outline"
                      size={64}
                      color={colors.textTertiary}
                    />
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
            animationType="slide"
            presentationStyle="formSheet"
            transparent={false}
            onRequestClose={closeModal}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 2 }}
            >
              <View style={styles.mobileModalContainer}>
                <View style={styles.modalContainer}>
                  {/* 모달 헤더 */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t("AddNewItem")}</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Ionicons
                        name="close"
                        size={28}
                        color={colors.textOnLight}
                      />
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
                            color={colors.textTertiary}
                          />
                          <Text style={styles.imagePlaceholderText}>
                            {t("clickToSelect")}
                          </Text>
                          <Text style={styles.imagePlaceholderText}>
                            {t("dragAnddrop")}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* 카메라 버튼 */}
                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={takePhoto}
                      >
                        <Ionicons
                          name="camera-outline"
                          size={20}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.imageUploadButtonText}>
                          {t("takePiccture")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 아이템 이름 */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>{t("name")}</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder={t("nameItem")}
                        placeholderTextColor={colors.textTertiary}
                        value={itemName}
                        onChangeText={setItemName}
                      />
                    </View>

                    {/* 카테고리 */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>{t("category")}</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                      >
                        <Text style={styles.dropdownButtonText}>
                          {itemCategory
                            ? tCategory(itemCategory)
                            : tCategory("all")}
                        </Text>
                        <Ionicons
                          name={
                            showCategoryDropdown ? "chevron-up" : "chevron-down"
                          }
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      {showCategoryDropdown && (
                        <View style={styles.dropdownList}>
                          {CATEGORY_KEYS.filter(
                            (cat) => cat !== CATEGORY_ALL
                          ).map((category) => {
                            const isSelected = itemCategory === category;
                            return (
                              <Pressable
                                key={category}
                                style={({ hovered, pressed }: any) => [
                                  styles.dropdownItem,
                                  hovered && styles.dropdownItemHovered,
                                  pressed && styles.dropdownItemPressed,
                                  isSelected && styles.dropdownItemSelected,
                                ]}
                                onPress={() => {
                                  setItemCategory(category);
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    isSelected &&
                                      styles.dropdownItemTextSelected,
                                  ]}
                                >
                                  {tCategory(category)}
                                </Text>
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color={colors.white}
                                  />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    {/* 계절 (복수 선택) */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>{t("season")}</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() =>
                          setShowSeasonDropdown(!showSeasonDropdown)
                        }
                      >
                        <Text style={styles.dropdownButtonText}>
                          {itemSeasons.length > 0
                            ? itemSeasons.map((s) => tSeason(s)).join(", ")
                            : tSeason("all")}
                        </Text>
                        <Ionicons
                          name={
                            showSeasonDropdown ? "chevron-up" : "chevron-down"
                          }
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      {showSeasonDropdown && (
                        <View style={styles.dropdownList}>
                          {SEASONS.map((season) => {
                            const isSelected = itemSeasons.includes(season);
                            return (
                              <Pressable
                                key={season}
                                style={({ hovered, pressed }: any) => [
                                  styles.dropdownItem,
                                  hovered && styles.dropdownItemHovered,
                                  pressed && styles.dropdownItemPressed,
                                  isSelected && styles.dropdownItemSelected,
                                ]}
                                onPress={() => toggleSeason(season)}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    isSelected &&
                                      styles.dropdownItemTextSelected,
                                  ]}
                                >
                                  {tSeason(season)}
                                </Text>
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark"
                                    size={20}
                                    color={colors.white}
                                  />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    {/* 색상 */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>{t("color")}</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder={t("colorname")}
                        placeholderTextColor={colors.textTertiary}
                        value={itemColor}
                        onChangeText={setItemColor}
                      />
                    </View>

                    {/* 브랜드 (선택) */}
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        {t("brand")}{" "}
                        <Text style={styles.optionalText}>{t("optional")}</Text>
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder={t("brandname")}
                        placeholderTextColor={colors.textTertiary}
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
                          {isEditMode ? t("editItem") : t("addItemButton")}
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
                      <Text style={styles.detailTitle}>{t("itemDetail")}</Text>
                      <TouchableOpacity onPress={closeDetailModal}>
                        <Ionicons
                          name="close"
                          size={28}
                          color={colors.textOnLight}
                        />
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
                          <Text style={styles.detailLabel}>{t("name")}</Text>
                          <Text style={styles.detailValue}>
                            {selectedItem.name}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            {t("category")}
                          </Text>
                          <Text style={styles.detailValue}>
                            {tCategory(
                              CATEGORY_LABEL_MAP[selectedItem.category] ||
                                selectedItem.category
                            )}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t("season")}</Text>
                          <Text style={styles.detailValue}>
                            {selectedItem.seasons
                              ? selectedItem.seasons
                                  .split(", ")
                                  .map((s: string) =>
                                    tSeason(SEASON_LABEL_MAP[s] || s)
                                  )
                                  .join(", ")
                              : "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t("color")}</Text>
                          <Text style={styles.detailValue}>
                            {selectedItem.color || "-"}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t("brand")}</Text>
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
                        <Ionicons
                          name="pencil"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.editButtonText}>
                          {t("editText")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={closeDetailModal}
                      >
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.white}
                        />
                        <Text style={styles.confirmButtonText}>
                          {t("confirmText")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteItem}
                      >
                        <Ionicons name="trash" size={20} color={colors.white} />
                        <Text style={styles.deleteButtonText}>
                          {t("deleteText")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.textOnLight,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 8,
  },
  searchContainerFocused: {
    borderColor: colors.brand,
  },
  searchIcon: {
    marginRight: 4,
    color: colors.textTertiary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textOnLight,
  },
  filterSectionContainer: {
    marginTop: 0,
    marginBottom: 16,
    zIndex: 100,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softCard,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  seasonFilterDropdown: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: colors.black,
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
    borderBottomColor: colors.border,
  },
  seasonFilterItemHovered: {
    backgroundColor: colors.softCard,
  },
  seasonFilterItemPressed: {
    backgroundColor: colors.brandLight,
  },
  seasonFilterItemSelected: {
    backgroundColor: colors.brand,
    borderBottomColor: colors.brand,
  },
  seasonFilterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  seasonFilterTextActive: {
    color: colors.white,
    fontWeight: "600",
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
    width: "45%",
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
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textOnLight,
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
    backgroundColor: colors.softCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  imageUploadButtonText: {
    fontSize: 14,
    color: colors.textOnLight,
    fontWeight: "600",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.softCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginTop: 12,
  },
  imagePreviewContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.softCard,
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
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softCard,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.textOnLight,
  },
  formInput: {
    backgroundColor: colors.softCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.textOnLight,
  },
  categoryPickerContainer: {
    marginTop: 8,
  },
  categoryPickerButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPickerButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryPickerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryPickerTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  // 드롭다운 스타일
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.softCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: colors.textOnLight,
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textOnLight,
  },
  dropdownItemHovered: {
    backgroundColor: colors.softCard,
  },
  dropdownItemPressed: {
    backgroundColor: colors.brandLight,
  },
  dropdownItemSelected: {
    backgroundColor: colors.brand,
    borderBottomColor: colors.brand,
  },
  dropdownItemTextSelected: {
    color: colors.white,
    fontWeight: "600",
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textTertiary,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonText: {
    color: colors.white,
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
    justifyContent: "space-around",
    alignItems: "center",
  },
  detailModalContent: {
    width: "95%",
    height: "85%",
    backgroundColor: colors.softCard,
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
    borderBottomColor: colors.softCard,
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
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
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
