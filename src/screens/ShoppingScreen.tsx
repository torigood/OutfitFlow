import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Heart, ExternalLink, Store } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { t, tCategory, CategoryKey } from "../localization/i18n";
import {
  searchProducts,
  saveProduct,
  getSavedProducts,
  removeSavedProduct,
  formatPrice,
} from "../services/shoppingService";
import { NaverProduct, SavedProduct, ShoppingCategory } from "../types/shopping";

type TabType = "search" | "saved";

const CATEGORY_KEYS: ShoppingCategory[] = [
  "all",
  "tops",
  "bottoms",
  "outer",
  "shoes",
  "accessories",
];

export default function ShoppingScreen() {
  const { user } = useAuth();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory>("all");

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 데이터 상태
  const [products, setProducts] = useState<NaverProduct[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // 모달 상태
  const [selectedProduct, setSelectedProduct] = useState<NaverProduct | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // 초기 로드
  useEffect(() => {
    if (user) {
      loadSavedProducts();
      handleSearch();
    }
  }, [user]);

  // 저장된 상품 로드
  const loadSavedProducts = async () => {
    if (!user) return;
    try {
      const saved = await getSavedProducts(user.uid);
      setSavedProducts(saved);
      setSavedProductIds(new Set(saved.map((p) => p.productId)));
    } catch (error) {
      console.error("저장된 상품 로드 오류:", error);
    }
  };

  // 상품 검색
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchProducts(searchQuery, selectedCategory);
      setProducts(results);
    } catch (error) {
      Alert.alert(
        t("authAlertTitle"),
        error instanceof Error ? error.message : t("shoppingSearchError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 변경 시 검색
  useEffect(() => {
    if (activeTab === "search") {
      handleSearch();
    }
  }, [selectedCategory]);

  // 새로고침
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "search") {
        await handleSearch();
      } else {
        await loadSavedProducts();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // 상품 저장/삭제 토글
  const toggleSaveProduct = async (product: NaverProduct) => {
    if (!user) return;

    const productId = product.productId;
    setIsSaving(productId);

    try {
      if (savedProductIds.has(productId)) {
        // 삭제
        const savedProduct = savedProducts.find((p) => p.productId === productId);
        if (savedProduct) {
          await removeSavedProduct(user.uid, savedProduct.id);
          setSavedProducts((prev) => prev.filter((p) => p.productId !== productId));
          setSavedProductIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // 저장
        await saveProduct(user.uid, product);
        await loadSavedProducts();
      }
    } catch (error) {
      Alert.alert(
        t("authAlertTitle"),
        error instanceof Error ? error.message : t("shoppingSaveError")
      );
    } finally {
      setIsSaving(null);
    }
  };

  // 저장된 상품 삭제
  const handleRemoveSaved = async (savedProduct: SavedProduct) => {
    if (!user) return;

    Alert.alert(
      t("deleteItemConfirmTitle"),
      t("deleteItemConfirmMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirmDelete"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeSavedProduct(user.uid, savedProduct.id);
              setSavedProducts((prev) =>
                prev.filter((p) => p.id !== savedProduct.id)
              );
              setSavedProductIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(savedProduct.productId);
                return newSet;
              });
            } catch (error) {
              Alert.alert(t("authAlertTitle"), t("shoppingDeleteError"));
            }
          },
        },
      ]
    );
  };

  // 외부 링크 열기
  const openProductLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      // 브라우저 열기 실패 시 기본 링크 열기
      Linking.openURL(url);
    }
  };

  // 상품 상세 모달 열기
  const openDetailModal = (product: NaverProduct) => {
    setSelectedProduct(product);
    setIsDetailModalVisible(true);
  };

  // 상품 카드 렌더링
  const renderProductCard = (product: NaverProduct) => {
    const isSaved = savedProductIds.has(product.productId);
    const isCurrentlySaving = isSaving === product.productId;

    return (
      <TouchableOpacity
        key={product.productId}
        style={styles.productCard}
        onPress={() => openDetailModal(product)}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.heartButton, isSaved && styles.heartButtonActive]}
            onPress={() => toggleSaveProduct(product)}
            disabled={isCurrentlySaving}
          >
            {isCurrentlySaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Heart
                size={18}
                color={isSaved ? colors.white : colors.textSecondary}
                fill={isSaved ? colors.white : "transparent"}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productMall}>{product.mallName}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(product.lprice)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 저장된 상품 카드 렌더링
  const renderSavedProductCard = (product: SavedProduct) => {
    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => openProductLink(product.link)}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.heartButton, styles.heartButtonActive]}
            onPress={() => handleRemoveSaved(product)}
          >
            <Heart size={18} color={colors.white} fill={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productMall}>{product.mallName}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("shoppingTab")}</Text>
      </View>

      {/* 검색창 */}
      <View style={styles.searchSection}>
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
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 탭 전환 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "search" && styles.tabActive]}
          onPress={() => setActiveTab("search")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "search" && styles.tabTextActive,
            ]}
          >
            {t("shopping")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.tabActive]}
          onPress={() => setActiveTab("saved")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "saved" && styles.tabTextActive,
            ]}
          >
            {t("saved")} ({savedProducts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 필터 (검색 탭에서만) */}
      {activeTab === "search" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
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
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {tCategory(category as CategoryKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 상품 리스트 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.brand]}
            tintColor={colors.brand}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>
              {activeTab === "search" ? t("shoppingSearching") : t("shoppingLoading")}
            </Text>
          </View>
        ) : activeTab === "search" ? (
          products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map(renderProductCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Store size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t("emptyItems")}</Text>
              <Text style={styles.emptyDescription}>
                {t("shoppingEmptySearch")}
              </Text>
            </View>
          )
        ) : savedProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {savedProducts.map(renderSavedProductCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Heart size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>{t("emptyItems")}</Text>
            <Text style={styles.emptyDescription}>
              {t("shoppingEmptySaved")}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 상품 상세 모달 */}
      <Modal
        visible={isDetailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t("itemDetail")}</Text>
                  <TouchableOpacity
                    onPress={() => setIsDetailModalVisible(false)}
                  >
                    <Ionicons name="close" size={28} color={colors.textOnLight} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />

                  <View style={styles.modalInfo}>
                    <Text style={styles.modalMall}>{selectedProduct.mallName}</Text>
                    <Text style={styles.modalProductName}>
                      {selectedProduct.title}
                    </Text>
                    <Text style={styles.modalPrice}>
                      {formatPrice(selectedProduct.lprice)}
                    </Text>

                    {selectedProduct.brand && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>{t("brand")}</Text>
                        <Text style={styles.modalValue}>{selectedProduct.brand}</Text>
                      </View>
                    )}

                    {selectedProduct.category1 && (
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>{t("category")}</Text>
                        <Text style={styles.modalValue}>
                          {[
                            selectedProduct.category1,
                            selectedProduct.category2,
                            selectedProduct.category3,
                          ]
                            .filter(Boolean)
                            .join(" > ")}
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      savedProductIds.has(selectedProduct.productId)
                        ? styles.actionButtonSaved
                        : styles.actionButtonSave,
                    ]}
                    onPress={() => toggleSaveProduct(selectedProduct)}
                  >
                    <Heart
                      size={20}
                      color={colors.white}
                      fill={
                        savedProductIds.has(selectedProduct.productId)
                          ? colors.white
                          : "transparent"
                      }
                    />
                    <Text style={styles.actionButtonText}>
                      {savedProductIds.has(selectedProduct.productId)
                        ? t("saved")
                        : t("saveOutfit")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => {
                      setIsDetailModalVisible(false);
                      openProductLink(selectedProduct.link);
                    }}
                  >
                    <ExternalLink size={20} color={colors.white} />
                    <Text style={styles.actionButtonText}>
                      {selectedProduct.mallName}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textOnLight,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.softCard,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textOnLight,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.softCard,
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  categoryContainer: {
    backgroundColor: colors.white,
    maxHeight: 50,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.softCard,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.brand,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    color: colors.textSecondary,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.softCard,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  heartButtonActive: {
    backgroundColor: colors.error,
  },
  productInfo: {
    padding: 12,
  },
  productMall: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textOnLight,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textOnLight,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.softCard,
  },
  modalInfo: {
    padding: 20,
  },
  modalMall: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textOnLight,
    marginBottom: 12,
    lineHeight: 22,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand,
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalValue: {
    fontSize: 14,
    color: colors.textOnLight,
    flex: 1,
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonSave: {
    backgroundColor: colors.textSecondary,
  },
  actionButtonSaved: {
    backgroundColor: colors.error,
  },
  actionButtonPrimary: {
    backgroundColor: colors.brand,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});
