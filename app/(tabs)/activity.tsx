import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { ActionButton } from "@/components/action-button";
import { ActivityCard } from "@/components/activity-card";
import { SectionHeader } from "@/components/section-header";
import type { ActivityType } from "@/store/types";

const ACTIVITY_TYPES: { key: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "running", label: "Running", icon: "footsteps-outline" },
  { key: "walking", label: "Walking", icon: "walk-outline" },
  { key: "cycling", label: "Cycling", icon: "bicycle-outline" },
  { key: "hiking", label: "Hiking", icon: "trail-sign-outline" },
];

const MODE_TABS = ["Outdoor Run", "Real Time"] as const;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatPace(paceMinPerKm: number): string {
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, "0")}"`;
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const activities = useAppStore((state) => state.activities);
  const activeActivity = useAppStore((state) => state.activeActivity);
  const startActivity = useAppStore((state) => state.startActivity);
  const endActivity = useAppStore((state) => state.endActivity);

  const [selectedType, setSelectedType] = useState<ActivityType>("running");
  const [selectedMode, setSelectedMode] = useState<typeof MODE_TABS[number]>("Outdoor Run");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (activeActivity) {
      const startTime = new Date(activeActivity.startedAt).getTime();
      // Initialize elapsed time from when activity started
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - startTime) / 1000));

      intervalRef.current = setInterval(() => {
        const current = Date.now();
        setElapsedSeconds(Math.floor((current - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeActivity]);

  const handleStart = useCallback(() => {
    const id = `activity-${Date.now()}`;
    startActivity({
      id,
      type: selectedType,
      duration: 0,
      distance: 0,
      steps: 0,
      pace: 0,
      caloriesBurned: 0,
      route: [],
      startedAt: new Date().toISOString(),
    });
  }, [selectedType, startActivity]);

  const handleStop = useCallback(() => {
    if (!activeActivity) return;
    const durationMin = Math.round(elapsedSeconds / 60);
    // Simulated values based on elapsed time
    const distance = parseFloat((elapsedSeconds * 0.0022).toFixed(2));
    const calories = Math.round(elapsedSeconds * 0.15);
    const pace = distance > 0 ? parseFloat(((durationMin / distance)).toFixed(2)) : 0;

    endActivity(activeActivity.id, {
      duration: durationMin,
      distance,
      caloriesBurned: calories,
      pace,
      steps: Math.round(elapsedSeconds * 2.5),
    });
  }, [activeActivity, elapsedSeconds, endActivity]);

  // Simulated live stats
  const liveDistance = (elapsedSeconds * 0.0022).toFixed(2);
  const liveCalories = Math.round(elapsedSeconds * 0.15);
  const livePaceMinPerKm = elapsedSeconds > 10
    ? (elapsedSeconds / 60) / parseFloat(liveDistance || "1")
    : 0;

  const selectedLabel = ACTIVITY_TYPES.find((t) => t.key === selectedType)?.label ?? "Running";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            {selectedLabel}
          </Text>
        </Animated.View>

        {/* Mode Tabs */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.modeTabsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {MODE_TABS.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setSelectedMode(mode)}
              style={[
                styles.modeTab,
                selectedMode === mode && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: selectedMode === mode ? "#0A0E1A" : colors.textSecondary,
                    fontFamily: selectedMode === mode ? Fonts.semiBold : Fonts.medium,
                  },
                ]}
              >
                {mode}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Activity Type Pills */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillsScroll}
            contentContainerStyle={styles.pillsContent}
          >
            {ACTIVITY_TYPES.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <Pressable
                  key={type.key}
                  onPress={() => {
                    if (!activeActivity) setSelectedType(type.key);
                  }}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={isActive ? "#0A0E1A" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isActive ? "#0A0E1A" : colors.textSecondary,
                        fontFamily: isActive ? Fonts.semiBold : Fonts.medium,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Map Placeholder / Route Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Svg width="100%" height={160} viewBox="0 0 320 160">
            {/* Stylized route path */}
            <Path
              d="M 30 130 C 60 110, 80 40, 120 60 S 180 120, 220 80 S 260 20, 290 50"
              stroke={colors.primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Route dots */}
            <Circle cx={30} cy={130} r={5} fill={colors.primary} />
            <Circle cx={120} cy={60} r={4} fill={colors.primary} opacity={0.7} />
            <Circle cx={220} cy={80} r={4} fill={colors.primary} opacity={0.7} />
            <Circle cx={290} cy={50} r={6} fill={colors.accent} />
            {/* Decorative faded dots */}
            <Circle cx={75} cy={55} r={2} fill={colors.primary} opacity={0.3} />
            <Circle cx={150} cy={100} r={2} fill={colors.primary} opacity={0.3} />
            <Circle cx={255} cy={35} r={2} fill={colors.primary} opacity={0.3} />
          </Svg>
        </Animated.View>

        {/* Active Activity Stats or Start Button */}
        {activeActivity ? (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.statsSection}>
            {/* Distance - large */}
            <View style={styles.distanceContainer}>
              <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
                Distance
              </Text>
              <Text style={[styles.distanceValue, { color: colors.textPrimary }]}>
                {liveDistance}
                <Text style={styles.distanceUnit}> km</Text>
              </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Pace
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {livePaceMinPerKm > 0 ? formatPace(livePaceMinPerKm) : "--'--\""}
                </Text>
                <Text style={[styles.statUnit, { color: colors.textSecondary }]}>
                  /km
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatDuration(elapsedSeconds)}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Calories
                </Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {liveCalories}
                </Text>
                <Text style={[styles.statUnit, { color: colors.textSecondary }]}>
                  kcal
                </Text>
              </View>
            </View>

            {/* Control buttons */}
            <View style={styles.controlButtons}>
              <ActionButton
                title="Start/Stop"
                icon="stop-circle-outline"
                variant="primary"
                onPress={handleStop}
                style={{ flex: 1 }}
              />
              <ActionButton
                title="Pause"
                icon="pause-outline"
                variant="accent"
                onPress={handleStop}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.startSection}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name="play" size={32} color="#0A0E1A" />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Recent Activities */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.recentSection}>
          <SectionHeader title="Recent Activities" style={{ marginBottom: 12 }} />

          {activities.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="fitness-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No activities yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start your first activity to see it here
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activities.slice(0, 5).map((activity, index) => {
                const typeLabel =
                  activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
                return (
                  <Animated.View
                    key={activity.id}
                    entering={FadeInDown.delay(400 + index * 80).duration(300)}
                  >
                    <ActivityCard
                      type={typeLabel}
                      duration={activity.duration}
                      distance={activity.distance}
                      calories={activity.caloriesBurned}
                      date={formatRelativeDate(activity.startedAt)}
                    />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    marginBottom: 16,
  },
  modeTabsContainer: {
    flexDirection: "row",
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
    borderCurve: "continuous",
  },
  modeTabText: {
    fontSize: 14,
  },
  pillsScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  pillsContent: {
    gap: 10,
    paddingRight: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  mapCard: {
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  statsSection: {
    marginBottom: 32,
  },
  distanceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  distanceLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginBottom: 4,
  },
  distanceValue: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    ...Platform.select({
      ios: { fontVariant: ["tabular-nums"] },
      android: {},
    }),
  },
  distanceUnit: {
    fontSize: 20,
    fontFamily: Fonts.medium,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    ...Platform.select({
      ios: { fontVariant: ["tabular-nums"] },
      android: {},
    }),
  },
  statUnit: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 12,
  },
  startSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 16,
  },
  startButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#00E5FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#0A0E1A",
    marginTop: 6,
  },
  recentSection: {
    marginTop: 4,
  },
  activityList: {
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  emptyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
});
