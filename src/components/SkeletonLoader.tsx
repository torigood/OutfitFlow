import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// 기본 스켈레톤 박스
export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmerValue.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
};

// 카드 스켈레톤 (옷장 아이템용)
export const SkeletonCard = ({ style }: { style?: ViewStyle }) => {
  const cardWidth = (SCREEN_WIDTH - spacing.screenPadding * 2 - spacing.md) / 2;
  const imageHeight = (cardWidth * 4) / 3;

  return (
    <View style={[styles.card, { width: cardWidth }, style]}>
      <Skeleton width="100%" height={imageHeight} borderRadius={0} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
};

// 리스트 아이템 스켈레톤
export const SkeletonListItem = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
};

// 코디 미리보기 스켈레톤 (HomeScreen용)
export const SkeletonOutfitPreview = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[styles.outfitPreview, style]}>
      <View style={styles.outfitImages}>
        <Skeleton width={80} height={100} borderRadius={8} />
        <Skeleton width={80} height={100} borderRadius={8} />
        <Skeleton width={80} height={100} borderRadius={8} />
      </View>
      <View style={styles.outfitInfo}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
};

// 통계 카드 스켈레톤 (HomeScreen용)
export const SkeletonStatsCard = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={[styles.statsCard, style]}>
      <Skeleton width={120} height={120} borderRadius={60} />
      <View style={styles.statsInfo}>
        <Skeleton width="80%" height={18} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
};

// 옷장 그리드 스켈레톤
export const SkeletonWardrobeGrid = ({ count = 4 }: { count?: number }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

// 홈 화면 스켈레톤
export const SkeletonHomeScreen = () => {
  return (
    <View style={styles.homeContainer}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            width={80}
            height={80}
            borderRadius={16}
          />
        ))}
      </View>

      {/* Saved Outfits */}
      <View style={styles.section}>
        <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
        <SkeletonOutfitPreview />
        <SkeletonOutfitPreview style={{ marginTop: 12 }} />
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Skeleton width={100} height={20} style={{ marginBottom: 16 }} />
        <SkeletonStatsCard />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.softCard,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  outfitPreview: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outfitImages: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  outfitInfo: {
    marginTop: spacing.sm,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.md,
  },
  homeContainer: {
    padding: spacing.screenPadding,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
});

export default Skeleton;
