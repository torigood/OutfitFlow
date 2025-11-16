import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
  TextInput,
  Pressable,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { X, Search, Heart } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getClothingItems } from "../services/wardrobeService";
import {
  recommendSmartOutfit,
  recommendNewItems,
} from "../services/fashionAIService";
import { getWeatherByCurrentLocation } from "../services/weatherService";
import { ClothingItem } from "../types/wardrobe";
import { OutfitAnalysis, FashionStyle, WeatherInfo } from "../types/ai";
import { colors } from "../theme/colors";
import { SoftSheet } from "../components/SoftSheet";
import {
  saveAiOutfit,
  findSavedOutfitByItems,
} from "../services/savedOutfitService";
import Toast from "react-native-toast-message";
import { useLanguage } from "../contexts/LanguageContext";
import { t, tCategory, tSeason, tStyle } from "../localization/i18n";
import type { CategoryKey, SeasonKey, StyleKey } from "../localization/i18n";

const STYLES: FashionStyle[] = [
  "캐주얼",
  "미니멀",
  "스트릿",
  "포멀",
  "스포티",
  "빈티지",
  "페미닌",
  "댄디",
  "기타",
];

const STYLE_LABEL_KEYS: Record<FashionStyle, StyleKey> = {
  캐주얼: "casual",
  미니멀: "minimal",
  스트릿: "street",
  포멀: "formal",
  스포티: "sporty",
  빈티지: "vintage",
  페미닌: "feminine",
  댄디: "dandy",
  기타: "etc",
};

const CATEGORY_LABEL_MAP: Record<string, CategoryKey> = {
  전체: "all",
  all: "all",
  상의: "tops",
  tops: "tops",
  하의: "bottoms",
  bottoms: "bottoms",
  아우터: "outer",
  outer: "outer",
  outerwear: "outer",
  신발: "shoes",
  shoes: "shoes",
  악세서리: "accessories",
  악세사리: "accessories",
  accessories: "accessories",
};

type WeatherConditionKey =
  | "weatherConditionClear"
  | "weatherConditionCloudy"
  | "weatherConditionRain"
  | "weatherConditionSnow";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const getWeatherConditionKey = (condition: string): WeatherConditionKey => {
  if (!condition) return "weatherConditionCloudy";
  const normalized = condition.toLowerCase();
  if (
    condition.includes("맑") ||
    normalized.includes("clear") ||
    normalized.includes("sun")
  )
    return "weatherConditionClear";
  if (
    condition.includes("흐") ||
    normalized.includes("cloud") ||
    normalized.includes("overcast")
  )
    return "weatherConditionCloudy";
  if (condition.includes("비") || normalized.includes("rain"))
    return "weatherConditionRain";
  if (condition.includes("눈") || normalized.includes("snow"))
    return "weatherConditionSnow";
  return "weatherConditionCloudy";
};

const getWeatherIconName = (conditionKey: WeatherConditionKey): IoniconName => {
  switch (conditionKey) {
    case "weatherConditionClear":
      return "sunny";
    case "weatherConditionRain":
      return "rainy";
    case "weatherConditionSnow":
      return "snow";
    default:
      return "cloudy";
  }
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
  fall: "autumn",
  겨울: "winter",
  winter: "winter",
};
const CATEGORY_KEYS: CategoryKey[] = [
  "all",
  "tops",
  "bottoms",
  "outer",
  "shoes",
  "accessories",
];
const SEASON_FILTER_OPTIONS: SeasonKey[] = [
  "all",
  "spring",
  "summer",
  "autumn",
  "winter",
];
const DEFAULT_CATEGORY = CATEGORY_KEYS[0];
const DEFAULT_SEASON = SEASON_FILTER_OPTIONS[0];
const normalizeCategoryKey = (value?: string): CategoryKey | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return (
    CATEGORY_LABEL_MAP[trimmed] ?? CATEGORY_LABEL_MAP[trimmed.toLowerCase()]
  );
};
const normalizeSeasonKey = (value?: string): SeasonKey | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return SEASON_LABEL_MAP[trimmed] ?? SEASON_LABEL_MAP[trimmed.toLowerCase()];
};
const extractSeasonKeys = (value?: string): SeasonKey[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((season) => normalizeSeasonKey(season.trim()))
    .filter((season): season is SeasonKey => Boolean(season));
};

const getStyleLabel = (style: FashionStyle) => {
  const key = STYLE_LABEL_KEYS[style];
  return key ? tStyle(key) : style;
};

export default function AIRecommendScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const CARD_WIDTH = Dimensions.get("window").width - 48;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isRequestingRef = React.useRef(false); // API 요청 중 플래그

  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<FashionStyle>("캐주얼");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 날씨 정보
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const weatherCardData = useMemo(() => {
    if (!weather) return null;
    const conditionKey = getWeatherConditionKey(weather.condition);
    return {
      conditionKey,
      iconName: getWeatherIconName(conditionKey),
    };
  }, [weather]);

  // 새 아이템 추천 (같이 있으면 좋을 아이템)
  const [suggestedItems, setSuggestedItems] = useState<
    Array<{ category: string; item: string; reason: string }>
  >([]);

  // AI 추천 저장
  const [isSaving, setIsSaving] = useState(false);
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 바텀시트 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>(DEFAULT_CATEGORY);
  const [selectedSeasonFilter, setSelectedSeasonFilter] =
    useState<SeasonKey>(DEFAULT_SEASON);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [showSeasonFilterDropdown, setShowSeasonFilterDropdown] =
    useState(false);
  const isSeasonFilterActive =
    showSeasonFilterDropdown || selectedSeasonFilter !== DEFAULT_SEASON;
  const filterIconColor = isSeasonFilterActive ? colors.white : colors.white;
  const analysisItemsSignature = useMemo(() => {
    if (!analysis?.selectedItems?.length) {
      return "";
    }
    const ids = analysis.selectedItems.map((item) => item.id);
    return [...ids].sort().join("__");
  }, [analysis]);

  useEffect(() => {
    if (!isSheetOpen && showSeasonFilterDropdown) {
      setShowSeasonFilterDropdown(false);
    }
  }, [isSheetOpen, showSeasonFilterDropdown]);

  // 옷장 데이터 및 날씨 불러오기
  useEffect(() => {
    loadClothes();
    loadWeather();
  }, []);

  useEffect(() => {
    if (
      !user?.uid ||
      !analysis?.selectedItems?.length ||
      !analysisItemsSignature
    ) {
      setSavedOutfitId(null);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const existing = await findSavedOutfitByItems(
          user.uid,
          analysis.selectedItems.map((item) => item.id)
        );
        if (isMounted) {
          setSavedOutfitId(existing?.id ?? null);
          setSaveError(null);
        }
      } catch (error: any) {
        console.error("saved outfit lookup failed", error);
        if (isMounted) {
          setSaveError(error?.message ?? "Unknown error");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, analysisItemsSignature, analysis]);

  const loadClothes = async () => {
    if (!user?.uid) return;
    try {
      const items = await getClothingItems(user.uid);
      setClothes(items);
    } catch (error) {
      console.error("옷 목록 불러오기 오류:", error);
    }
  };

  const loadWeather = async () => {
    try {
      // 위치 기반 날씨로 변경
      const weatherData = await getWeatherByCurrentLocation();
      setWeather(weatherData);
    } catch (error) {
      console.error("날씨 불러오기 오류:", error);
      // 날씨 불러오기 실패해도 앱 사용은 계속 가능
    }
  };

  // 선택 규칙 검사
  const canSelectItem = (item: ClothingItem): boolean => {
    const categoryKey = normalizeCategoryKey(item.category);
    const currentCategoryItems = selectedItems.filter(
      (i) => normalizeCategoryKey(i.category) === categoryKey
    );

    if (!categoryKey || categoryKey === "accessories") {
      return true;
    }

    if (["tops", "bottoms", "outer", "shoes"].includes(categoryKey)) {
      return currentCategoryItems.length === 0;
    }

    return true;
  };

  // 옷 선택/해제
  const toggleItemSelection = (item: ClothingItem) => {
    const isAlreadySelected = selectedItems.find((i) => i.id === item.id);

    if (isAlreadySelected) {
      // 선택 해제
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      // 선택 가능 여부 확인
      if (canSelectItem(item)) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  // 선택 해제 (X 버튼)
  const removeSelectedItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
  };

  // AI 스마트 추천 받기
  const handleGetRecommendation = async () => {
    setAnalysis(null);
    setSavedOutfitId(null);
    setSaveError(null);
    // 이중 체크: ref와 state 모두 확인
    if (isRequestingRef.current || isLoading) {
      console.warn("⚠️ 중복 호출 차단! 이미 AI 추천을 불러오는 중입니다.");
      return;
    }

    if (clothes.length < 2) {
      Toast.show({
        type: "info",
        text1: t("needMoreWardrobeItems"),
      });
      return;
    }

    try {
      // 즉시 플래그 설정 (중복 호출 완전 차단)
      isRequestingRef.current = true;

      // 새로운 추천을 받는 동안 기존 결과 먼저 숨기기
      setAnalysis(null);
      setSuggestedItems([]);
      setIsLoading(true);

      console.log("=== AI 추천 시작 ===");
      console.log("시간:", new Date().toISOString());
      console.log("선택된 아이템:", selectedItems.length);
      console.log("전체 옷:", clothes.length);

      // 스마트 추천 (유저 선택 아이템 포함 or 전체 자동)
      console.log("1️⃣ 코디 조합 추천 API 호출 중...");
      const outfitAnalysis = await recommendSmartOutfit(
        selectedItems,
        clothes,
        selectedStyle,
        weather?.temperature // 날씨 API에서 가져온 온도 전달
      );
      console.log("✅ 코디 조합 추천 완료");

      // 같이 있으면 좋을 아이템 추천
      console.log("2️⃣ 새 아이템 추천 API 호출 중...");
      const newItems = await recommendNewItems(
        clothes,
        selectedStyle,
        weather?.temperature
      );
      console.log("✅ 새 아이템 추천 완료");

      setAnalysis(outfitAnalysis);
      setSuggestedItems(newItems);
      setCurrentImageIndex(0);
      console.log("=== AI 추천 완료 ===");
      console.log("종료 시간:", new Date().toISOString());
    } catch (error: any) {
      console.error("=== AI 분석 오류 ===", error);
      if (error instanceof Error && error.message.includes("아이템 부족")) {
        Toast.show({
          type: "info",
          text1: t("needMoreWardrobeItems"),
        });
        return;
      }
      alert(error instanceof Error ? error.message : "AI 분석에 실패했습니다.");
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false; // 플래그 해제
      console.log("로딩 상태 해제");
    }
  };

  const handleSaveOutfit = async () => {
    if (!user?.uid || !analysis) return;
    if (savedOutfitId) {
      Toast.show({ type: "info", text1: t("saveOutfitDuplicate") });
      return;
    }
    try {
      setIsSaving(true);
      setSaveError(null);
      const saved = await saveAiOutfit(user.uid, analysis, {
        weather,
        preferredStyle: selectedStyle,
      });
      setSavedOutfitId(saved.id);
      Toast.show({ type: "success", text1: t("saveOutfitSuccess") });
    } catch (error: any) {
      console.error("save outfit failed", error);
      setSaveError(error?.message ?? "Unknown error");
      Toast.show({ type: "error", text1: t("saveOutfitError") });
    } finally {
      setIsSaving(false);
    }
  };

  // 화면 초기화 (추천 결과 지우기)
  const handleReset = () => {
    setAnalysis(null);
    setSuggestedItems([]);
    setSelectedItems([]);
    setCurrentImageIndex(0);
    setSavedOutfitId(null);
    setSaveError(null);
  };

  // 이전 이미지로 이동
  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      scrollViewRef.current?.scrollTo({
        x: newIndex * CARD_WIDTH,
        animated: true,
      });
    }
  };

  // 다음 이미지로 이동
  const handleNextImage = () => {
    if (analysis && currentImageIndex < analysis.selectedItems.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      scrollViewRef.current?.scrollTo({
        x: newIndex * CARD_WIDTH,
        animated: true,
      });
    }
  };

  // 특정 이미지로 이동
  const handleGoToImage = (index: number) => {
    setCurrentImageIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * CARD_WIDTH,
      animated: true,
    });
  };

  // 전체 새로고침 (Pull-to-Refresh) - 옷장과 날씨만 갱신
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await loadClothes();
    await loadWeather();
    setRefreshing(false);
  };

  // 필터링된 옷 목록
  const filteredClothes = clothes.filter((item) => {
    const itemCategoryKey = normalizeCategoryKey(item.category);
    const matchCategory =
      selectedCategory === "all" || itemCategoryKey === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSeason =
      selectedSeasonFilter === "all" ||
      extractSeasonKeys((item as any).seasons).includes(selectedSeasonFilter);
    return matchCategory && matchSearch && matchSeason;
  });

  // 카테고리별 선택 개수
  const getCategoryCount = (category: CategoryKey) => {
    return selectedItems.filter(
      (i) => normalizeCategoryKey(i.category) === category
    ).length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefreshAll}
          />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("AITitle")}</Text>
          <Text style={styles.subtitle}>{t("AISubtitle")}</Text>

          {/* 날씨 정보 */}
          {weather && weatherCardData && (
            <View style={styles.weatherCard}>
              <View style={styles.weatherLeft}>
                <Ionicons
                  name={weatherCardData.iconName}
                  size={32}
                  color="#000"
                />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>
                    {weather.temperature}°C
                  </Text>
                  <Text style={styles.weatherCondition}>
                    {t(weatherCardData.conditionKey)}
                  </Text>
                </View>
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.weatherDetail}>
                  {t("weatherFeelsLike")} {weather.feelsLike}°C
                </Text>
                <Text style={styles.weatherDetail}>
                  {t("weatherHumidity")} {weather.humidity}%
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 옷 선택 영역 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("chostItemTitle")}</Text>
          <Text style={styles.selectionGuide}>{t("selectInstruc")}</Text>

          {/* 선택된 아이템 표시 */}
          {selectedItems.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedItemsScroll}
            >
              {selectedItems.map((item) => (
                <View key={item.id} style={styles.selectedItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.selectedItemImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSelectedItem(item.id)}
                  >
                    <X size={16} color={colors.white} />
                  </TouchableOpacity>
                  <Text style={styles.selectedItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* 옷 선택 버튼 */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setIsSheetOpen(true)}
          >
            <Text style={styles.selectButtonText}>
              {t("wardrobeChooseButton")} ({selectedItems.length}
              {t("numberSelected")})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 원하는 스타일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("wantStyle")}</Text>
          <View style={styles.styleContainer}>
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  selectedStyle === style && styles.styleButtonActive,
                ]}
                onPress={() => setSelectedStyle(style)}
              >
                <Text
                  style={[
                    styles.styleText,
                    selectedStyle === style && styles.styleTextActive,
                  ]}
                >
                  {getStyleLabel(style)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI 추천 받기 버튼 */}
        <TouchableOpacity
          style={[
            styles.recommendButton,
            (clothes.length < 2 || isLoading || isRequestingRef.current) &&
              styles.recommendButtonDisabled,
          ]}
          onPress={() => {
            console.log("🔘 AI 추천 버튼 클릭됨");
            console.log("현재 로딩 상태:", isLoading);
            console.log("현재 요청 플래그:", isRequestingRef.current);
            handleGetRecommendation();
          }}
          disabled={clothes.length < 2 || isLoading || isRequestingRef.current}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.recommendButtonText}>{t("getAIRec")}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 추천 결과 */}
        {analysis && (
          <View style={styles.resultSection}>
            {/* 헤더 */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>추천 코디</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={() => {
                    console.log("🔄 새 추천 버튼 클릭됨");
                    handleGetRecommendation();
                  }}
                  style={[
                    styles.newRecommendButton,
                    (isLoading || isRequestingRef.current) &&
                      styles.newRecommendButtonDisabled,
                  ]}
                  disabled={isLoading || isRequestingRef.current}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#999" />
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color="#000"
                      />
                      <Text style={styles.newRecommendText}>새 추천</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.resetButton}
                >
                  <Ionicons name="close-outline" size={18} color="#666" />
                  <Text style={styles.resetText}>초기화</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 매칭도 배지 */}
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>
                매칭도 {Math.round((analysis.compatibility / 10) * 100)}%
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                savedOutfitId && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveOutfit}
              disabled={isSaving || !!savedOutfitId}
            >
              <Heart
                size={18}
                color={savedOutfitId ? colors.brand : colors.white}
                fill={savedOutfitId ? colors.brand : "transparent"}
              />
              <Text style={styles.saveButtonText}>
                {savedOutfitId
                  ? t("saved")
                  : isSaving
                  ? t("saving")
                  : t("saveOutfit")}
              </Text>
            </TouchableOpacity>
            {saveError && <Text style={styles.saveErrorText}>{saveError}</Text>}

            {/* 아이템 갤러리 (스와이프) */}
            <View style={styles.galleryContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={true}
                snapToInterval={CARD_WIDTH}
                snapToAlignment="start"
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / CARD_WIDTH
                  );
                  setCurrentImageIndex(index);
                }}
                style={[styles.imageScrollView, { width: CARD_WIDTH }]}
                contentContainerStyle={styles.imageScrollContent}
              >
                {analysis.selectedItems.map((clothItem) => (
                  <View
                    key={clothItem.id}
                    style={[styles.itemCard, { width: CARD_WIDTH }]}
                  >
                    <Image
                      source={{ uri: clothItem.imageUrl }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{clothItem.name}</Text>
                      <Text style={styles.itemCategory}>
                        {clothItem.category}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 페이지 인디케이터 (클릭 가능) */}
            <View style={styles.paginationContainer}>
              {analysis.selectedItems.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleGoToImage(index)}
                  style={[
                    styles.paginationDot,
                    currentImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            {/* AI 분석 상세 */}
            <View style={styles.analysisCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>조합 적합도</Text>
                  <Text style={styles.scoreValue}>
                    {analysis.compatibility}/10
                  </Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>색상 조화</Text>
                  <Text style={styles.scoreValue}>
                    {analysis.colorHarmony.score}/10
                  </Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>스타일 일관성</Text>
                  <Text style={styles.scoreValue}>
                    {analysis.styleConsistency}/10
                  </Text>
                </View>
              </View>

              <View style={styles.adviceSection}>
                <Text style={styles.adviceTitle}>{t("AIAdvise")}</Text>
                <Text style={styles.adviceText}>{analysis.advice}</Text>
              </View>

              {/* 개선 제안 */}
              {analysis.suggestions.length > 0 && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.adviceTitle}>{t("suggestOption")}</Text>
                  {analysis.suggestions.map((suggestion, idx) => (
                    <View key={idx} style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 보색 제안 */}
              {analysis.colorHarmony.complementaryColors.length > 0 && (
                <View style={styles.colorSection}>
                  <Text style={styles.adviceTitle}>{t("colorRec")}</Text>
                  <View style={styles.colorList}>
                    {analysis.colorHarmony.complementaryColors.map(
                      (color, idx) => (
                        <View key={idx} style={styles.colorChip}>
                          <Text style={styles.colorChipText}>{color}</Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* 같이 있으면 좋을 아이템 */}
            {suggestedItems.length > 0 && (
              <View style={styles.suggestedItemsSection}>
                <Text style={styles.sectionTitle}>{t("recNewItem")}</Text>
                <Text style={styles.suggestedItemsSubtitle}>
                  {t("recNewItemTitle")}
                </Text>
                {suggestedItems.map((item, index) => (
                  <View key={index} style={styles.suggestedItemCard}>
                    <View style={styles.suggestedItemHeader}>
                      <Text style={styles.suggestedItemName}>{item.item}</Text>
                      <View style={styles.suggestedItemCategoryBadge}>
                        <Text style={styles.suggestedItemCategoryText}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.suggestedItemReason}>
                      {item.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 옷 선택 바텀시트 */}
      <SoftSheet open={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t("selectItems")}</Text>
            <TouchableOpacity onPress={() => setIsSheetOpen(false)}>
              <X size={24} color={colors.textOnLight} />
            </TouchableOpacity>
          </View>

          {/* 검색창 */}
          <View
            style={[
              styles.searchContainer,
              isSearchFocused && styles.searchContainerFocused,
            ]}
          >
            <Search size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("searchItems")}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          {/* 카테고리 필터 */}
          <ScrollView
            key={language}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORY_KEYS.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {tCategory(category)}
                  {category !== "all" &&
                    ` (${getCategoryCount(category)}${
                      category === "accessories" ? "" : "/1"
                    })`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 계절 필터 */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                isSeasonFilterActive && styles.filterButtonActive,
              ]}
              onPress={() =>
                setShowSeasonFilterDropdown(!showSeasonFilterDropdown)
              }
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
                name={showSeasonFilterDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color={filterIconColor}
              />
            </TouchableOpacity>
            {showSeasonFilterDropdown && (
              <View style={styles.seasonFilterDropdown}>
                {SEASON_FILTER_OPTIONS.map((season) => {
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

          {/* 옷 그리드 */}
          <ScrollView
            style={styles.sheetScrollView}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.sheetGrid}>
              {filteredClothes.map((item) => {
                const isSelected = selectedItems.find((i) => i.id === item.id);
                const canSelect = canSelectItem(item);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.sheetClothItem,
                      isSelected && styles.sheetClothItemSelected,
                      !canSelect &&
                        !isSelected &&
                        styles.sheetClothItemDisabled,
                    ]}
                    onPress={() => toggleItemSelection(item)}
                    disabled={!canSelect && !isSelected}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.sheetClothImage}
                    />
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                    <Text style={styles.sheetClothName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredClothes.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("emeptyItems")}</Text>
              </View>
            )}
          </ScrollView>

          {/* 확인 버튼 */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setIsSheetOpen(false)}
          >
            <Text style={styles.confirmButtonText}>
              {t("confirmDelete")} ({selectedItems.length}
              {t("numberSelected")})
            </Text>
          </TouchableOpacity>
        </View>
      </SoftSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: undefined,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  weatherCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weatherInfo: {
    gap: 2,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  weatherCondition: {
    fontSize: 14,
    color: "#666",
  },
  weatherRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  weatherDetail: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  styleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  styleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    gap: 6,
  },
  styleButtonActive: {
    backgroundColor: "#000",
  },
  styleText: {
    fontSize: 14,
    color: "#666",
  },
  styleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  recommendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  recommendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  recommendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultSection: {
    paddingHorizontal: 24,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  galleryContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  imageScrollView: {
    flexGrow: 0,
    // width is set dynamically via inline style
  },
  imageScrollContent: {
    paddingHorizontal: 0,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newRecommendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  newRecommendText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "600",
  },
  newRecommendButtonDisabled: {
    backgroundColor: "#e0e0e0",
    opacity: 0.6,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 13,
    color: "#666",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 14,
    color: "#666",
  },
  matchBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  matchBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.brand,
    borderRadius: 999,
  },
  saveButtonDisabled: {
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  saveErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.error ?? "#ff4d4f",
  },
  itemCard: {
    // width는 인라인 스타일로 동적 설정
    marginRight: 0,
    marginLeft: 0,
    borderRadius: 16,
    overflow: "hidden",
    height: 600,
    backgroundColor: "#f5f5f5",
  },
  itemImage: {
    width: "100%",
    height: 500,
    backgroundColor: "#f5f5f5",
  },
  itemInfo: {
    padding: 16,
    backgroundColor: "#fff",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: "#000",
  },
  analysisCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  adviceSection: {
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  adviceText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  suggestionBullet: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  colorSection: {
    marginTop: 8,
  },
  colorList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorChip: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorChipText: {
    fontSize: 12,
    color: "#666",
  },
  suggestedItemsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  suggestedItemsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  suggestedItemCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestedItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestedItemName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  suggestedItemCategoryBadge: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  suggestedItemCategoryText: {
    fontSize: 13,
    color: "#666",
  },
  suggestedItemReason: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  // 새로운 옷 선택 UI 스타일
  selectionGuide: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  selectedItemsScroll: {
    marginBottom: 16,
  },
  selectedItem: {
    width: 100,
    marginRight: 12,
    position: "relative",
  },
  selectedItemImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.softCard,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.brand,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItemName: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textOnLight,
    textAlign: "center",
  },
  selectButton: {
    backgroundColor: colors.softCard,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.brand,
  },
  // 바텀시트 스타일
  sheetContainer: {
    maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textOnLight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  searchContainerFocused: {
    borderColor: "#000",
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textOnLight,
  },
  categoryScroll: {
    marginTop: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.softCard,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    position: "relative",
    zIndex: 100,
    right: 22,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brand,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    fontSize: 14,
    color: colors.white,
  },
  filterTextActive: {
    color: colors.white,
  },
  seasonFilterDropdown: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderBottomColor: colors.border,
    backgroundColor: colors.softCard,
  },
  seasonFilterItemHovered: {
    backgroundColor: colors.brandLight,
  },
  seasonFilterItemPressed: {
    backgroundColor: colors.softCard,
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
  sheetScrollView: {
    maxHeight: 400,
    marginTop: 16,
  },
  sheetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sheetClothItem: {
    width: "30%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sheetClothItemSelected: {
    borderColor: colors.brand,
  },
  sheetClothItemDisabled: {
    opacity: 0.4,
  },
  sheetClothImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: colors.softCard,
  },
  selectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.brand,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  sheetClothName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    color: colors.textOnLight,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
