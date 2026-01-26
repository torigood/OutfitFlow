import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Shirt, TrendingUp, ShoppingCart, X, Trash2, ChevronRight } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SoftCard, GlowTile, DonutChart } from "../components";
import { SoftSheet } from "../components/SoftSheet";
import { colors, shadows } from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { getClothingItems } from "../services/wardrobeService";
import { ClothingItem } from "../types/wardrobe";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { t, tCategory, CategoryKey } from "../localization/i18n";
import { useLanguage } from "../contexts/LanguageContext";
import { getSavedOutfits, deleteSavedOutfit } from "../services/savedOutfitService";
import { SavedOutfit } from "../types/ai";
import Toast from "react-native-toast-message";

type RootStackParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Community: undefined;
  AIRecommend: undefined;
  Shopping: undefined;
};

// 저장된 카테고리 값 → i18n 키 매핑
const CATEGORY_TO_KEY: Record<string, CategoryKey> = {
  상의: "tops",
  하의: "bottoms",
  아우터: "outer",
  신발: "shoes",
  악세사리: "accessories",
  악세서리: "accessories",
  // 영어 값도 지원 (혹시 영어로 저장된 경우)
  tops: "tops",
  bottoms: "bottoms",
  outer: "outer",
  outerwear: "outer",
  shoes: "shoes",
  accessories: "accessories",
};

// 카테고리별 색상 (i18n 키 기준)
const CATEGORY_COLORS: Record<string, string> = {
  tops: "#007AFF",
  bottoms: "#34C759",
  outer: "#FF9500",
  shoes: "#FF3B30",
  accessories: "#FF2D55",
  all: "#8E8E93",
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language } = useLanguage();

  // 카테고리별 분포 계산
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    wardrobeItems.forEach((item) => {
      const category = item.category || "기타";
      distribution[category] = (distribution[category] || 0) + 1;
    });
    return distribution;
  }, [wardrobeItems]);

  // 도넛 차트 데이터
  const donutData = useMemo(() => {
    return Object.entries(categoryDistribution).map(([label, value]) => ({
      label,
      value,
      color: CATEGORY_COLORS[label] || CATEGORY_COLORS["기타"],
    }));
  }, [categoryDistribution]);

  const pan = Gesture.Pan().onEnd((event) => {
    if (event.translationX < -60) {
      navigation.navigate("Wardrobe");
    }
  });

  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState<string | null>(null);

  // 저장된 코디 상세 보기
  const [selectedOutfit, setSelectedOutfit] = useState<SavedOutfit | null>(null);
  const [isOutfitSheetOpen, setIsOutfitSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 전체 저장된 코디 목록 팝업
  const [allOutfits, setAllOutfits] = useState<SavedOutfit[]>([]);
  const [isAllOutfitsSheetOpen, setIsAllOutfitsSheetOpen] = useState(false);
  const [allOutfitsLoading, setAllOutfitsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        if (!user?.uid) return;

        try {
          // 1. 저장된 코디 불러오기
          setSavedLoading(true);
          const savedData = await getSavedOutfits(user.uid, { take: 2 });
          
          // 2. 옷장 아이템 불러오기 (여기서 불러와야 실시간 갱신됨!)
          const wardrobeData = await getClothingItems(user.uid);

          if (isMounted) {
            setSavedOutfits(savedData);
            setWardrobeItems(wardrobeData); // 상태 업데이트
            setSavedError(null);
          }
        } catch (err: any) {
          console.error("load home data failed", err);
          if (isMounted) setSavedError(err?.message ?? "Failed");
        } finally {
          if (isMounted) setSavedLoading(false);
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [user?.uid])
  );

  // 저장된 코디 상세 보기 열기
  const handleOpenOutfitDetail = (outfit: SavedOutfit) => {
    setSelectedOutfit(outfit);
    setIsOutfitSheetOpen(true);
  };

  // 저장된 코디 삭제
  const handleDeleteOutfit = async () => {
    if (!user?.uid || !selectedOutfit) return;

    Alert.alert(
      t("deleteOutfitTitle"),
      t("deleteOutfitMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("deleteText"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteSavedOutfit(user.uid, selectedOutfit.id);
              setSavedOutfits((prev) => prev.filter((o) => o.id !== selectedOutfit.id));
              setIsOutfitSheetOpen(false);
              setSelectedOutfit(null);
              Toast.show({ type: "success", text1: t("deleteOutfitSuccess") });
            } catch (error: any) {
              console.error("delete outfit failed", error);
              Toast.show({ type: "error", text1: t("deleteOutfitError") });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // 전체 저장된 코디 목록 열기
  const handleOpenAllOutfits = async () => {
    if (!user?.uid) return;
    setIsAllOutfitsSheetOpen(true);
    setAllOutfitsLoading(true);
    try {
      const data = await getSavedOutfits(user.uid);
      setAllOutfits(data);
    } catch (err) {
      console.error("load all outfits", err);
    } finally {
      setAllOutfitsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <GestureDetector gesture={pan}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          key={language}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("quickActions")}</Text>
            <View style={styles.quickActions}>
              <View style={styles.actionCard}>
                <GlowTile
                  icon={<Sparkles size={28} color={colors.textPrimary} />}
                  size={72}
                  onPress={() => navigation.navigate("AIRecommend")}
                />
                <Text style={styles.actionLabel}>{t("aiRecommend")}</Text>
              </View>
              <View style={styles.actionCard}>
                <GlowTile
                  icon={<Shirt size={28} color={colors.textPrimary} />}
                  size={72}
                  onPress={() => navigation.navigate("Wardrobe")}
                />
                <Text style={styles.actionLabel}>{t("wardrobe")}</Text>
              </View>
              <View style={styles.actionCard}>
                <GlowTile
                  icon={<TrendingUp size={28} color={colors.textPrimary} />}
                  size={72}
                  onPress={() => navigation.navigate("Community")}
                />
                <Text style={styles.actionLabel}>{t("trends")}</Text>
              </View>
              <View style={styles.actionCard}>
                <GlowTile
                  icon={<ShoppingCart size={28} color={colors.textPrimary} />}
                  size={72}
                  onPress={() => navigation.navigate("Shopping")}
                />
                <Text style={styles.actionLabel}>{t("shopping")}</Text>
              </View>
            </View>
          </View>

          {/* Saved Outfits */}
          <View style={styles.section}>
            <TouchableOpacity onPress={handleOpenAllOutfits} activeOpacity={0.7}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitleInRow}>{t("savedOutfits")}</Text>
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
            {savedLoading && (
              <SoftCard>
                <View style={styles.emptyState}>
                  <ActivityIndicator color={colors.textPrimary} />
                </View>
              </SoftCard>
            )}
            {!savedLoading && savedOutfits.length === 0 && (
              <SoftCard>
                <View style={styles.emptyState}>
                  <Sparkles size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>{t("noSavedOutfits")}</Text>
                </View>
              </SoftCard>
            )}
            {savedError && !savedLoading && (
              <Text style={styles.errorText}>{savedError}</Text>
            )}
            {!savedLoading &&
              savedOutfits.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.savedCard}
                  onPress={() => handleOpenOutfitDetail(outfit)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: outfit.coverImage }}
                    style={styles.savedThumb}
                  />
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedTitle}>
                      {t("compatibilityScore", { score: outfit.compatibility })}
                    </Text>
                    <Text style={styles.savedSubtitle}>
                      {new Intl.DateTimeFormat(language, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(outfit.savedAt)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("stats")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
            >
              {/* 도넛 차트 카드 */}
              <TouchableOpacity
                style={styles.statCardWide}
                onPress={() => navigation.navigate("Wardrobe")}
                activeOpacity={0.7}
              >
                <DonutChart
                  data={donutData}
                  size={80}
                  strokeWidth={10}
                  centerValue={wardrobeItems.length}
                  centerLabel={t("ownedItems")}
                />
                <View style={styles.legendContainer}>
                  {donutData.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                      <Text style={styles.legendValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              {/* 저장된 코디 카드 */}
              <View style={styles.statCardSlim}>
                <Text style={styles.statNumber}>{savedOutfits.length}</Text>
                <Text style={styles.statLabel}>{t("outfits")}</Text>
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </GestureDetector>

      {/* 저장된 코디 상세 바텀시트 */}
      <SoftSheet
        open={isOutfitSheetOpen}
        onClose={() => {
          setIsOutfitSheetOpen(false);
          setSelectedOutfit(null);
        }}
      >
        {selectedOutfit && (
          <View style={styles.outfitSheetContainer}>
            {/* 헤더 */}
            <View style={styles.outfitSheetHeader}>
              <Text style={styles.outfitSheetTitle}>{t("savedOutfitDetail")}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsOutfitSheetOpen(false);
                  setSelectedOutfit(null);
                }}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 매칭도 */}
            <View style={styles.outfitScoreBadge}>
              <Text style={styles.outfitScoreText}>
                {t("compatibilityScore", { score: selectedOutfit.compatibility })}
              </Text>
            </View>

            {/* 아이템 목록 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.outfitItemsScroll}
            >
              {selectedOutfit.items.map((item) => (
                <View key={item.id} style={styles.outfitItemCard}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.outfitItemImage}
                  />
                  <Text style={styles.outfitItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.outfitItemCategory}>{item.category}</Text>
                </View>
              ))}
            </ScrollView>

            {/* AI 조언 */}
            {selectedOutfit.advice && (
              <View style={styles.outfitAdviceCard}>
                <Text style={styles.outfitAdviceTitle}>{t("AIAdvise")}</Text>
                <Text style={styles.outfitAdviceText}>{selectedOutfit.advice}</Text>
              </View>
            )}

            {/* 저장 날짜 */}
            <Text style={styles.outfitSavedDate}>
              {t("savedOn")}{" "}
              {new Intl.DateTimeFormat(language, {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(selectedOutfit.savedAt)}
            </Text>

            {/* 삭제 버튼 */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteOutfit}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <>
                  <Trash2 size={18} color={colors.error} />
                  <Text style={styles.deleteButtonText}>{t("deleteOutfit")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SoftSheet>

      {/* 전체 저장된 코디 목록 바텀시트 */}
      <SoftSheet
        open={isAllOutfitsSheetOpen}
        onClose={() => setIsAllOutfitsSheetOpen(false)}
      >
        <View style={styles.allOutfitsContainer}>
          <View style={styles.outfitSheetHeader}>
            <Text style={styles.outfitSheetTitle}>{t("savedOutfits")}</Text>
            <TouchableOpacity onPress={() => setIsAllOutfitsSheetOpen(false)}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {allOutfitsLoading && (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.textPrimary} />
            </View>
          )}

          {!allOutfitsLoading && allOutfits.length === 0 && (
            <View style={styles.emptyState}>
              <Sparkles size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>{t("noSavedOutfits")}</Text>
            </View>
          )}

          {!allOutfitsLoading && (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.allOutfitsScroll}>
              {allOutfits.map((outfit) => (
                <TouchableOpacity
                  key={outfit.id}
                  style={styles.savedCard}
                  onPress={() => {
                    setIsAllOutfitsSheetOpen(false);
                    setTimeout(() => handleOpenOutfitDetail(outfit), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: outfit.coverImage }}
                    style={styles.savedThumb}
                  />
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedTitle}>
                      {t("compatibilityScore", { score: outfit.compatibility })}
                    </Text>
                    <Text style={styles.savedSubtitle}>
                      {new Intl.DateTimeFormat(language, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(outfit.savedAt)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </SoftSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionTitleInRow: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  actionCard: {
    alignItems: "center",
    gap: 10,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 44,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 14,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...shadows.small,
  },
  savedThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.bgTertiary,
    marginRight: 14,
  },
  savedInfo: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  savedSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textTertiary,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 13,
    color: colors.error,
  },

  statsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  statCardWide: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    gap: 16,
    ...shadows.small,
  },
  statCardSlim: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...shadows.small,
  },
  legendContainer: {
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // 저장된 코디 상세 바텀시트 스타일
  outfitSheetContainer: {
    paddingBottom: 20,
  },
  outfitSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  outfitSheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  outfitScoreBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  outfitScoreText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  outfitItemsScroll: {
    marginBottom: 20,
  },
  outfitItemCard: {
    width: 120,
    marginRight: 12,
  },
  outfitItemImage: {
    width: 120,
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.bgTertiary,
    marginBottom: 8,
  },
  outfitItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  outfitItemCategory: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  outfitAdviceCard: {
    backgroundColor: colors.softCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  outfitAdviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  outfitAdviceText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  outfitSavedDate: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: "transparent",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.error,
  },

  // 전체 저장된 코디 목록 스타일
  allOutfitsContainer: {
    paddingBottom: 20,
    maxHeight: 500,
  },
  allOutfitsScroll: {
    maxHeight: 400,
  },
});
