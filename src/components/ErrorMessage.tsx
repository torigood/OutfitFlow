import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
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
  if (variant === "inline") {
    return (
      <View style={[styles.inlineContainer, style]}>
        <Ionicons
          name="alert-circle"
          size={16}
          color={colors.error}
          style={styles.inlineIcon}
        />
        <Text style={styles.inlineText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.inlineRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === "fullscreen") {
    return (
      <View style={[styles.fullscreenContainer, style]}>
        <Ionicons
          name="cloud-offline-outline"
          size={64}
          color={colors.textTertiary}
        />
        <Text style={styles.fullscreenText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.fullscreenRetryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.fullscreenRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: card variant
  return (
    <View style={[styles.cardContainer, style]}>
      <View style={styles.cardContent}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="warning-outline" size={24} color={colors.error} />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>오류가 발생했습니다</Text>
          <Text style={styles.cardMessage}>{message}</Text>
        </View>
      </View>
      {onRetry && (
        <TouchableOpacity
          style={styles.cardRetryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={colors.brand} />
          <Text style={styles.cardRetryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Inline variant
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255, 59, 48, 0.08)",
    borderRadius: 8,
    gap: spacing.sm,
  },
  inlineIcon: {
    flexShrink: 0,
  },
  inlineText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  inlineRetryText: {
    ...typography.captionBold,
    color: colors.error,
    textDecorationLine: "underline",
  },

  // Card variant
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginHorizontal: spacing.screenPadding,
    marginVertical: spacing.md,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardMessage: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  cardRetryText: {
    ...typography.buttonSmall,
    color: colors.brand,
  },

  // Fullscreen variant
  fullscreenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  fullscreenText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  fullscreenRetryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    gap: spacing.sm,
  },
  fullscreenRetryText: {
    ...typography.button,
    color: colors.white,
  },
});

export default ErrorMessage;
