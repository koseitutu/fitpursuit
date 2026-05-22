import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  progress?: number; // 0-100
  color?: string;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  value,
  label,
  progress,
  color,
  style,
}: StatCardProps) {
  const { colors } = useTheme();
  const accentColor = color ?? colors.primary;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderCurve: "continuous",
          padding: 16,
          minWidth: 140,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          borderCurve: "continuous",
          backgroundColor: accentColor + "1A",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>

      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 22,
          color: colors.textPrimary,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 13,
          color: colors.textSecondary,
          marginBottom: progress != null ? 10 : 0,
        }}
      >
        {label}
      </Text>

      {progress != null && (
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              borderRadius: 2,
              backgroundColor: accentColor,
            }}
          />
        </View>
      )}
    </View>
  );
}
