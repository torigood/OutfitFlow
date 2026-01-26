import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
  variant?: "inline" | "card" | "fullscreen";
}

export const ErrorMessage = ({
  message,
  onRetry,
  retryText = "다시 시도",
  style,
  variant = "card",
}: ErrorMessageProps) => {
  const { colors } = useTheme();

  // Dynamic styles
  const inlineContainer: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255, 59, 48, 0.08)",
    borderRadius: 8,
    gap: spacing.sm,
  };

  const inlineText: TextStyle = {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  };

  const inlineRetryText: TextStyle = {
    ...typography.captionBold,
    color: colors.error,
    textDecorationLine: "underline",
  };

  const cardContainer: ViewStyle = {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginHorizontal: spacing.screenPadding,
    marginVertical: spacing.md,
  };

  const cardContent: ViewStyle = {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    gap: spacing.md,
  };

  const cardIconContainer: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardTitle: TextStyle = {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  };

  const cardMessage: TextStyle = {
    ...typography.caption,
    color: colors.textSecondary,
  };

  const cardRetryButton: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  };

  const cardRetryText: TextStyle = {
    ...typography.buttonSmall,
    color: colors.brand,
  };

  const fullscreenContainer: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  };

  const fullscreenText: TextStyle = {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  };

  const fullscreenRetryButton: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    gap: spacing.sm,
  };

  const fullscreenRetryText: TextStyle = {
    ...typography.button,
    color: colors.white,
  };

  if (variant === "inline") {
    return (
      <View style={[inlineContainer, style]}>
        <Ionicons
          name="alert-circle"
          size={16}
          color={colors.error}
          style={{ flexShrink: 0 }}
        />
        <Text style={inlineText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={inlineRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === "fullscreen") {
    return (
      <View style={[fullscreenContainer, style]}>
        <Ionicons
          name="cloud-offline-outline"
          size={64}
          color={colors.textTertiary}
        />
        <Text style={fullscreenText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={fullscreenRetryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={fullscreenRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: card variant
  return (
    <View style={[cardContainer, style]}>
      <View style={cardContent}>
        <View style={cardIconContainer}>
          <Ionicons name="warning-outline" size={24} color={colors.error} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cardTitle}>오류가 발생했습니다</Text>
          <Text style={cardMessage}>{message}</Text>
        </View>
      </View>
      {onRetry && (
        <TouchableOpacity
          style={cardRetryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={colors.brand} />
          <Text style={cardRetryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;
