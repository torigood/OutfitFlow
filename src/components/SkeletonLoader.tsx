import React, { useEffect } from "react";
import { View, ViewStyle, Dimensions, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../contexts/ThemeContext";
import { spacing } from "../theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonProps {
  width?: DimensionValue;
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
  const { colors } = useTheme();
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

  const baseStyle: ViewStyle = {
    backgroundColor: colors.softCard,
    width,
    height,
    borderRadius,
  };

  return (
    <Animated.View
      style={[baseStyle, animatedStyle, style]}
    />
  );
};

// 카드 스켈레톤 (옷장 아이템용)
export const SkeletonCard = ({ style }: { style?: ViewStyle }) => {
  const { colors } = useTheme();
  const cardWidth = (SCREEN_WIDTH - spacing.screenPadding * 2 - spacing.md) / 2;
  const imageHeight = (cardWidth * 4) / 3;

  const cardStyle: ViewStyle = {
    width: cardWidth,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  };

  return (
    <View style={[cardStyle, style]}>
      <Skeleton width="100%" height={imageHeight} borderRadius={0} />
      <View style={{ padding: spacing.md }}>
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
};

// 리스트 아이템 스켈레톤
export const SkeletonListItem = ({ style }: { style?: ViewStyle }) => {
  const { colors } = useTheme();

  const listItemStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    marginBottom: spacing.sm,
  };

  return (
    <View style={[listItemStyle, style]}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
};

// 코디 미리보기 스켈레톤 (HomeScreen용)
export const SkeletonOutfitPreview = ({ style }: { style?: ViewStyle }) => {
  const { colors } = useTheme();

  const previewStyle: ViewStyle = {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <View style={[previewStyle, style]}>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md }}>
        <Skeleton width={80} height={100} borderRadius={8} />
        <Skeleton width={80} height={100} borderRadius={8} />
        <Skeleton width={80} height={100} borderRadius={8} />
      </View>
      <View style={{ marginTop: spacing.sm }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
};

// 통계 카드 스켈레톤 (HomeScreen용)
export const SkeletonStatsCard = ({ style }: { style?: ViewStyle }) => {
  const { colors } = useTheme();

  const statsCardStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <View style={[statsCardStyle, style]}>
      <Skeleton width={120} height={120} borderRadius={60} />
      <View style={{ flex: 1, marginLeft: spacing.lg }}>
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
    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.screenPadding, gap: spacing.md }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

// 홈 화면 스켈레톤
export const SkeletonHomeScreen = () => {
  return (
    <View style={{ padding: spacing.screenPadding }}>
      {/* Quick Actions */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xxl }}>
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
      <View style={{ marginBottom: spacing.xxl }}>
        <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
        <SkeletonOutfitPreview />
        <SkeletonOutfitPreview style={{ marginTop: 12 }} />
      </View>

      {/* Stats */}
      <View style={{ marginBottom: spacing.xxl }}>
        <Skeleton width={100} height={20} style={{ marginBottom: 16 }} />
        <SkeletonStatsCard />
      </View>
    </View>
  );
};

export default Skeleton;
