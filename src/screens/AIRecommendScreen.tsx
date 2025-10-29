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
  analyzeOutfitCombination,
  recommendOutfitAutomatically,
  recommendNewItems,
} from "../services/fashionAIService";
import { ClothingItem } from "../types/wardrobe";
import { OutfitAnalysis, FashionStyle } from "../types/ai";

const STYLES: FashionStyle[] = ["캐주얼", "미니멀", "스트릿", "포멀", "스포티"];
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

interface RecommendationType {
  title: string;
  type: "user-selected" | "ai-auto";
  analysis: OutfitAnalysis | null;
}

export default function AIRecommendScreen() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<FashionStyle>("캐주얼");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 2개의 추천: 1) 유저 선택 기반, 2) AI 자동 선택
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([
    { title: "내가 선택한 코디", type: "user-selected", analysis: null },
    { title: "AI 추천 코디", type: "ai-auto", analysis: null },
  ]);

  const [currentRecommendationIndex, setCurrentRecommendationIndex] =
    useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 새 아이템 추천
  const [newItemRecommendations, setNewItemRecommendations] = useState<
    Array<{ category: string; item: string; reason: string }>
  >([]);

  // 옷장 데이터 불러오기
  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    try {
      const items = await getClothingItems();
      setClothes(items);
    } catch (error) {
      console.error("옷 목록 불러오기 오류:", error);
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

  // AI 추천 받기 (2개 동시)
  const handleGetRecommendations = async () => {
    if (selectedItems.length < 2) {
      alert("최소 2개 이상의 옷을 선택해주세요!");
      return;
    }

    try {
      setIsLoading(true);

      // 1. 유저 선택 아이템 분석
      const userSelectedAnalysis = await analyzeOutfitCombination(
        selectedItems,
        selectedStyle
      );

      // 2. AI 자동 추천
      const aiAutoAnalysis = await recommendOutfitAutomatically(
        clothes,
        selectedStyle
      );

      // 3. 새 아이템 추천
      const newItems = await recommendNewItems(clothes, selectedStyle);

      setRecommendations([
        {
          title: "내가 선택한 코디",
          type: "user-selected",
          analysis: userSelectedAnalysis,
        },
        {
          title: "AI 추천 코디",
          type: "ai-auto",
          analysis: aiAutoAnalysis,
        },
      ]);

      setNewItemRecommendations(newItems);
      setCurrentRecommendationIndex(0);
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
    if (selectedItems.length >= 2) {
      await handleGetRecommendations();
    }
    setRefreshing(false);
  };

  // 현재 추천 가져오기
  const currentRecommendation = recommendations[currentRecommendationIndex];
  const hasAnalysis = currentRecommendation?.analysis !== null;

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
          스타일과 날씨에 맞는 완벽한 조합을 찾아보세요
        </Text>
      </View>

      {/* 옷 선택 영역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          옷 선택하기 ({selectedItems.length}/4)
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
          (selectedItems.length < 2 || isLoading) &&
            styles.recommendButtonDisabled,
        ]}
        onPress={handleGetRecommendations}
        disabled={selectedItems.length < 2 || isLoading}
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
      {hasAnalysis && (
        <View style={styles.section}>
          {/* 추천 타입 전환 (가로 스와이프) */}
          <FlatList
            data={recommendations}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentRecommendationIndex(index);
              setCurrentImageIndex(0);
            }}
            renderItem={({ item }) => (
              <View style={styles.recommendationContainer}>
                {/* 추천 타입 헤더 */}
                <View style={styles.resultHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={handleGetRecommendations}
                    style={styles.refreshButton}
                  >
                    <Ionicons name="refresh-outline" size={18} color="#666" />
                    <Text style={styles.refreshText}>새로고침</Text>
                  </TouchableOpacity>
                </View>

                {item.analysis && (
                  <>
                    {/* 매칭도 배지 */}
                    <View style={styles.matchBadgeContainer}>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>
                          매칭도{" "}
                          {Math.round((item.analysis.compatibility / 10) * 100)}
                          %
                        </Text>
                      </View>
                    </View>

                    {/* 선택된 옷 스와이퍼 */}
                    <FlatList
                      data={item.analysis.selectedItems}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={SCREEN_WIDTH - 48}
                      decelerationRate="fast"
                      onScroll={(event) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.x /
                            (SCREEN_WIDTH - 48)
                        );
                        setCurrentImageIndex(index);
                      }}
                      renderItem={({ item: clothItem }) => (
                        <View style={styles.outfitImageContainer}>
                          <Image
                            source={{ uri: clothItem.imageUrl }}
                            style={styles.outfitImage}
                          />
                          <View style={styles.itemNameBadge}>
                            <Text style={styles.itemNameText}>
                              {clothItem.name}
                            </Text>
                            <Text style={styles.itemCategoryText}>
                              {clothItem.category}
                            </Text>
                          </View>
                        </View>
                      )}
                      keyExtractor={(clothItem, idx) =>
                        clothItem.id || idx.toString()
                      }
                    />

                    {/* 페이지 인디케이터 */}
                    <View style={styles.paginationContainer}>
                      {item.analysis.selectedItems.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.paginationDot,
                            currentImageIndex === index &&
                              styles.paginationDotActive,
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
                            {item.analysis.compatibility}/10
                          </Text>
                        </View>
                        <View style={styles.scoreItem}>
                          <Text style={styles.scoreLabel}>색상 조화</Text>
                          <Text style={styles.scoreValue}>
                            {item.analysis.colorHarmony.score}/10
                          </Text>
                        </View>
                        <View style={styles.scoreItem}>
                          <Text style={styles.scoreLabel}>스타일 일관성</Text>
                          <Text style={styles.scoreValue}>
                            {item.analysis.styleConsistency}/10
                          </Text>
                        </View>
                      </View>

                      <View style={styles.adviceSection}>
                        <Text style={styles.adviceTitle}>AI 조언</Text>
                        <Text style={styles.adviceText}>
                          {item.analysis.advice}
                        </Text>
                      </View>

                      {/* 개선 제안 */}
                      {item.analysis.suggestions.length > 0 && (
                        <View style={styles.suggestionsSection}>
                          <Text style={styles.adviceTitle}>개선 제안</Text>
                          {item.analysis.suggestions.map((suggestion, idx) => (
                            <View key={idx} style={styles.suggestionItem}>
                              <Text style={styles.suggestionBullet}>•</Text>
                              <Text style={styles.suggestionText}>
                                {suggestion}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 보색 제안 */}
                      {item.analysis.colorHarmony.complementaryColors.length >
                        0 && (
                        <View style={styles.colorSection}>
                          <Text style={styles.adviceTitle}>추천 보색</Text>
                          <View style={styles.colorList}>
                            {item.analysis.colorHarmony.complementaryColors.map(
                              (color, idx) => (
                                <View key={idx} style={styles.colorChip}>
                                  <Text style={styles.colorChipText}>
                                    {color}
                                  </Text>
                                </View>
                              )
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          {/* 추천 페이지 인디케이터 */}
          <View style={styles.recommendationPaginationContainer}>
            {recommendations.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.recommendationPaginationDot,
                  currentRecommendationIndex === index &&
                    styles.recommendationPaginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* 새 아이템 추천 (하단) */}
          {newItemRecommendations.length > 0 && (
            <View style={styles.newItemsSection}>
              <Text style={styles.sectionTitle}>AI 추천 아이템</Text>
              <Text style={styles.newItemsSubtitle}>
                옷장에 추가하면 좋을 아이템
              </Text>
              {newItemRecommendations.map((newItem, index) => (
                <View key={index} style={styles.newItemCard}>
                  <View style={styles.newItemHeader}>
                    <Text style={styles.newItemName}>{newItem.item}</Text>
                    <View style={styles.newItemCategoryBadge}>
                      <Text style={styles.newItemCategoryText}>
                        {newItem.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.newItemReason}>{newItem.reason}</Text>
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
  recommendationContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  matchBadgeContainer: {
    marginBottom: 16,
  },
  matchBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  matchBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  outfitImageContainer: {
    width: SCREEN_WIDTH - 48,
    marginRight: 0,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  outfitImage: {
    width: "100%",
    height: 500,
    backgroundColor: "#f5f5f5",
  },
  itemNameBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 12,
  },
  itemNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemCategoryText: {
    fontSize: 13,
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
  recommendationPaginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    gap: 8,
  },
  recommendationPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  recommendationPaginationDotActive: {
    width: 24,
    backgroundColor: "#000",
  },
  newItemsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  newItemsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  newItemCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  newItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  newItemCategoryBadge: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  newItemCategoryText: {
    fontSize: 12,
    color: "#666",
  },
  newItemReason: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
