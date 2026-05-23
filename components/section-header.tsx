import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Fonts } from "@/constants/Typography";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, onSeeAll, style }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.semiBold,
          fontSize: 18,
          color: colors.textPrimary,
        }}
      >
        {title}
      </Text>

      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          hitSlop={8}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 14,
              color: colors.primary,
            }}
          >
            See All
          </Text>
        </Pressable>
      )}
    </View>
  );
}
