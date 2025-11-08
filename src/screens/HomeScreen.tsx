import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Shirt, TrendingUp, ShoppingCart } from "lucide-react-native";
import { SoftCard, GlowTile } from "../components";
import { colors } from "../theme/colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 시작</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.actionCard}>
              <GlowTile
                icon={<Sparkles size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>AI 추천</Text>
            </Pressable>
            <Pressable style={styles.actionCard}>
              <GlowTile
                icon={<Shirt size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>옷장</Text>
            </Pressable>
            <Pressable style={styles.actionCard}>
              <GlowTile
                icon={<TrendingUp size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>트렌드</Text>
            </Pressable>
            <Pressable style={styles.actionCard}>
              <GlowTile
                icon={<ShoppingCart size={28} color={colors.brand} />}
                size={72}
              />
              <Text style={styles.actionLabel}>쇼핑</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 추천</Text>
          <SoftCard>
            <View style={styles.emptyState}>
              <Sparkles size={48} color={colors.brandLight} />
              <Text style={styles.emptyText}>아직 추천 내역이 없습니다</Text>
            </View>
          </SoftCard>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 통계</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>보유 아이템</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>코디 수</Text>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textOnLight,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  actionCard: {
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.brand,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
