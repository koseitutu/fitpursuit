import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface WorkoutCardProps {
  name: string;
  category: string;
  duration: number; // minutes
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  exercises: number;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

const difficultyColors: Record<string, string> = {
  Beginner: "#00C896",
  Intermediate: "#FFD93D",
  Advanced: "#FF4757",
};

export function WorkoutCard({
  name,
  category,
  duration,
  difficulty,
  exercises,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: WorkoutCardProps) {
  const { colors } = useTheme();

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
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{
              fontFamily: Fonts.semiBold,
              fontSize: 16,
              color: colors.textPrimary,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            {category}
          </Text>
        </View>

        <Pressable
          onPress={onFavoritePress}
          hitSlop={8}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? colors.accent : colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            {duration} min
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons
            name="barbell-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              color: colors.textSecondary,
            }}
          >
            {exercises} exercises
          </Text>
        </View>

        {difficulty && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              borderCurve: "continuous",
              backgroundColor: (difficultyColors[difficulty] ?? colors.primary) + "1A",
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 11,
                color: difficultyColors[difficulty] ?? colors.primary,
              }}
            >
              {difficulty}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
