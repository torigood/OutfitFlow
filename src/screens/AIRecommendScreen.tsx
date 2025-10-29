import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getClothingItems } from "../services/wardrobeService";
import {
  recommendSmartOutfit,
  recommendNewItems,
} from "../services/fashionAIService";
import { getDefaultWeather } from "../services/weatherService";
import { ClothingItem } from "../types/wardrobe";
import { OutfitAnalysis, FashionStyle, WeatherInfo } from "../types/ai";

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
const STYLE_ICONS: Record<FashionStyle, any> = {
  캐주얼: "shirt-outline",
  미니멀: "square-outline",
  스트릿: "walk-outline",
  포멀: "briefcase-outline",
  스포티: "basketball-outline",
  빈티지: "time-outline",
  페미닌: "rose-outline",
  댄디: "ribbon-outline",
  기타: "ellipsis-horizontal",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AIRecommendScreen() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<FashionStyle>("캐주얼");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 날씨 정보
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // 새 아이템 추천 (같이 있으면 좋을 아이템)
  const [suggestedItems, setSuggestedItems] = useState<
    Array<{ category: string; item: string; reason: string }>
  >([]);

  // 옷장 데이터 및 날씨 불러오기
  useEffect(() => {
    loadClothes();
    loadWeather();
  }, []);

  const loadClothes = async () => {
    try {
      const items = await getClothingItems();
      setClothes(items);
    } catch (error) {
      console.error("옷 목록 불러오기 오류:", error);
    }
  };

  const loadWeather = async () => {
    try {
      const weatherData = await getDefaultWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error("날씨 불러오기 오류:", error);
      // 날씨 불러오기 실패해도 앱 사용은 계속 가능
    }
  };

  // 옷 선택/해제
  const toggleItemSelection = (item: ClothingItem) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      if (selectedItems.length < 4) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  // AI 스마트 추천 받기
  const handleGetRecommendation = async () => {
    if (clothes.length < 2) {
      alert("옷장에 최소 2개 이상의 옷이 필요합니다!");
      return;
    }

    try {
      setIsLoading(true);

      // 스마트 추천 (유저 선택 아이템 포함 or 전체 자동)
      const outfitAnalysis = await recommendSmartOutfit(
        selectedItems,
        clothes,
        selectedStyle,
        weather?.temperature // 날씨 API에서 가져온 온도 전달
      );

      // 같이 있으면 좋을 아이템 추천
      const newItems = await recommendNewItems(
        clothes,
        selectedStyle,
        weather?.temperature
      );

      setAnalysis(outfitAnalysis);
      setSuggestedItems(newItems);
      setCurrentImageIndex(0);
    } catch (error: any) {
      console.error("AI 분석 오류:", error);
      alert(error instanceof Error ? error.message : "AI 분석에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 전체 새로고침 (Pull-to-Refresh)
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await loadClothes();
    await loadWeather();
    if (clothes.length >= 2) {
      await handleGetRecommendation();
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefreshAll} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>AI 코디 추천</Text>
        <Text style={styles.subtitle}>
          날씨와 스타일에 맞는 완벽한 조합을 찾아보세요
        </Text>

        {/* 날씨 정보 */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Ionicons
                name={
                  weather.condition === "맑음"
                    ? "sunny"
                    : weather.condition === "흐림"
                    ? "cloudy"
                    : weather.condition.includes("비")
                    ? "rainy"
                    : weather.condition.includes("눈")
                    ? "snow"
                    : "cloud"
                }
                size={32}
                color="#000"
              />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </View>
            </View>
            <View style={styles.weatherRight}>
              <Text style={styles.weatherDetail}>
                체감 {weather.feelsLike}°C
              </Text>
              <Text style={styles.weatherDetail}>습도 {weather.humidity}%</Text>
            </View>
          </View>
        )}
      </View>

      {/* 옷 선택 영역 (선택 사항) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          옷 선택하기 ({selectedItems.length}/{clothes.length}) - 선택 안 해도
          추천 가능
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.clothesScroll}
        >
          {clothes.map((item) => {
            const isSelected = selectedItems.find((i) => i.id === item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.clothItem,
                  isSelected && styles.clothItemSelected,
                ]}
                onPress={() => toggleItemSelection(item)}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.clothImage}
                />
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#000" />
                  </View>
                )}
                <Text style={styles.clothName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 원하는 스타일 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>원하는 스타일</Text>
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
              <Ionicons
                name={STYLE_ICONS[style]}
                size={20}
                color={selectedStyle === style ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.styleText,
                  selectedStyle === style && styles.styleTextActive,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI 추천 받기 버튼 */}
      <TouchableOpacity
        style={[
          styles.recommendButton,
          (clothes.length < 2 || isLoading) && styles.recommendButtonDisabled,
        ]}
        onPress={handleGetRecommendation}
        disabled={clothes.length < 2 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.recommendButtonText}>AI 추천 받기</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 추천 결과 */}
      {analysis && (
        <View style={styles.resultSection}>
          {/* 헤더 */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>추천 코디</Text>
            <TouchableOpacity
              onPress={handleGetRecommendation}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh-outline" size={18} color="#666" />
              <Text style={styles.refreshText}>새로고침</Text>
            </TouchableOpacity>
          </View>

          {/* 매칭도 배지 */}
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>
              매칭도 {Math.round((analysis.compatibility / 10) * 100)}%
            </Text>
          </View>

          {/* 아이템 갤러리 (스와이프) */}
          <FlatList
            data={analysis.selectedItems}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH - 48}
            snapToAlignment="center"
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48)
              );
              setCurrentImageIndex(index);
            }}
            renderItem={({ item: clothItem }) => (
              <View style={styles.itemCard}>
                <Image
                  source={{ uri: clothItem.imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{clothItem.name}</Text>
                  <Text style={styles.itemCategory}>{clothItem.category}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />

          {/* 페이지 인디케이터 */}
          <View style={styles.paginationContainer}>
            {analysis.selectedItems.map((_, index) => (
              <View
                key={index}
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
              <Text style={styles.adviceTitle}>AI 조언</Text>
              <Text style={styles.adviceText}>{analysis.advice}</Text>
            </View>

            {/* 개선 제안 */}
            {analysis.suggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.adviceTitle}>개선 제안</Text>
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
                <Text style={styles.adviceTitle}>추천 보색</Text>
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
              <Text style={styles.sectionTitle}>같이 있으면 좋을 아이템</Text>
              <Text style={styles.suggestedItemsSubtitle}>
                이 코디에 추가하면 더 완성도가 높아집니다
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
                  <Text style={styles.suggestedItemReason}>{item.reason}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === "web" ? 24 : 60,
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
  clothesScroll: {
    flexDirection: "row",
  },
  clothItem: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  clothItemSelected: {
    borderColor: "#000",
  },
  clothImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  selectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  clothName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
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
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
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
  itemCard: {
    width: SCREEN_WIDTH - 48,
    marginRight: 0,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  itemImage: {
    width: "100%",
    height: 300,
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
    fontSize: 16,
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
    fontSize: 12,
    color: "#666",
  },
  suggestedItemReason: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
