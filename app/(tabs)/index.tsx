import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { ProgressRing } from "@/components/progress-ring";
import { SectionHeader } from "@/components/section-header";
import { ActionButton } from "@/components/action-button";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const userProfile = useAppStore((state) => state.userProfile);
  const dailyStats = useAppStore((state) => state.dailyStats);
  const streaks = useAppStore((state) => state.streaks);
  const workoutTemplates = useAppStore((state) => state.workoutTemplates);
  const loadSampleData = useAppStore((state) => state.loadSampleData);

  useEffect(() => {
    if (dailyStats.length === 0) {
      loadSampleData();
    }
  }, [dailyStats.length, loadSampleData]);

  const userName = userProfile?.name ?? "Alex";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const todayDate = new Date().toISOString().split("T")[0];
  const todayStats = useMemo(
    () => dailyStats.find((s) => s.date === todayDate),
    [dailyStats, todayDate]
  );

  // Goals
  const stepGoal = userProfile?.dailyStepGoal ?? 10000;
  const calorieGoal = userProfile?.dailyCalorieTarget ?? 600;
  const activeMinGoal = 60;
  const waterGoal = userProfile?.dailyWaterGoal ?? 3000;

  // Current values
  const steps = todayStats?.steps ?? 0;
  const calories = todayStats?.caloriesBurned ?? 0;
  const activeMin = todayStats?.activeMinutes ?? 0;
  const water = todayStats?.waterIntake ?? 0;

  // Progress percentages (capped at 100)
  const stepsProgress = Math.min((steps / stepGoal) * 100, 100);
  const caloriesProgress = Math.min((calories / calorieGoal) * 100, 100);
  const activeMinProgress = Math.min((activeMin / activeMinGoal) * 100, 100);
  const waterProgress = Math.min((water / waterGoal) * 100, 100);

  // Weekly data for bar chart (last 7 days of dailyStats)
  const weeklyData = useMemo(() => {
    const sorted = [...dailyStats]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
    return sorted.map((s) => s.steps);
  }, [dailyStats]);

  const maxSteps = Math.max(...weeklyData, 1);

  // Find a suggested workout
  const suggestedWorkout = workoutTemplates.find((t) => t.isFavorite) ?? workoutTemplates[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(500)}
          style={styles.header}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {userName}!
            </Text>
          </View>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + "26" },
            ]}
          >
            {userProfile?.avatarUri ? (
              <View style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {initials}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Streak Badge */}
        {streaks.currentStreak > 0 && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={[
              styles.streakBadge,
              {
                backgroundColor: colors.accent + "1A",
                borderColor: colors.accent + "33",
              },
            ]}
          >
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: colors.accent }]}>
              {streaks.currentStreak} Day Streak - Keep it up!
            </Text>
          </Animated.View>
        )}

        {/* Daily Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="Today's Progress" style={{ marginBottom: 14 }} />
          <View style={styles.statsRow}>
            <StatRingItem
              label="Steps"
              value={steps.toLocaleString()}
              progress={stepsProgress}
              color={colors.primary}
              bgColor={colors.surface}
              borderColor={colors.border}
              textColor={colors.textPrimary}
              subColor={colors.textSecondary}
            />
            <StatRingItem
              label="Calories"
              value={`${calories}`}
              progress={caloriesProgress}
              color={colors.accent}
              bgColor={colors.surface}
              borderColor={colors.border}
              textColor={colors.textPrimary}
              subColor={colors.textSecondary}
            />
            <StatRingItem
              label="Active Min"
              value={`${activeMin}`}
              progress={activeMinProgress}
              color={colors.success}
              bgColor={colors.surface}
              borderColor={colors.border}
              textColor={colors.textPrimary}
              subColor={colors.textSecondary}
            />
            <StatRingItem
              label="Water"
              value={`${(water / 1000).toFixed(1)}L`}
              progress={waterProgress}
              color="#7C5CFC"
              bgColor={colors.surface}
              borderColor={colors.border}
              textColor={colors.textPrimary}
              subColor={colors.textSecondary}
            />
          </View>
        </Animated.View>

        {/* Weekly Activity Chart */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader
            title="Weekly Activity"
            style={{ marginTop: 28, marginBottom: 14 }}
          />
          <View
            style={[
              styles.chartCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.chartContainer}>
              {weeklyData.map((value, index) => {
                const height = Math.max((value / maxSteps) * 100, 6);
                const opacity = 0.4 + (value / maxSteps) * 0.6;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${height}%`,
                            backgroundColor: colors.primary,
                            opacity,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.barLabel, { color: colors.textSecondary }]}
                    >
                      {DAY_LABELS[index % 7]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Today's Goals Card */}
        {suggestedWorkout && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader
              title="Today's Goal"
              style={{ marginTop: 28, marginBottom: 14 }}
            />
            <Pressable
              style={[
                styles.goalCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.goalIconContainer,
                  { backgroundColor: colors.primary + "1A" },
                ]}
              >
                <Ionicons name="barbell-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                  {suggestedWorkout.name}
                </Text>
                <Text style={[styles.goalMeta, { color: colors.textSecondary }]}>
                  {suggestedWorkout.estimatedDuration} min ·{" "}
                  {suggestedWorkout.difficulty.charAt(0).toUpperCase() +
                    suggestedWorkout.difficulty.slice(1)}{" "}
                  · {suggestedWorkout.exercises.length} exercises
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </Animated.View>
        )}

        {/* Completion Rate */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View
            style={[
              styles.completionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.completionLabel, { color: colors.textSecondary }]}
              >
                Daily Goal Completion
              </Text>
              <Text
                style={[styles.completionValue, { color: colors.textPrimary }]}
              >
                {todayStats?.goalCompletionRate ?? 0}%
              </Text>
            </View>
            <ProgressRing
              progress={todayStats?.goalCompletionRate ?? 0}
              size={56}
              strokeWidth={6}
              color={colors.success}
              backgroundColor={colors.border}
            >
              <Ionicons name="checkmark" size={18} color={colors.success} />
            </ProgressRing>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Quick Start Floating Button */}
      <View
        style={[
          styles.fabContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <ActionButton
          title="Quick Start Workout"
          icon="play"
          onPress={() => router.push("/(tabs)/workouts")}
          style={styles.fab}
        />
      </View>
    </View>
  );
}

// --- Mini stat ring item ---
interface StatRingItemProps {
  label: string;
  value: string;
  progress: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  subColor: string;
}

function StatRingItem({
  label,
  value,
  progress,
  color,
  bgColor,
  borderColor,
  textColor,
  subColor,
}: StatRingItemProps) {
  return (
    <View
      style={[
        styles.statItem,
        { backgroundColor: bgColor, borderColor },
      ]}
    >
      <ProgressRing
        progress={progress}
        size={52}
        strokeWidth={5}
        color={color}
        backgroundColor={borderColor}
      >
        <Text style={[styles.statPercentage, { color }]}>
          {Math.round(progress)}%
        </Text>
      </ProgressRing>
      <Text
        style={[styles.statValue, { color: textColor }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: subColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    marginBottom: 2,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 26,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    marginBottom: 24,
    gap: 6,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 6,
  },
  statPercentage: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    fontVariant: ["tabular-nums"],
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
  },
  chartCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 20,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    borderRadius: 6,
    borderCurve: "continuous",
    minHeight: 6,
  },
  barLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    marginTop: 8,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: 14,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  goalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    marginBottom: 3,
  },
  goalMeta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  completionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    marginTop: 28,
  },
  completionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginBottom: 4,
  },
  completionValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
  },
  fabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    pointerEvents: "box-none",
  },
  fab: {
    borderRadius: 16,
    borderCurve: "continuous",
  },
});
