import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag, Tag, TrendingUp, Search } from "lucide-react-native";
import { SoftCard } from "../components";
import { colors } from "../theme/colors";

const categories = ["전체", "상의", "하의", "아우터", "신발", "악세사리"];

export default function ShoppingScreen() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Category Tabs */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Empty State */}
        <View style={styles.section}>
          <SoftCard>
            <View style={styles.emptyState}>
              <ShoppingBag size={64} color={colors.brandLight} />
              <Text style={styles.emptyTitle}>쇼핑 기능 준비 중</Text>
              <Text style={styles.emptyDescription}>
                곧 다양한 쇼핑 상품을{"\n"}추천받을 수 있어요
              </Text>
            </View>
          </SoftCard>
        </View>

        {/* Placeholder Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 상품</Text>
          <View style={styles.productGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.productCard}>
                <View style={styles.productImage}>
                  <Tag size={24} color={colors.brandLight} />
                </View>
                <Text style={styles.productName}>상품명</Text>
                <Text style={styles.productPrice}>₩0,000</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingTop: 20,
  },
  categories: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: colors.softCard,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textOnLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textOnLight,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: colors.softCard,
    borderRadius: 12,
    padding: 12,
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textOnLight,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: "600",
  },
});
