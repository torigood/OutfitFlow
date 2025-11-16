import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Users } from "lucide-react-native";
import { SoftCard } from "../components";
import { colors } from "../theme/colors";

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        <View style={styles.section}>
          <SoftCard>
            <View style={styles.emptyState}>
              <Users size={64} color={colors.brandLight} />
              <Text style={styles.emptyTitle}>커뮤니티 준비 중</Text>
              <Text style={styles.emptyDescription}>
                곧 다른 사용자들의{"\n"}멋진 코디를 둘러볼 수 있어요
              </Text>
            </View>
          </SoftCard>
        </View>

        {/* Placeholde r Cards */}
        <View style={styles.section}>
          <View style={styles.feedCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.username}>사용자명</Text>
                <Text style={styles.timestamp}>1시간 전</Text>
              </View>
            </View>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>코디 이미지</Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.iconRow}>
                <Heart size={20} color={colors.brand} />
                <Text style={styles.iconText}>0</Text>
              </View>
              <View style={styles.iconRow}>
                <MessageCircle size={20} color={colors.brand} />
                <Text style={styles.iconText}>0</Text>
              </View>
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
    paddingTop: 20,
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
  feedCard: {
    backgroundColor: colors.softCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandLight,
    marginRight: 12,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textOnLight,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 20,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
