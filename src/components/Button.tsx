import React from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryBg;
      case "secondary":
        return styles.secondaryBg;
      case "tertiary":
        return styles.tertiaryBg;
      case "danger":
        return styles.dangerBg;
      case "ghost":
        return styles.ghostBg;
      default:
        return styles.primaryBg;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "tertiary":
        return styles.tertiaryText;
      case "danger":
        return styles.dangerText;
      case "ghost":
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return styles.sizeSmall;
      case "large":
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case "small":
        return typography.buttonSmall;
      case "large":
        return typography.button;
      default:
        return typography.buttonSmall;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 22;
      default:
        return 18;
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case "primary":
      case "danger":
        return colors.white;
      case "secondary":
      case "tertiary":
      case "ghost":
        return colors.textPrimary;
      default:
        return colors.white;
    }
  };

  const getLoadingColor = (): string => {
    switch (variant) {
      case "primary":
      case "danger":
        return colors.white;
      default:
        return colors.brand;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={getLoadingColor()} />
          <Text
            style={[
              styles.txt,
              getTextSizeStyle(),
              getTextStyle(),
              { marginLeft: spacing.sm },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View
          style={[
            styles.contentContainer,
            iconPosition === "right" && styles.contentReverse,
          ]}
        >
          <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
          <Text
            style={[
              styles.txt,
              getTextSizeStyle(),
              getTextStyle(),
              iconPosition === "left"
                ? { marginLeft: spacing.sm }
                : { marginRight: spacing.sm },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      );
    }

    return (
      <Text style={[styles.txt, getTextSizeStyle(), getTextStyle(), textStyle]}>
        {label}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.wrap,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </Pressable>
  );
};

// 편의를 위한 프리셋 컴포넌트들
export const PrimaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button {...props} variant="secondary" />
);

export const TertiaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button {...props} variant="tertiary" />
);

export const DangerButton = (props: Omit<ButtonProps, "variant">) => (
  <Button {...props} variant="danger" />
);

export const GhostButton = (props: Omit<ButtonProps, "variant">) => (
  <Button {...props} variant="ghost" />
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: spacing.minTouchTarget,
  },
  fullWidth: {
    width: "100%",
  },

  // Variant backgrounds
  primaryBg: {
    backgroundColor: colors.brand,
    ...Platform.select({
      ios: shadows.medium,
      android: { elevation: shadows.medium.elevation },
    }),
  },
  secondaryBg: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  tertiaryBg: {
    backgroundColor: colors.softCard,
  },
  dangerBg: {
    backgroundColor: colors.error,
    ...Platform.select({
      ios: shadows.medium,
      android: { elevation: shadows.medium.elevation },
    }),
  },
  ghostBg: {
    backgroundColor: "transparent",
  },

  // Variant text colors
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  tertiaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.white,
  },
  ghostText: {
    color: colors.brand,
  },

  // Size variations
  sizeSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  sizeMedium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sizeLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
  },

  // States
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    ...Platform.select({
      ios: shadows.small,
      android: { elevation: shadows.small.elevation },
    }),
  },
  disabled: {
    opacity: 0.5,
  },

  // Content
  txt: {
    fontWeight: "600",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentReverse: {
    flexDirection: "row-reverse",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Button;
