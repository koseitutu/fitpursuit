import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface ActivityCardProps {
  type: string;
  duration: number; // minutes
  distance?: number; // km
  calories: number;
  date: string;
  onPress?: () => void;
}

const activityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Running: "footsteps-outline",
  Cycling: "bicycle-outline",
  Swimming: "water-outline",
  Walking: "walk-outline",
  Yoga: "body-outline",
  Strength: "barbell-outline",
};

export function ActivityCard({
  type,
  duration,
  distance,
  calories,
  date,
  onPress,
}: ActivityCardProps) {
  const { colors } = useTheme();
  const icon = activityIcons[type] ?? "fitness-outline";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderCurve: "continuous",
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
        flexDirection: "row",
        alignItems: "center",
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          borderCurve: "continuous",
          backgroundColor: colors.primary + "1A",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 15,
            color: colors.textPrimary,
            marginBottom: 4,
          }}
        >
          {type}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          {date}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {duration} min
          </Text>
        </View>

        {distance != null && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons
              name="navigate-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              {distance.toFixed(1)} km
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="flame-outline" size={14} color={colors.accent} />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 12,
              color: colors.accent,
            }}
          >
            {calories} kcal
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
