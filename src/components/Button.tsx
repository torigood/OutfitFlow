import React from "react";
import {
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
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
  const { colors, shadows } = useTheme();
  const isDisabled = disabled || loading;

  const getShadowStyle = (shadowLevel: typeof shadows.medium): ViewStyle => {
    if (Platform.OS === "ios") {
      return shadowLevel;
    }
    return { elevation: shadowLevel.elevation };
  };

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.brand,
          ...getShadowStyle(shadows.medium),
        };
      case "secondary":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case "tertiary":
        return {
          backgroundColor: colors.softCard,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          ...getShadowStyle(shadows.medium),
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {
          backgroundColor: colors.brand,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "primary":
      case "danger":
        return { color: colors.white };
      case "secondary":
      case "tertiary":
        return { color: colors.textPrimary };
      case "ghost":
        return { color: colors.brand };
      default:
        return { color: colors.white };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: 8,
        };
      case "large":
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          borderRadius: 14,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: 12,
        };
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

  const baseStyle: ViewStyle = {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: spacing.minTouchTarget,
  };

  const pressedStyle: ViewStyle = {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    ...getShadowStyle(shadows.small),
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ActivityIndicator size="small" color={getLoadingColor()} />
          <Text
            style={[
              { fontWeight: "600" },
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
            { flexDirection: "row", alignItems: "center" },
            iconPosition === "right" && { flexDirection: "row-reverse" },
          ]}
        >
          <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
          <Text
            style={[
              { fontWeight: "600" },
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
      <Text style={[{ fontWeight: "600" }, getTextSizeStyle(), getTextStyle(), textStyle]}>
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
        baseStyle,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && { width: "100%" },
        pressed && !isDisabled && pressedStyle,
        isDisabled && { opacity: 0.5 },
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

export default Button;
