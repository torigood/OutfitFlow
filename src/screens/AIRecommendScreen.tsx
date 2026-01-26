import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  FlatList, // 🚀 추가됨
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { X, Search, Heart } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getClothingItems } from "../services/wardrobeService";
import { recommendSmartOutfit } from "../services/fashionAIService";
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

  // 쿨다운 상태 (30초)
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 결과 캐싱 (메모리)
  const cacheRef = useRef<Map<string, OutfitAnalysis>>(new Map());

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
  const filterIconColor = isSeasonFilterActive
    ? colors.white
    : colors.textSecondary;
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

  // 캐시 키 생성 (선택 아이템 + 스타일 + 온도범위)
  const getCacheKey = useCallback(() => {
    const itemIds = selectedItems.map((i) => i.id).sort().join(",");
    const tempRange = weather?.temperature
      ? Math.floor(weather.temperature / 5) * 5 // 5도 단위로 그룹화
      : "none";
    return `${itemIds}|${selectedStyle}|${tempRange}`;
  }, [selectedItems, selectedStyle, weather?.temperature]);

  // 쿨다운 시작
  const startCooldown = useCallback(() => {
    setCooldownSeconds(30);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

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

    // 쿨다운 중이면 차단
    if (cooldownSeconds > 0) {
      Toast.show({
        type: "info",
        text1: `${cooldownSeconds}초 후에 다시 시도해주세요`,
      });
      return;
    }

    if (clothes.length < 2) {
      Toast.show({
        type: "info",
        text1: t("needMoreWardrobeItems"),
      });
      return;
    }

    // 캐시 확인
    const cacheKey = getCacheKey();
    const cachedResult = cacheRef.current.get(cacheKey);
    if (cachedResult) {
      console.log("✅ 캐시에서 결과 로드:", cacheKey);
      setAnalysis(cachedResult);
      setSuggestedItems(cachedResult.newItemRecommendations || []);
      setCurrentImageIndex(0);
      Toast.show({
        type: "success",
        text1: t("getAIRec"),
        text2: "캐시된 결과를 불러왔습니다",
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

      // 스마트 추천 (코디 분석 + 새 아이템 추천 통합 - 1번의 API 호출)
      console.log("🚀 통합 API 호출 중...");
      const outfitAnalysis = await recommendSmartOutfit(
        selectedItems,
        clothes,
        selectedStyle,
        weather?.temperature
      );
      console.log("✅ AI 추천 완료 (1회 API 호출)");

      // 결과 캐싱
      cacheRef.current.set(cacheKey, outfitAnalysis);
      console.log("💾 결과 캐시 저장:", cacheKey);

      setAnalysis(outfitAnalysis);
      setSuggestedItems(outfitAnalysis.newItemRecommendations || []);
      setCurrentImageIndex(0);

      // 쿨다운 시작
      startCooldown();

      console.log("=== AI 추천 완료 ===");
    } catch (error: any) {
      console.error("=== AI 분석 오류 ===", error);
      if (error instanceof Error && error.message.includes("아이템 부족")) {
        Toast.show({
          type: "info",
          text1: t("needMoreWardrobeItems"),
        });
        return;
      }
      Toast.show({
        type: "error",
        text1: error instanceof Error ? error.message : "AI 분석에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
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
                  color={colors.textPrimary}
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
            (clothes.length < 2 || isLoading || cooldownSeconds > 0) &&
              styles.recommendButtonDisabled,
          ]}
          onPress={handleGetRecommendation}
          disabled={clothes.length < 2 || isLoading || cooldownSeconds > 0}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : cooldownSeconds > 0 ? (
            <>
              <Ionicons name="time-outline" size={20} color={colors.white} />
              <Text style={styles.recommendButtonText}>
                {cooldownSeconds}초 후 다시 시도
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color={colors.white} />
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
                  onPress={handleGetRecommendation}
                  style={[
                    styles.newRecommendButton,
                    (isLoading || cooldownSeconds > 0) &&
                      styles.newRecommendButtonDisabled,
                  ]}
                  disabled={isLoading || cooldownSeconds > 0}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#999" />
                  ) : cooldownSeconds > 0 ? (
                    <Text style={styles.newRecommendText}>{cooldownSeconds}초</Text>
                  ) : (
                    <>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color={colors.textPrimary}
                      />
                      <Text style={styles.newRecommendText}>새 추천</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.resetButton}
                >
                  <Ionicons name="close-outline" size={18} color={colors.textTertiary} />
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
                color={savedOutfitId ? colors.textPrimary : colors.white}
                fill={savedOutfitId ? colors.textPrimary : "transparent"}
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

          {/* 🚀 [수정됨] 옷 그리드를 FlatList로 교체하여 스크롤 문제 해결 */}
          <FlatList
            data={filteredClothes}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={styles.sheetScrollView}
            nestedScrollEnabled={true} // 바텀시트 내부 스크롤 필수 설정
            showsVerticalScrollIndicator={true}
            columnWrapperStyle={{ gap: 8 }} // 가로 간격
            contentContainerStyle={{ gap: 8, paddingBottom: 20 }} // 세로 간격 및 하단 여백
            renderItem={({ item }) => {
              const isSelected = selectedItems.find((i) => i.id === item.id);
              const canSelect = canSelectItem(item);

              return (
                <TouchableOpacity
                  style={[
                    styles.sheetClothItem,
                    isSelected && styles.sheetClothItemSelected,
                    !canSelect && !isSelected && styles.sheetClothItemDisabled,
                  ]}
                  onPress={() => toggleItemSelection(item)}
                  disabled={!canSelect && !isSelected}
                  activeOpacity={0.7}
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
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("emptyItems")}</Text>
              </View>
            }
          />

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
    backgroundColor: colors.bgPrimary,
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
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  weatherCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  weatherInfo: {
    gap: 2,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  weatherCondition: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  weatherRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  weatherDetail: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.textPrimary,
  },
  styleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  styleButtonActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  styleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  styleTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  recommendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 14,
    gap: 10,
    marginBottom: 32,
  },
  recommendButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.5,
  },
  recommendButtonText: {
    color: colors.white,
    fontSize: 17,
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
  },
  imageScrollContent: {
    paddingHorizontal: 0,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newRecommendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.softCard,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newRecommendText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  newRecommendButtonDisabled: {
    opacity: 0.4,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  resetText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  matchBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 16,
  },
  matchBadgeText: {
    color: colors.white,
    fontSize: 13,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.black,
    borderRadius: 999,
  },
  saveButtonDisabled: {
    backgroundColor: colors.softCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  saveErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.error,
  },
  itemCard: {
    marginRight: 0,
    marginLeft: 0,
    borderRadius: 20,
    overflow: "hidden",
    height: 600,
    backgroundColor: colors.bgTertiary,
  },
  itemImage: {
    width: "100%",
    height: 500,
    backgroundColor: colors.bgSecondary,
  },
  itemInfo: {
    padding: 18,
    backgroundColor: colors.bgElevated,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.black,
  },
  analysisCard: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  adviceSection: {
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  adviceText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    color: colors.textTertiary,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
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
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  suggestedItemsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  suggestedItemsSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 16,
  },
  suggestedItemCard: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestedItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  suggestedItemName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  suggestedItemCategoryBadge: {
    backgroundColor: colors.bgElevated,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  suggestedItemCategoryText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  suggestedItemReason: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // 옷 선택 UI 스타일
  selectionGuide: {
    fontSize: 14,
    color: colors.textTertiary,
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
    borderRadius: 14,
    backgroundColor: colors.bgTertiary,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.black,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItemName: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectButton: {
    backgroundColor: colors.softCard,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  // 바텀시트 스타일
  sheetContainer: {
    flex: 1,
    maxHeight: "85%",
    backgroundColor: colors.bgElevated,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainerFocused: {
    borderColor: colors.black,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  categoryScroll: {
    marginTop: 16,
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.softCard,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  categoryChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  // 🚀 [수정됨] 필터 컨테이너: 위치 오류 수정
  filterContainer: {
    paddingHorizontal: 4,
    marginTop: 12,
    marginBottom: 8,
    position: "relative",
    zIndex: 100,
    overflow: "visible", // 드롭다운이 컨테이너 밖으로 표시되도록
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softCard,
    gap: 6,
    minHeight: 44, // WCAG 최소 터치 타겟 크기
  },
  filterButtonActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  // 🚀 [수정됨] 드롭다운 위치 수정
  seasonFilterDropdown: {
    position: "absolute",
    top: 40,
    left: 4,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  seasonFilterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: "transparent",
    minHeight: 48, // 드롭다운 아이템 최소 높이
  },
  seasonFilterItemHovered: {
    backgroundColor: colors.softCard,
  },
  seasonFilterItemPressed: {
    backgroundColor: colors.pressed,
  },
  seasonFilterItemSelected: {
    backgroundColor: colors.black,
  },
  seasonFilterText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  seasonFilterTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  sheetScrollView: {
    flex: 1,
    marginTop: 16,
  },
  // 🚀 [수정됨] FlatList 사용으로 인한 스타일 변경
  sheetClothItem: {
    width: "31.5%", // 3열 배치
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sheetClothItemSelected: {
    borderColor: colors.black,
  },
  sheetClothItemDisabled: {
    opacity: 0.3,
  },
  sheetClothImage: {
    width: "100%",
    height: 110, // 높이 고정
    borderRadius: 12,
    backgroundColor: colors.bgTertiary,
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: colors.black,
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
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  confirmButton: {
    backgroundColor: colors.black,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});