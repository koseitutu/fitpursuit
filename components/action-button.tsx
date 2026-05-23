import React from "react";
import { Text, Pressable, ActivityIndicator, ViewStyle, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function ActionButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  style,
}: ActionButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "accent":
        return colors.accent;
      case "secondary":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case "primary":
        return "#0A0E1A";
      case "accent":
        return "#FFFFFF";
      case "secondary":
        return colors.primary;
      default:
        return "#0A0E1A";
    }
  };

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor,
          borderRadius: 14,
          borderCurve: "continuous",
          paddingVertical: 14,
          paddingHorizontal: 24,
          minHeight: 52,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
          borderWidth: variant === "secondary" ? 1.5 : 0,
          borderColor: variant === "secondary" ? colors.primary : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && <Ionicons name={icon} size={20} color={textColor} />}
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 16,
              color: textColor,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
