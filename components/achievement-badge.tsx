import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface AchievementBadgeProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isUnlocked: boolean;
  description?: string;
}

export function AchievementBadge({
  title,
  icon,
  isUnlocked,
  description,
}: AchievementBadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderCurve: "continuous",
        padding: 16,
        borderWidth: 1,
        borderColor: isUnlocked ? colors.primary + "40" : colors.border,
        alignItems: "center",
        opacity: isUnlocked ? 1 : 0.55,
        minWidth: 110,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isUnlocked
            ? colors.primary + "1A"
            : colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Ionicons
          name={isUnlocked ? icon : "lock-closed"}
          size={26}
          color={isUnlocked ? colors.primary : colors.textSecondary}
        />
      </View>

      <Text
        style={{
          fontFamily: Fonts.semiBold,
          fontSize: 13,
          color: colors.textPrimary,
          textAlign: "center",
          marginBottom: description ? 4 : 0,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 11,
            color: colors.textSecondary,
            textAlign: "center",
          }}
          numberOfLines={2}
        >
          {description}
        </Text>
      )}
    </View>
  );
}
